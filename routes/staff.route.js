import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  createStaff,
  getStaffList,
  allocateTutors,
  getAllocations,
  deleteAllocation,
  toggleStaffStatus
} from "../controllers/staffController.js";

const router = express.Router();

router.use(auth);
router.use(authorize(['staff']));

router.post('/', createStaff);
router.get('/', getStaffList);
router.post('/allocate', allocateTutors);
router.get('/allocations', getAllocations);
router.delete('/allocations/:id', deleteAllocation);
router.patch('/:id/status', toggleStaffStatus);

export default router;