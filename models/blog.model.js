import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Author is required"],
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"],
    },
    status_upload: {
      type: String,
      enum: {
        values: ["-1", "0", "1"],
        message: "Invalid status value",
      },
      default: "-1",
      index: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ createdAt: -1 });

// Virtual for like count
blogSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Method to increment views
blogSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save();
};

// Method to toggle like
blogSchema.methods.toggleLike = async function (userId) {
  const userLikeIndex = this.likes.indexOf(userId);
  if (userLikeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(userLikeIndex, 1);
  }
  return this.save();
};

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
