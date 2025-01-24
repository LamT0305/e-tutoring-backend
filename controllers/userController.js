import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import jsonwebtoken from "jsonwebtoken";

// CUD user

export const createUser = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10); // Tạo một "muối" với độ mạnh 10
    const hashedPassword = await bcrypt.hash(password, salt); // Mã hóa mật khẩu

    const newUser = new User({
      name,
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
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {};

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

// Roles

// Manage (get all users + search users)

// Get list students of tutor

// send notifications
