import express from "express";
import {
  deleteMessage,
  getMessagesByReceiver,
  getMessagesBySender,
  sendMessage,
  updateMessage,
} from "../controllers/messageController.js";
const router = express.Router();

router.route("/sender-messages").get(getMessagesBySender);
router.route("/receiver-messages/:id").get(getMessagesByReceiver);
router.route("/delete-messages/:id").delete(deleteMessage);
router.route("/update-messages/:id").put(updateMessage);
router.route("/send-message").post(sendMessage);

export default router;
