import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getAllTutors,
  createTutor,
  updateTutor,
  deleteTutor,
  getTutorMessages,
  getStudentsAssignedToTutor,
} from "../controllers/TutorController.js";

const router = express.Router();

router.use(auth);

router.get("/", getAllTutors);
router.post("/", authorize(["staff"]), createTutor);
router.get("/messages", authorize(["tutor"]), getTutorMessages);
router.get(
  "/view-student-assigned",
  authorize(["tutor"]),
  getStudentsAssignedToTutor
);
router.put("/:id", updateTutor);
router.delete("/:id", authorize(["staff"]), deleteTutor);

export default router;
