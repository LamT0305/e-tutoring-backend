import User from "../models/user.model.js";
import Allocation from "../models/allocation.model.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const createStaff = async (req, res) => {
  try {
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

    const newUser = await User.create({
      name: name.trim(),
      dateOfBirth,
      address: address.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "staff",
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      user: newUser.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStaffList = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can access this resource"
      );
    }

    const staffs = await User.find({ role: "staff", isActive: true })
      .select("-password")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      staffs,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const allocateTutors = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can allocate tutors"
      );
    }

    const { tutorId, studentIds } = req.body;

    const tutor = await User.findOne({
      _id: tutorId,
      role: "tutor",
      isActive: true,
    });
    if (!tutor) {
      return errorResponse(res, 404, "Tutor not found or inactive");
    }

    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
      isActive: true,
    });

    if (students.length !== studentIds.length) {
      return errorResponse(
        res,
        404,
        "One or more students not found or inactive"
      );
    }

    const existingAllocations = await Allocation.find({
      tutor: tutorId,
      student: { $in: studentIds },
    });

    const allocatedStudentIds = existingAllocations.map((allocation) =>
      allocation.student.toString()
    );

    const newStudentIds = studentIds.filter(
      (id) => !allocatedStudentIds.includes(id.toString())
    );

    if (newStudentIds.length === 0) {
      return errorResponse(
        res,
        400,
        "All students are already allocated to this tutor"
      );
    }

    const allocations = await Allocation.insertMany(
      newStudentIds.map((studentId) => ({
        tutor: tutorId,
        student: studentId,
      }))
    );

    res.status(200).json({
      success: true,
      message: "Students allocated successfully",
      allocations,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAllocations = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can view allocations"
      );
    }

    const allocations = await Allocation.find()
      .populate("tutor", "name email")
      .populate("student", "name email")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      allocations,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteAllocation = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can delete allocations"
      );
    }

    const allocation = await Allocation.findById(req.params.id)
      .populate("tutor", "name")
      .populate("student", "name");

    if (!allocation) {
      return errorResponse(res, 404, "Allocation not found");
    }

    await allocation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Allocation deleted successfully",
      allocation,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can perform this action"
      );
    }

    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
    });

    if (!staff) {
      return errorResponse(res, 404, "Staff not found");
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `Staff ${
        staff.isActive ? "activated" : "deactivated"
      } successfully`,
      staff: staff.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
