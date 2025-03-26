import multer from "multer";
import Blog from "../models/blog.model.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer with file size and type validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Helper function for consistent error responses
const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const getAllBlog = async (req, res) => {
  try {
    const { sort = "-createdAt", tags } = req.query;
    const query = tags ? { tags: { $in: tags.split(",") } } : {};

    const blogs = await Blog.find(query)
      .populate("author_id", "name email avatar")
      .sort(sort);

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author_id",
      "name email avatar"
    );

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    // Increment view count
    await blog.incrementViews();

    res.status(200).json({
      success: true,
      blog: {
        ...blog.toJSON(),
        likeCount: blog.likeCount,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const uploadBlog = async (req, res) => {
  const uploadMiddleware = upload.single("image");

  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return errorResponse(res, 400, `Upload error: ${err.message}`);
    } else if (err) {
      return errorResponse(res, 500, err.message);
    }

    try {
      const { title, content, tags } = req.body;

      if (!title?.trim() || !content?.trim()) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return errorResponse(res, 400, "Title and content are required");
      }

      const blogData = {
        author_id: req.user.id,
        title: title.trim(),
        content: content.trim(),
        image: req.file ? `/uploads/${req.file.filename}` : "",
        status_upload: req.user.role === "Student" ? "-1" : "0",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      };

      const blog = await Blog.create(blogData);

      res.status(201).json({
        success: true,
        message:
          req.user.role === "Student"
            ? "Blog submitted for approval"
            : "Blog published successfully",
        blog,
      });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, 500, error.message);
    }
  });
};

export const updateBlog = async (req, res) => {
  const uploadMiddleware = upload.single("image");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 500, err.message);
    }

    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return errorResponse(res, 404, "Blog not found");
      }

      // Check ownership
      if (
        blog.author_id.toString() !== req.user.id 
      ) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return errorResponse(res, 403, "Not authorized to update this blog");
      }

      const { title, content, tags } = req.body;
      const updateData = {
        title: title?.trim() || blog.title,
        content: content?.trim() || blog.content,
      };

      if (tags) {
        updateData.tags = tags.split(",").map((tag) => tag.trim());
      }

      if (req.file) {
        // Delete old image if exists
        if (blog.image) {
          const oldImagePath = path.join(__dirname, "..", blog.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        blog: updatedBlog,
      });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, 500, error.message);
    }
  });
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    // Check ownership or admin rights
    if (
      blog.author_id.toString() !== req.user.id
    ) {
      return errorResponse(res, 403, "Not authorized to delete this blog");
    }

    // Delete associated image if exists
    if (blog.image) {
      const imagePath = path.join(__dirname, "..", blog.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getBlogWaitingApproval = async (req, res) => {
  try {
    if (req.user.role === "Student") {
      return errorResponse(
        res,
        403,
        "Access denied. Students cannot access this page."
      );
    }

    const blogs = await Blog.find({ status_upload: "-1" }).populate(
      "author_id",
      "name email avatar"
    );

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const blogApproval = async (req, res) => {
  try {
    if (req.user.role === "Student") {
      return errorResponse(
        res,
        403,
        "Access denied. Students cannot approve blogs."
      );
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    blog.status_upload = "0";
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog approved successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const manageUserBlogs = async (req, res) => {
  try {
    const { status, sort = "-createdAt" } = req.query;

    const query = {
      author_id: req.params.id,
      ...(status && { status_upload: status }),
    };

    const blogs = await Blog.find(query)
      .populate("author_id", "name email avatar")
      .sort(sort);

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    await blog.toggleLike(req.user.id);

    res.status(200).json({
      success: true,
      message: "Blog like toggled successfully",
      likeCount: blog.likeCount,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
