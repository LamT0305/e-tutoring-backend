import express from "express";
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  updateStudent,
} from "../controllers/studentController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);
router.route("/get-all-students").get(getAllStudents);
router.route("/create-student").post(createStudent);
router.route("/update-student/:id").put(updateStudent);
router.route("/delete-student/:id").delete(deleteStudent);

export default router;
