import Schedule from "../models/schedule.model.js";

// Create a new schedule
export const createSchedule = async (req, res) => {
  const { date, duration, subject, receiver_id, meetingType, note } = req.body;

  if (!date || !duration || !subject || !receiver_id || !meetingType) {
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
    } else if (req.user.role_name === "Tutor") {
      scheduleData.tutor = req.user.id;
      scheduleData.student = receiver_id;
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to create a schedule" });
    }

    const newSchedule = await Schedule.create(scheduleData);
    return res.status(201).json(newSchedule);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  if (req.user.role_name !== "Tutor")
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(200).json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//for tutor only
export const viewScheduleRequest = async (req, res) => {
  if (req.user.role_name !== "Tutor")
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });

  try {
    const { page = 1} = req.query; // Default to page 1 and 10 10
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
    const { page = 1 } = req.query;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const query = {
      status: status,
    };

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
    return res.status(500).json({ message: error.message });
  }
};
