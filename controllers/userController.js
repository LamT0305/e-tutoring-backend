import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Student from "../models/student.model.js";
import Tutor from "../models/tutor.model.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

// CRUD student (done)

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user_id",
        populate: {
          path: "role_id",
          model: "Role",
        },
      })
      .populate("tutor_id");
    res.status(200).json({
      message: "success",
      students: students,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req, res) => {
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

// CRUD turtor

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
// authentication
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const token = jsonwebtoken.sign(
      { id: user.id, name: user.name, role_id: user.role_id },
      process.env.JWR_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role_id: user.role_id },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Manage (get all users + search users)

// Get list students of tutor

// send notifications
