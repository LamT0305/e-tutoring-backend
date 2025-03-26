import express from "express";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  login,
  getUserProfile,
  updateProfile,
  changePassword,
  updateAvatar,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.use(auth);
router.get("/profile", getUserProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.put("/avatar", upload.single("avatar"), updateAvatar);

export default router;
