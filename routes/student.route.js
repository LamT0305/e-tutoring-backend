import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  getStudentTutors,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(auth);

router.get("/", getAllStudents);
router.post("/", authorize(["staff"]), createStudent);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", authorize(["staff"]), deleteStudent);
router.get("/:id/tutors", getStudentTutors);

export default router;
