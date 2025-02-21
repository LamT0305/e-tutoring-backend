// models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  status_upload: {
    type: String,
    enum: ["-1", "0", "1"], // -1: waiting for upload, 0: uploaded, 1: rejected
    require: true,
  },
  image: {
    type: String,
    default: "",
  },
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
