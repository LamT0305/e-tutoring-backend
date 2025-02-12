import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

export const commentBlog = async (req, res) => {
  try {
    const { content } = req.body;
    const user_id = req.user.id;
    const blog_id = req.params.id;

    if (!content) {
      return res.status(500).json({ error: "content is required" });
    }
    const blog = await Blog.findById(blog_id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    const comment = await Comment.create({
      author_id: user_id,
      blog_id: blog_id,
      content: content,
    });
    res.status(200).json({ message: "Comment created", comment: comment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        content: content,
      },
      {
        new: true,
      }
    );
    res
      .status(200)
      .json({ message: "Comment updated successfully", comment: comment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const cmt = await Comment.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ message: "Comment deleted successfully", comment: cmt });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllCmts = async (req, res) => {
  try {
    const cmts = await Comment.find();
    res.status(200).json({ comments: cmts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
