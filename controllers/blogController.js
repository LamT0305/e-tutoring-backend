import multer from "multer";
import Blog from "../models/blog.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Set up multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Specify the file name
  },
});

const upload = multer({ storage: storage });

export const getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author_id");
    res.status(200).json({ blogs: blogs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "blog not found" });
    }
    res.status(200).json({ blog: blog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadBlog = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    try {
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const author_id = req.user.id;
      const image = req.file ? `/uploads/${req.file.filename}` : "";

      const blogData = {
        author_id: author_id,
        title: title,
        content: content,
        image: image,
      };

      if (req.user.role_name === "Student") {
        blogData.status_upload = "-1";
      } else {
        blogData.status_upload = "0";
      }

      const blog = await Blog.create(blogData);
      res.status(200).json({
        status:
          req.user.role_name === "Student"
            ? "waiting for approval"
            : "Blog uploaded successfully!",
        blog: blog,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

export const updateBlog = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    try {
      const { title, content } = req.body;
      const updateData = { title, content };

      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ message: "Updated successfully", blog });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully", blog: blog });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogWaitingApproval = async (req, res) => {
  try {
    if (req.user.role_name === "Student") {
      return res
        .status(403)
        .json({ message: "Access denied, studnet cannot access this page." });
    }
    const blogs = await Blog.find({ status_upload: "-1" });
    if (!blogs) {
      return res
        .status(404)
        .json({ message: "There is no blog waiting to be uploaded." });
    }
    res.status(200).json({ blogs: blogs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const blogApproval = async (req, res) => {
  try {
    if (req.user.role_name === "Student") {
      return res
        .status(403)
        .json({ message: "Access denied, studnet cannot access this page." });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "blog not found" });
    }
    blog.status_upload = "0";
    await blog.save();
    res.status(200).json({ message: "Approval blog successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const manageUserBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    const blogs = await Blog.find({
      author_id: req.params.id,
      status_upload: status,
    }).populate("author_id");
    res.status(200).json({ blogs: blogs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
