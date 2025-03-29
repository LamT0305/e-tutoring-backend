import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  viewTutorAssigned,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(auth);

router.get("/", getAllStudents);
router.get("/view-tutor-assigned", viewTutorAssigned);
router.post("/", authorize(["staff"]), createStudent);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", authorize(["staff"]), deleteStudent);

export default router;
