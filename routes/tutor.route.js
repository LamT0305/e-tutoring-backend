import express from "express";
import {
  createTutor,
  deleteTutor,
  getAllTutors,
  updateTutor,
} from "../controllers/TutorController.js";
const router = express.Router();

router.route("/get-all-tutors").get(getAllTutors);
router.route("/create-tutor").post(createTutor);
router.route("/update-tutor/:id").put(updateTutor);
router.route("/delete-tutor/:id").delete(deleteTutor);
export default router;
