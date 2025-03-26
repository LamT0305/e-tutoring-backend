import Message from "../models/message.model.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const getListOfMessengers = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: -1 });

    const userMap = new Map();

    messages.forEach((msg) => {
      const otherUserId =
        msg.sender._id.toString() === userId
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          id: otherUserId,
          name:
            msg.sender._id.toString() === userId
              ? msg.receiver.name
              : msg.sender.name,
          avatar:
            msg.sender._id.toString() === userId
              ? msg.receiver.avatar
              : msg.sender.avatar,
          lastMessageTime: msg.createdAt,
          lastMessage: msg.content,
          unreadCount:
            msg.receiver._id.toString() === userId && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiver._id.toString() === userId && !msg.isRead) {
        const userData = userMap.get(otherUserId);
        userData.unreadCount += 1;
      }
    });

    const sortedUsers = Array.from(userMap.values()).sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );

    res.status(200).json({
      success: true,
      conversations: sortedUsers,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const receiverId = req.params.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    // Mark unread messages as read
    await Message.updateMany(
      {
        sender: receiverId,
        receiver: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content, receiver, attachments } = req.body;

    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return errorResponse(
        res,
        400,
        "Message content or attachments are required"
      );
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver,
      content: content?.trim() || "",
      attachments: attachments || [],
    });

    await newMessage.save();
    await newMessage.populate("sender", "name avatar");
    await newMessage.populate("receiver", "name avatar");

    // Socket.io emission
    if (req.io) {
      req.io.to(receiver).emit("newMessage", newMessage);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    if (!message) {
      return errorResponse(res, 404, "Message not found");
    }

    if (message.sender._id.toString() !== req.user.id) {
      return errorResponse(res, 403, "You can only edit your own messages");
    }

    const { content } = req.body;
    if (!content?.trim()) {
      return errorResponse(res, 400, "Message content is required");
    }

    message.content = content.trim();
    await message.save();

    if (req.io) {
      req.io
        .to(message.receiver._id.toString())
        .emit("messageUpdated", message);
    }

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    if (!message) {
      return errorResponse(res, 404, "Message not found");
    }

    if (message.sender._id.toString() !== req.user.id) {
      return errorResponse(res, 403, "You can only delete your own messages");
    }

    // Delete attachments if any
    if (message.attachments && message.attachments.length > 0) {
      // Add your file deletion logic here
    }

    await message.deleteOne();

    if (req.io) {
      req.io.to(message.receiver._id.toString()).emit("messageDeleted", {
        messageId: message._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
