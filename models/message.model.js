import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
