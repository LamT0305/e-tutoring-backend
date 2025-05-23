import Schedule from "../models/schedule.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../services/emailService.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const createSchedule = async (req, res) => {
  try {
    if (req.user.role !== "tutor") {
      return errorResponse(res, 403, "Only tutors can create schedules");
    }

    const {
      startTime,
      endTime,
      meetingType,
      notes,
      studentId,
      subject,
      location,
      meetingLink,
    } = req.body;

    if (!startTime || !endTime || !subject || !studentId || !meetingType) {
      return errorResponse(res, 400, "All required fields must be provided");
    }

    //validate schedule

    const schedules = await Schedule.find({
      tutor: req.user.id,
    });

    const isScheduleOverlapping = schedules.some((schedule) => {
      if (schedule.status === "upcoming") {
        const scheduleStartTime = new Date(schedule.startTime);
        const scheduleEndTime = new Date(schedule.endTime);
        const newStartTime = new Date(startTime);
        const newEndTime = new Date(endTime);
        return (
          (newStartTime >= scheduleStartTime &&
            newStartTime < scheduleEndTime) ||
          (newEndTime > scheduleStartTime && newEndTime <= scheduleEndTime) ||
          (newStartTime <= scheduleStartTime && newEndTime >= scheduleEndTime)
        );
      }
    });

    if (isScheduleOverlapping) {
      return errorResponse(
        res,
        400,
        "The schedule overlaps with an existing schedule"
      );
    }

    const scheduleData = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      subject,
      meetingType,
      notes,
      tutor: req.user.id,
      student: studentId,
      status: "upcoming",
      ...(meetingType === "offline" ? { location } : { meetingLink }),
    };

    const newSchedule = await Schedule.create(scheduleData);
    await newSchedule.populate([
      { path: "tutor", select: "name email" },
      { path: "student", select: "name email" },
    ]);

    // Create notification
    const notification = await Notification.create({
      recipient: studentId,
      type: "session",
      title: "New Session Scheduled",
      message: `${req.user.name} has scheduled a tutoring session for ${subject}`,
      relatedTo: {
        model: "Session",
        id: newSchedule._id,
      },
    });

    try {
      // Send email notification
      const emailContent = `
    <h2>New Tutoring Session Scheduled</h2>
    <p>Tutor: ${req.user.name}</p>
    <p>Subject: ${subject}</p>
    <p>Date: ${new Date(startTime).toLocaleString()}</p>
    <p>Duration: ${Math.floor(
      (new Date(endTime) - new Date(startTime)) / 60000
    )} minutes</p>
    <p>Meeting Type: ${meetingType}</p>
    ${
      meetingType === "offline"
        ? `<p>Location: ${location}</p>`
        : `<p>Meeting Link: ${meetingLink}</p>`
    }
  `;

      await sendEmail(
        newSchedule.student.email,
        "New Tutoring Session Scheduled",
        emailContent
      ).catch((e) => console.error("Email notification failed:", e));
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error: error.message,
      });
    }

    if (req.io) {
      req.io.to(studentId).emit("newSchedule", {
        schedule: newSchedule,
        notification,
      });
    }

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      schedule: newSchedule,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getTutorSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ tutor: req.user.id })
      .populate("tutor", "name email")
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateScheduleStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      [req.user.role.toLowerCase()]: req.user.id,
    })
      .populate("tutor", "name email")
      .populate("student", "name email");

    if (!schedule) {
      return errorResponse(res, 404, "Schedule not found");
    }

    if (status === "completed") {
      if (req.user.role !== "tutor") {
        return errorResponse(
          res,
          403,
          "Only tutors can mark sessions as completed"
        );
      }
      try {
        await schedule.completeMeeting();
      } catch (error) {
        return errorResponse(res, 400, error.message);
      }
    } else if (status === "cancelled") {
      await schedule.cancelMeeting(reason);
    }

    const notification = await Notification.create({
      recipient: schedule.student,
      type: "session",
      title: `Session ${status}`,
      message: `Your session has been marked as ${status} by ${req.user.name}`,
      relatedTo: {
        model: "Session",
        id: schedule._id,
      },
    });

    if (req.io) {
      req.io.to(schedule.student).emit("scheduleUpdated", {
        schedule,
        notification,
      });
    }

    res.status(200).json({
      success: true,
      message: `Schedule marked as ${status} successfully`,
      schedule,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const provideFeedback = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return errorResponse(res, 403, "Only students can provide feedback");
    }

    const { rating, comment } = req.body;
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      student: req.user.id,
      status: "completed",
    });

    if (!schedule) {
      return errorResponse(res, 404, "Completed schedule not found");
    }

    await schedule.addFeedback(rating, comment);

    const notification = await Notification.create({
      recipient: schedule.tutor,
      type: "feedback",
      title: "New Session Feedback",
      message: `${req.user.name} has provided feedback for your session`,
      relatedTo: {
        model: "Session",
        id: schedule._id,
      },
    });

    if (req.io) {
      req.io.to(schedule.tutor.toString()).emit("newFeedback", {
        schedule,
        notification,
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback provided successfully",
      schedule,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ student: req.user.id })
      .populate("tutor", "name email")
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
