import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createSchedule,
  deleteSchedule,
  filterScheduleByStatus,
  viewScheduleRequest,
} from "../controllers/scheduleController.js";

const router = express.Router();
router.use(authMiddleware);

router.route("/create-schedule").post(createSchedule);
router.route("/delete-schedule/:id").delete(deleteSchedule);
router.route("/view-schedule-request").get(viewScheduleRequest);
router.route("/filter-schedule-by-status").post(filterScheduleByStatus);
export default router;
