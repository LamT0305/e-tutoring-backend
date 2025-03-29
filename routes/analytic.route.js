import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getStudentAnalytics,
  getOverallAnalytics,
} from "../controllers/AnalyticController.js";

const router = express.Router();

router.use(auth);

router.get(
  "/student/:studentId",
  authorize(["tutor", "staff"]),
  getStudentAnalytics
);
router.get("/overall", authorize(["staff"]), getOverallAnalytics);

export default router;
