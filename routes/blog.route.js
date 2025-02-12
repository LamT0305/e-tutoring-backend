import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  deleteBlog,
  getAllBlog,
  getBlogById,
  updateBlog,
  uploadBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.use(authMiddleware);
router.route("/upload-blog").post(uploadBlog);
router.route("/update-blog").put(updateBlog);
router.route("/delete-blog").delete(deleteBlog);
router.route("/get-all-blog").get(getAllBlog);
router.route("/get-blog/:id").get(getBlogById);

export default router;