import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getAllTutors,
  createTutor,
  updateTutor,
  deleteTutor,
  getTutorMessages,
} from "../controllers/TutorController.js";

const router = express.Router();

router.use(auth);

router.get("/", getAllTutors);
router.post("/", authorize(["staff"]), createTutor);
router.put("/:id", updateTutor);
router.delete("/:id", authorize(["staff"]), deleteTutor);
router.get("/messages", authorize(["tutor"]), getTutorMessages);

export default router;
