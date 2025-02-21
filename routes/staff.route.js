import express from "express";
import {
  allocateTutors,
  createStaff,
  deleteAllocation,
  getStaffs,
  viewAllocations,
} from "../controllers/staffController.js";
import authMiddleware from "../middleware/auth.js"
const router = express.Router();
router.use(authMiddleware)
router.route("/create-staff").post(createStaff);
router.route("/get-all-staffs/:id").get(getStaffs);
router.route("/allocation").post(allocateTutors);
router.route("/allocation").get(viewAllocations);
router.route("/delete-allocation/:id").delete(deleteAllocation);
export default router;
