import express from "express";
const router = express.Router();

import {
  createStudent,
  updateStudent,
  deleteStudent,
  login,
  getAllStudents,
  getAllTutors,
  createTutor,
  updateTutor,
  deleteTutor,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
router.route("/get-all-students").get(getAllStudents);
router.route("/create-student").post(createStudent);
router.route("/update-student/:id").put(updateStudent);
router.route("/delete-student/:id").delete(deleteStudent);

router.route("/get-all-tutors").get(getAllTutors);
router.route("/create-tutor").post(createTutor);
router.route("/update-tutor/:id").put(updateTutor);
router.route("/delete-tutor/:id").delete(deleteTutor);

router.route("/login").post(login);

export default router;
