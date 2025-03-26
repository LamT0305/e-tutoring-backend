import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

// Helper function for consistent error responses
const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    if (!content?.trim()) {
      return errorResponse(res, 400, "Comment content is required");
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    const newComment = new Comment({
      content: content.trim(),
      blog_id: req.params.id,
      author_id: req.user.id,
      parentComment: parentComment || null,
    });

    const savedComment = await newComment.save();
    await savedComment.populate("author_id", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: savedComment,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    // Check ownership
    if (comment.author_id.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to update this comment");
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return errorResponse(res, 400, "Comment content is required");
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    // Check ownership or admin rights
    if (comment.author_id.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to delete this comment");
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog_id: req.params.id })
      .populate("author_id", "name email avatar")
      .populate("parentComment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return errorResponse(res, 404, "Comment not found");
    }

    await comment.toggleLike(req.user.id);

    res.status(200).json({
      success: true,
      message: "Comment like toggled successfully",
      likeCount: comment.likeCount,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({
      parentComment: req.params.commentId,
    })
      .populate("author_id", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      replies,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
