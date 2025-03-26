import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getAllNotifications,
  getUnreadNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(auth);

// User notification routes
router.get("/", getAllNotifications);
router.get("/unread", getUnreadNotifications);
router.get("/count", getUnreadCount);
router.put("/read", markAsRead);
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

// Staff/Tutor only route
router.post("/:userId", authorize(["staff", "tutor"]), createNotification);

export default router;
