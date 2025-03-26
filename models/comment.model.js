import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Author is required"],
      ref: "User",
      index: true,
    },
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Blog is required"],
      ref: "Blog",
      index: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment is too long"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient querying
commentSchema.index({ blog_id: 1, createdAt: -1 });

// Virtual for like count
commentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Method to toggle like
commentSchema.methods.toggleLike = async function (userId) {
  const userLikeIndex = this.likes.indexOf(userId);
  if (userLikeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(userLikeIndex, 1);
  }
  return this.save();
};

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
