import express from "express";
const router = express.Router();

import { getUserProfile, login } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

router.route("/login").post(login);
router.get("/profile", authMiddleware, getUserProfile);

export default router;
