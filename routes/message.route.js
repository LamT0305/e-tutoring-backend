import express from "express";
import {
  deleteMessage,
  getListOfMessengers,
  getMessagesBetweenUsers,
  sendMessage,
  updateMessage,
} from "../controllers/messageController.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

router.use(authMiddleware);
router.route("/all-conversations").get(getListOfMessengers);
router.route("/conversation/:id").get(getMessagesBetweenUsers);
router.route("/delete-message/:id").delete(deleteMessage);
router.route("/update-message/:id").put(updateMessage);
router.route("/send-message").post(sendMessage);

export default router;
