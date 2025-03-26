import express from "express";
import { auth } from "../middleware/auth.js";
import {
  addComment,
  updateComment,
  deleteComment,
  getAllComments,
  toggleLike,
  getReplies,
} from "../controllers/commentController.js";

const router = express.Router();

router.use(auth);

router.post("/:id/comments", addComment);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);
router.get("/:id/comments", getAllComments);
router.post("/comments/:id/like", toggleLike);
router.get("/comments/:commentId/replies", getReplies);

export default router;