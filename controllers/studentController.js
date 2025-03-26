import User from "../models/user.model.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true })
      .select("-password")
      .populate({
        path: "tutors",
        select: "name email avatar subjects",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const createStudent = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(res, 403, "Only staff members can create students");
    }

    const { name, dateOfBirth, address, email, password } = req.body;

    if (
      !name?.trim() ||
      !dateOfBirth ||
      !address?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return errorResponse(res, 400, "All fields are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 400, "Email already exists");
    }

    const newStudent = await User.create({
      name: name.trim(),
      dateOfBirth,
      address: address.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: newStudent.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { name, dateOfBirth, address, subjects } = req.body;

    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    // Check authorization
    if (req.user.role !== "staff" && req.user.id !== student.id) {
      return errorResponse(res, 403, "Not authorized to update this student");
    }

    if (name) student.name = name.trim();
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (address) student.address = address.trim();
    if (subjects) student.subjects = subjects;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: student.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(res, 403, "Only staff members can delete students");
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    // Soft delete
    student.isActive = false;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
      isActive: true,
    })
      .select("-password")
      .populate({
        path: "tutors",
        select: "name email avatar subjects",
      });

    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentTutors = async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
      isActive: true,
    })
      .select("tutors")
      .populate({
        path: "tutors",
        select: "name email avatar subjects rating",
      });

    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    res.status(200).json({
      success: true,
      tutors: student.tutors,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
