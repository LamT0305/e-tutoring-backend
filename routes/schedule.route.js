import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createSchedule,
  filterScheduleByStatus,
  updateScheduleStatusByTutor,
  viewScheduleRequest,
} from "../controllers/scheduleController.js";

const router = express.Router();
router.use(authMiddleware);

router.route("/create-schedule").post(createSchedule);
router.route("/view-schedule-request").get(viewScheduleRequest);
router.route("/filter-schedule-by-status").post(filterScheduleByStatus);
router.route("/update-schedule-request/:id").put(updateScheduleStatusByTutor);
export default router;
