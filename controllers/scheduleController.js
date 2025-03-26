import Schedule from "../models/schedule.model.js";
import Notification from "../models/notification.model.js";
import { sendNotification } from "../socket.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const createSchedule = async (req, res) => {
  try {
    const {
      startTime,
      endTime,
      duration,
      meetingType,
      notes,
      receiverId,
      subject,
      location,
    } = req.body;

    if (
      !startTime ||
      !endTime ||
      !duration ||
      !subject ||
      !receiverId ||
      !meetingType
    ) {
      return errorResponse(res, 400, "All required fields must be provided");
    }

    const scheduleData = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      subject,
      meetingType,
      notes,
      location: meetingType === "offline" ? location : undefined,
    };

    if (req.user.role === "Student") {
      scheduleData.tutor = receiverId;
      scheduleData.student = req.user.id;
      scheduleData.status = "pending";
    } else if (req.user.role === "Tutor") {
      scheduleData.tutor = req.user.id;
      scheduleData.student = receiverId;
      scheduleData.status = "accepted";
    } else {
      return errorResponse(
        res,
        403,
        "Only students and tutors can create schedules"
      );
    }

    const newSchedule = await Schedule.create(scheduleData);
    await newSchedule.populate([
      { path: "tutor", select: "name email" },
      { path: "student", select: "name email" },
    ]);

    // Create notification
    const notification = await Notification.create({
      recipient: receiverId,
      type: "session",
      title: "New Session Request",
      message: `${req.user.name} has requested a tutoring session for ${subject}`,
      relatedTo: {
        model: "Session",
        id: newSchedule._id,
      },
    });

    if (req.io) {
      req.io.to(receiverId).emit("newSchedule", {
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

export const viewScheduleRequests = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return errorResponse(res, 403, "Only tutors can view schedule requests");
    }

    const schedules = await Schedule.find({
      tutor: req.user.id,
      status: "pending",
    })
      .populate("student", "name email")
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getSchedulesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      ...(status && { status }),
      [req.user.role.toLowerCase()]: req.user.id,
    };

    const schedules = await Schedule.find(query)
      .populate("tutor", "name email")
      .populate("student", "name email")
      .sort({ startTime: -1 });

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
    if (req.user.role !== "Tutor") {
      return errorResponse(res, 403, "Only tutors can update schedule status");
    }

    const { status, meetingLink, reason } = req.body;
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      tutor: req.user.id,
    });

    if (!schedule) {
      return errorResponse(res, 404, "Schedule not found");
    }

    if (status === "cancelled") {
      await schedule.cancelMeeting(reason);
    } else if (status === "completed") {
      await schedule.completeMeeting();
    } else {
      schedule.status = status;
      if (status === "accepted" && schedule.meetingType === "online") {
        schedule.meetingLink = meetingLink;
      }
      await schedule.save();
    }

    // Create notification
    const notification = await Notification.create({
      recipient: schedule.student,
      type: "session",
      title: `Session ${status}`,
      message: `Your session has been ${status} by ${req.user.name}`,
      relatedTo: {
        model: "Session",
        id: schedule._id,
      },
    });

    if (req.io) {
      req.io.to(schedule.student.toString()).emit("scheduleUpdated", {
        schedule,
        notification,
      });
    }

    res.status(200).json({
      success: true,
      message: `Schedule ${status} successfully`,
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
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 400, "Valid rating (1-5) is required");
    }

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      student: req.user.id,
      status: "completed",
    });

    if (!schedule) {
      return errorResponse(res, 404, "Completed schedule not found");
    }

    schedule.feedback = { rating, comment };
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Feedback provided successfully",
      schedule,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
