import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Allocation from "../models/allocation.model.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const getAllTutors = async (req, res) => {
  try {
    const tutors = await User.find({
      role: "tutor",
      isActive: true,
    })
      .select("-password")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      tutors,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const createTutor = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(res, 403, "Only staff members can create tutors");
    }

    const { name, dateOfBirth, address, email, password } = req.body;

    if (
      !name?.trim() ||
      !dateOfBirth ||
      !address?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return errorResponse(res, 400, "All required fields must be provided");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 400, "Email already exists");
    }

    const newTutor = await User.create({
      name: name.trim(),
      dateOfBirth,
      address: address.trim(),
      email: email.toLowerCase(),
      password,
      role: "tutor",
    });

    res.status(201).json({
      success: true,
      message: "Tutor created successfully",
      tutor: newTutor.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateTutor = async (req, res) => {
  try {
    const { name, dateOfBirth, address } = req.body;

    const tutor = await User.findOne({
      _id: req.params.id,
      role: "tutor",
      isActive: true,
    });

    if (!tutor) {
      return errorResponse(res, 404, "Tutor not found");
    }

    if (req.user.role !== "staff" && req.user.id !== tutor.id) {
      return errorResponse(res, 403, "Not authorized to update this tutor");
    }

    if (name) tutor.name = name.trim();
    if (dateOfBirth) tutor.dateOfBirth = dateOfBirth;
    if (address) tutor.address = address.trim();

    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Tutor updated successfully",
      tutor: tutor.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteTutor = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(res, 403, "Only staff members can delete tutors");
    }

    const tutor = await User.findOne({
      _id: req.params.id,
      role: "tutor",
    });

    if (!tutor) {
      return errorResponse(res, 404, "Tutor not found");
    }

    await tutor.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tutor deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getTutorMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .sort({ created_at: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentsAssignedToTutor = async (req, res) => {
  try {
    const students = await Allocation.find({ tutor_id: req.user.id})
      .populate("student_id", "-password")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

