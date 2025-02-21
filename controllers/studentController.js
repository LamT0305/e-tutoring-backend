// CRUD student (done)
import bcrypt from "bcrypt";
import Role from "../models/role.model.js";
import Student from "../models/student.model.js";
import User from "../models/user.model.js";

export const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1} = req.query;

    const students = await Student.find()
      .populate({
        path: "user_id",
        populate: {
          path: "role_id",
          model: "Role",
        },
      })
      .populate("tutor_ids")
      .skip((page - 1) * 10)
      .limit(parseInt(10));

    const total = await Student.countDocuments();
    const totalPages = Math.ceil(total / 10);

    res.status(200).json({
      message: "success",
      students: students,
      totalPages: totalPages,
      currentPage: parseInt(page),
      totalStudents: total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req, res) => {
  if (req.user.role_name !== "Staff") {
    return res.status(403).json({
      message: "Access denied, Only staff members can create students.",
    });
  }

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
    const salt = await bcrypt.genSalt(10); // Tạo một "muối" với độ mạnh 10
    const hashedPassword = await bcrypt.hash(password, salt); // Mã hóa mật khẩu

    const newUser = new User({
      name,
      dateOfBirth,
      address,
      email,
      password: hashedPassword,
      role_id,
    });

    await newUser.save();

    const newStudent = new Student({
      user_id: newUser._id,
      tutor_id: null,
    });

    await newStudent.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newStudent._id,
        name: newUser.name,
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStudent = async (req, res) => {
  const { name, dateOfBirth, address } = req.body;
  if (!name || !dateOfBirth || !address) {
    return res.status(400).json({ message: "All fields must be provided" });
  }
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const user_id = student.user_id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.dateOfBirth = dateOfBirth;
    user.address = address;

    await user.save();
    res.status(200).json({ message: "Updated user successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  if (req.user.role_name !== "Staff") {
    return res.status(403).json({
      message: "Access denied, Only staff members can delete students.",
    });
  }
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const user_id = student.user_id;
    await User.findByIdAndDelete(user_id);
    await Student.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
