import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createSchedule,
  viewScheduleRequests,
  getSchedulesByStatus,
  updateScheduleStatus,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.use(auth);

router.post("/", createSchedule);
router.get("/requests", viewScheduleRequests);
router.get("/", getSchedulesByStatus);
router.put("/:id/status", updateScheduleStatus);

export default router;
