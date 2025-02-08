// CRUD turtor
import Allocation from "../models/allocation.model.js";
import Message from "../models/message.model.js";
import Role from "../models/role.model.js";
import Statistic from "../models/statistic.model.js";
import Tutor from "../models/tutor.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().populate({
      path: "user_id", // Populate user_id
      populate: {
        path: "role_id", // Populate role_id within user_id
        model: "Role", // Reference the Role model
      },
    });
    res.status(200).json({ message: "success", tutors: tutors });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTutor = async (req, res) => {
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

    const newTutor = await Tutor.create({
      user_id: newUser._id,
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const updateTutor = async (req, res) => {
  const { name, dateOfBirth, address } = req.body;
  if (!name || !dateOfBirth || !address) {
    return res.status(400).json({ message: "All fields must be provided" });
  }
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    const user_id = tutor.user_id;
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

export const deleteTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    const user_id = tutor.user_id;
    await User.findByIdAndDelete(user_id);
    await Tutor.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Tutor deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const viewTutorStudentList = async (req, res) => {
  if (req.user.role_name == "Student") {
    return res.status(403).json({
      message: "Access denied, Student can not access list student.",
    });
  }
  try {
    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    const studentList = await Allocation.find({ tutor_id: tutor._id})
      .populate("tutor_id")
      .populate("student_id");
    if (!studentList) {
      return res.status(400).json({ message: "invalid id" });
    }

    if (studentList.length == 0) {
      return res.status(404).json({ message: "student list is empty" });
    }

    res.status(200).json({ message: studentList });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentDashBoard = async (req, res) => {
  if (req.user.role_name === "Student") {
    return res.status(403).json({
      message: "Access denied, Student cannot access this dashboard.",
    });
  }

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: id },
        { sender_id: id, receiver_id: userId },
      ],
    });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
