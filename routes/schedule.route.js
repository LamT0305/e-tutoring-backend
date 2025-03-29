import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createSchedule,
  getTutorSchedules,
  updateScheduleStatus,
  provideFeedback,
  getStudentSchedules,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.use(auth);

router.post("/", createSchedule);
router.get("/student-schedule", getStudentSchedules);
router.get("/tutor-schedule", getTutorSchedules);
// router.get("/", getSchedulesByStatus);
router.put("/:id", updateScheduleStatus);

export default router;
