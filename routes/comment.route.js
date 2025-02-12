import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  commentBlog,
  deleteComment,
  getAllCmts,
  updateComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/comment-on-blog/:id").post(commentBlog);
router.route("/update-comment/:id").put(updateComment);
router.route("/delete-comment/:id").delete(deleteComment);
router.route("/get-all-comments").get(getAllCmts);

export default router;