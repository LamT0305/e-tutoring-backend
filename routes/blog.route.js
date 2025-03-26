import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
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

// Public routes
router.get("/", getAllBlog);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", upload.single("image"), uploadBlog);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);
router.get("/pending/list", authorize(["staff"]), getBlogWaitingApproval);
router.put("/approve/:id", authorize(["staff"]), blogApproval);
router.get("/my-blogs", manageUserBlogs);

export default router;
