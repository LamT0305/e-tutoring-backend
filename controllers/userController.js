import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email: email })
      .select("+password")
      .where("isActive")
      .equals(true);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: user.getProfile(),
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      isActive: true,
    }).select("-password");

    if (!user) {
      return errorResponse(res, 404, "User profile not found");
    }

    res.status(200).json({
      success: true,
      user: user.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, address } = req.body;

    const user = await User.findOne({
      _id: req.user.id,
      isActive: true,
    });

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (name) user.name = name.trim();
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (address) user.address = address.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(
        res,
        400,
        "Current password and new password are required"
      );
    }

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordValid = await user.verifyPassword(currentPassword);
    if (!isPasswordValid) {
      return errorResponse(res, 401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (!req.file) {
      return errorResponse(res, 400, "No avatar file uploaded");
    }

    user.avatar = req.file.filename;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
