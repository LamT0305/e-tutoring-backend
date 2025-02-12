import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

export const getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find();
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
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const author_id = req.user.id;
    if (req.user.role_name === "Student") {
      const blog = await Blog.create({
        author_id: author_id,
        title: title,
        content: content,
        status_upload: "wait for approval",
      });
      return res
        .status(200)
        .json({ status: "waiting for approval", blog: blog });
    }
    const blog = await Blog.create({
      author_id: author_id,
      title: title,
      content: content,
      status_upload: "uploaded",
    });
    res.status(200).json({ status: "Blog uploaded successfully!", blog: blog });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ status: "Content is required" });
    }
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        content: content,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
