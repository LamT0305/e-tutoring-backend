import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getListOfMessengers,
  getMessagesBetweenUsers,
  sendMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(auth);

// Conversation routes
router.get("/conversations", getListOfMessengers);
router.get("/conversations/:id", getMessagesBetweenUsers);
router.get("/unread/count", getUnreadCount);

// Message operations
router.post("/", sendMessage);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);
router.put("/read/bulk", markAsRead);

export default router;
