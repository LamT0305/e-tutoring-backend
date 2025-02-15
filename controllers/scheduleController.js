import Schedule from "../models/schedule.model.js";
// Get all schedules

export const getAllSchedules = async (req, res) => {
  if (req.user.role_name !== "Tutor")
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });
  try {
    const schedules = await Schedule.find({
      tutor: req.user.id,
      status: { $ne: "-1" },
    });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new schedule
export const createSchedule = async (req, res) => {
  const { date, duration, subject, receiver_id } = req.body;
  try {
    if (!date || !duration || !subject || !receiver_id) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (req.user.role_name === "Student") {
      const newSchedule = await Schedule.create({
        tutor: receiver_id,
        student: req.user.id,
        date,
        duration,
        subject,
      });
      return res.status(201).json(newSchedule);
    }
    const newSchedule = await Schedule.create({
      tutor: req.user.id,
      student: receiver_id,
      date: date,
      duration: duration,
      subject: subject,
    });
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing schedule
export const updateStatusSchedule = async (req, res) => {
  if (req.user.role_name !== "Tutor")
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });
  try {
    const status = req.body;
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        status: status,
      },
      { new: true }
    );
    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Get all schedules of a student without status 0
export const getStudentScheduleHistory = async (req, res) => {
  if (req.user.role_name !== "Student")
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });

  try {
    const schedules = await Schedule.find({
      student: req.user._id,
      status: { $ne: "0" },
    });
    if (!schedules) {
      return res.status(404).json({ message: "No schedule found" });
    }
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
