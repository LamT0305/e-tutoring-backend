import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  getAllBlog,
  getBlogById,
  uploadBlog,
  updateBlog,
  deleteBlog,
  getBlogWaitingApproval,
  blogApproval,
  manageUserBlogs,
} from "../controllers/blogController.js";

const router = express.Router();

router.use(auth);

// Place specific routes first
router.get("/my-blogs", manageUserBlogs);
router.get("/pending/list", authorize(["tutor"]), getBlogWaitingApproval);

// Then general routes
router.get("/", getAllBlog);

// Then parameter routes
router.get("/:id", getBlogById);
router.post("/", uploadBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);
router.put("/approve/:id", authorize(["tutor"]), blogApproval);

export default router;
