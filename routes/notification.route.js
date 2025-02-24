import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  deleteNoti,
  getAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();
router.use(authMiddleware);
router.route("/get-all-notification").get(getAllNotifications);
router.route("/delete-notification/:id").delete(deleteNoti);

export default router;
