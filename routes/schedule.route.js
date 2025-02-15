import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createSchedule,
  deleteSchedule,
  getAllSchedules,
  getScheduleById,
  getStudentScheduleHistory,
  updateStatusSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();
router.use(authMiddleware);

router.route("/get-all-schedules").get(getAllSchedules);
router.route("/get-schedule/:id").get(getScheduleById);
router.route("/create-schedule").post(createSchedule);
router.route("/delete-schedule/:id").delete(deleteSchedule);
router.route("/update-schedule/:id").put(updateStatusSchedule);
router.route("/get-student-schedule-history").get(getStudentScheduleHistory);

export default router;
