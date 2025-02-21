import express from "express";
import {
  createTutor,
  deleteTutor,
  getAllTutors,
  getStudentDashBoard,
  updateTutor,
  viewTutorStudentList,
} from "../controllers/TutorController.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

router.use(authMiddleware);
router.route("/get-all-tutors").get(getAllTutors);
router.route("/create-tutor").post(createTutor);
router.route("/update-tutor/:id").put(updateTutor);
router.route("/delete-tutor/:id").delete(deleteTutor);
router.route("/view-tutor-student-list").get(viewTutorStudentList);
router.route("/get-student-dashboard/:id").get(getStudentDashBoard);
export default router;
