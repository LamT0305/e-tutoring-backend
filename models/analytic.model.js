import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_sessions: {
      type: Number,
      default: 0,
    },
    completed_sessions: {
      type: Number,
      default: 0,
    },
    cancelled_sessions: {
      type: Number,
      default: 0,
    },
    total_blogs: {
      type: Number,
      default: 0,
    },
    blog_views: {
      type: Number,
      default: 0,
    },
    total_comments: {
      type: Number,
      default: 0,
    },
    last_active: {
      type: Date,
      default: Date.now,
    },
    average_session_duration: {
      type: Number,
      default: 0,
    },
    subjects: [
      {
        name: String,
        sessions_count: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
