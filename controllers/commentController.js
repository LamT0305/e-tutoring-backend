import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

export const addComment = async (req, res) => {
  try {
    const newComment = new Comment({
      content: req.body.content,
      blog_id: req.params.id,
      author_id: req.user.id, // or however you get the author ID
    });

    const savedComment = await newComment.save();
    await savedComment.populate("author_id"); // Populate author_id

    res.status(200).json({ comment: savedComment });
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
    const cmts = await Comment.find({ blog_id: req.params.id }).populate(
      "author_id"
    );
    if (!cmts) {
      return res.status(404).json({ error: "Comments not found" });
    }
    res.status(200).json({ comments: cmts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
