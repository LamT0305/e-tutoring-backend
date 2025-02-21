import Allocation from "../models/allocation.model.js";
import Role from "../models/role.model.js";
import Student from "../models/student.model.js";
import Tutor from "../models/tutor.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const createStaff = async (req, res) => {
  const { name, dateOfBirth, address, email, password, role_id } = req.body;
  if (!name || !dateOfBirth || !address || !email || !password || !role_id) {
    return res.status(400).json({
      message: "All fields are required",
      name: name,
      dateOfBirth: dateOfBirth,
      address: address,
      email: email,
      password: password,
      role_id: role_id,
    });
  }

  try {
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    const isExisted = await User.findOne({ email: email });
    if (isExisted) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      dateOfBirth,
      address,
      email,
      password: hashedPassword,
      role_id,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStaffs = async (req, res) => {
  try {
    const staffs = await User.find({ role_id: req.params.id });
    res.status(200).json({ message: "success", staffs: staffs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: " Server error", error: error.message });
  }
};

export const allocateTutors = async (req, res) => {
  const { tutorId, studentIds } = req.body;

  try {
    if (req.user.role_name != "Staff") {
      return res
        .status(403)
        .json({ message: " Access denied, only staff can allocate tutor" });
    }
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res
        .status(404)
        .json({ message: "One or more students not found" });
    }

    const existingAllocation = await Allocation.find({
      tutor_id: tutorId,
      student_id: { $in: studentIds },
    });

    const allocatedStudentIds = existingAllocation.map((allocation) =>
      allocation.student_id.toString()
    );

    const newStudent = studentIds.filter(
      (id) => !allocatedStudentIds.includes(id.toString())
    );

    if (newStudent.length === 0) {
      return res.status(400).json({
        message: "All students are already allocated",
        existingAllocation: allocatedStudentIds,
      });
    }
    const allocations = newStudent.map((studentId) => ({
      tutor_id: tutorId,
      student_id: studentId,
    }));

    await Allocation.insertMany(allocations);

    await Student.updateMany(
      { _id: { $in: newStudent } },
      { $addToSet: { tutor_ids: tutorId } } //avoid duplicates
    );

    res.status(200).json({
      message: "Allocation successful",
      allocations: allocations,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const viewAllocations = async (req, res) => {
  try {
    if (req.user.role_name != "Staff") {
      return res
        .status(403)
        .json({ message: " Access denied, only staff can view allocation list" });
    }
    console.log(req.user.role_name);
    if (req.user.role_name == "Student") {
      return res
        .status(403)
        .json({
          message: "Access denied, student can not access the allocation list",
        });
    }
    const allocations = await Allocation.find();
    res.status(200).json({ message: "success", allocations: allocations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAllocation = async (req, res) => {
  try {
    console.log(req.user.role_name);

    if (req.user.role_name != "Staff") {
      return res
        .status(403)
        .json({ message: " Access denied, only staff can delete allocation" });
    }
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    const studentId = allocation.student_id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Filter out the tutor_id from the student's tutor_ids
    student.tutor_ids = student.tutor_ids.filter(
      (tutorId) => !tutorId.equals(allocation.tutor_id)
    );
    await student.save();

    await Allocation.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ message: "Allocation deleted successfully", allocation });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
