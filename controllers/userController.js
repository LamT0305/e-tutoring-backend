import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

// authentication
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }
  try {
    const user = await User.findOne({ email }).populate("role_id");
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const token = jsonwebtoken.sign(
      {
        id: user._id,
        name: user.name,
        role_id: user.role_id._id,
        role_name: user.role_id.role_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role_id: user.role_id._id,
        role_name: user.role_id.role_name,
      },
      token,
    });
    // res.send(user.role_id)
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
