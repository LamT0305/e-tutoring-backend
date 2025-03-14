import Schedule from "../models/schedule.model.js";
import Notification from "../models/notification.model.js";
import { sendNotification } from "../socket.js";

// Create a new schedule
export const createSchedule = async (req, res) => {
  const { date, duration, meetingType, note, receiver_id, subject } = req.body;

  if (
    !date ||
    !duration ||
    !subject ||
    !receiver_id ||
    !meetingType ||
    !subject
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const scheduleData = {
      date,
      duration,
      subject,
      meetingType,
      note,
    };

    if (req.user.role_name === "Student") {
      scheduleData.tutor = receiver_id;
      scheduleData.student = req.user.id;
      scheduleData.status = "0";
    } else if (req.user.role_name === "Tutor") {
      scheduleData.tutor = req.user.id;
      scheduleData.student = receiver_id;
      scheduleData.status = "1";
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to create a schedule" });
    }

    const newSchedule = await Schedule.create(scheduleData);
    const noti = await Notification.create({
      user_id: receiver_id,
      title: "New schedule has been requested",
      content: `${req.user.name} has requested a new schedule on ${date}`,
    });

    sendNotification(receiver_id, {
      message: `${req.user.name} has requested a new schedule`,
      noti: noti,
    });
    return res.status(201).json(newSchedule);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//for tutor only
export const viewScheduleRequest = async (req, res) => {
  if (req.user.role_name !== "Tutor")
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });

  try {
    const { page = 1 } = req.query; // Default to page 1 and 10 10
    const query = { tutor: req.user.id, status: "0" };

    const schedules = await Schedule.find(query)
      .skip((page - 1) * 10)
      .limit(10);

    if (!schedules.length) {
      return res.status(404).json({ message: "No schedule found" });
    }

    const total = await Schedule.countDocuments(query);
    const totalPages = Math.ceil(total / 10);

    res.status(200).json({
      schedules,
      totalPages,
      currentPage: page,
      totalSchedules: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//tutor and student
export const filterScheduleByStatus = async (req, res) => {
  try {
    const { status, page } = req.body;

    const query = {};
    if (status) {
      query.status = status;
    }

    if (!page) {
      page = 1;
    }

    if (req.user.role_name === "Student") {
      query.student = req.user.id;
    } else if (req.user.role_name === "Tutor") {
      query.tutor = req.user.id;
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }

    const schedules = await Schedule.find(query)
      .populate("tutor")
      .populate("student")
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    if (!schedules) {
      return res.status(404).json({ message: "No schedule found" });
    }

    const total = await Schedule.countDocuments(query);
    const totalPages = Math.ceil(total / 10);

    res.status(200).json({
      schedules,
      totalPages,
      currentPage: page,
      totalSchedules: total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//tutor
export const updateScheduleStatusByTutor = async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    if (req.user.role_name !== "Tutor") {
      return res
        .status(403)
        .json({ message: "You don't have permission to access this page." });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        status: status,
      },
      {
        new: true,
      }
    );

    const user_id = schedule.student;
    let title = "";
    if (status === "1") {
      title = "Schedule has been accepted";
    } else {
      title = "Schedule has been rejected";
    }
    const noti = await Notification.create({
      user_id: user_id,
      title: title,
      content: `Your ${title.toLowerCase()} by tutor: ${req.user.name}`,
    });

    sendNotification(user_id.toString(), {
      message: title,
      noti: noti,
    });
    res.status(200).json({ message: "Schedule updated.", schedule: schedule });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
