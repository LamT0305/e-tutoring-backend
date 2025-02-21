import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  blogApproval,
  deleteBlog,
  getAllBlog,
  getBlogById,
  getBlogWaitingApproval,
  manageUserBlogs,
  updateBlog,
  uploadBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.use(authMiddleware);
router.route("/upload-blog").post(uploadBlog);
router.route("/update-blog/:id").put(updateBlog);
router.route("/delete-blog/:id").delete(deleteBlog);
router.route("/get-all-blog").get(getAllBlog);
router.route("/get-blog/:id").get(getBlogById);
router.route("/get-list-blogs-pending").get(getBlogWaitingApproval);
router.route("/approval/:id").put(blogApproval);
router.route("/my-blogs").get(manageUserBlogs);

export default router;
