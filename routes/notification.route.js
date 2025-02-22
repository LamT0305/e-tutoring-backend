import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getAllNotifications } from "../controllers/notificationController.js";


const router = express.Router();
router.use(authMiddleware);
router.route("/get-all-notification").get(getAllNotifications);

export default router;