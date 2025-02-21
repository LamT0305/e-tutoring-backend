import Message from "../models/message.model.js";
import User from "../models/user.model.js";
// authorized
export const getListOfMessengers = async (req, res) => {
  const userId = req.user.id;

  try {
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .populate("sender_id", "name")
      .populate("receiver_id", "name")
      .sort({ created_at: -1 }); // Sort by latest message

    const userMap = new Map();

    messages.forEach((msg) => {
      const otherUserId =
        msg.sender_id._id.toString() === userId
          ? msg.receiver_id._id.toString()
          : msg.sender_id._id.toString();

      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          id: otherUserId,
          name:
            msg.sender_id._id.toString() === userId
              ? msg.receiver_id.name
              : msg.sender_id.name,
          lastMessageTime: msg.created_at,
          lastMessage: msg.content,
        });
      }
    });

    const sortedUsers = Array.from(userMap.values()).sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const receiverId = req.params.id;
    // Find messages exchanged between the two users
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
    })
      .sort({ created_at: 1 }) // Sort messages by creation date
      .populate("sender_id", "name") // Populate sender's name
      .populate("receiver_id", "name"); // Populate receiver's name

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content, receiver_id } = req.body;
    if (!content || !receiver_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Message({
      sender_id: req.user.id,
      receiver_id,
      content,
    });

    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// authorized

export const updateMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id)
      .populate("sender_id", "_id")
      .populate("receiver_id", "_id");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.sender_id || !message.sender_id._id) {
      console.error("Message sender_id is missing!");
      return res.status(500).json({ message: "Invalid message data" });
    }

    if (message.sender_id._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own messages!" });
    }

    message.content = content;
    await message.save();

    // Ensure WebSocket is defined before emitting events
    if (req.io) {
      if (message.receiver_id && message.receiver_id._id) {
        req.io
          .to(message.receiver_id._id.toString())
          .emit("updateMessage", message);
      }
      req.io
        .to(message.sender_id._id.toString())
        .emit("updateMessage", message);
    } else {
      console.error("Socket.IO (req.io) is undefined!");
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: error.message });
  }
};

// authorized

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id)
      .populate("sender_id", "_id")
      .populate("receiver_id", "_id");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    console.log("Message data:", message); // Debugging

    if (
      !message.sender_id ||
      !message.sender_id._id ||
      !message.receiver_id ||
      !message.receiver_id._id
    ) {
      console.error("Message sender_id or receiver_id is missing!");
      return res.status(500).json({ message: "Invalid message data" });
    }

    if (message.sender_id._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages!" });
    }

    await message.deleteOne();

    // Ensure req.io is defined before emitting
    if (req.io) {
      req.io
        .to(message.receiver_id._id.toString())
        .emit("deleteMessage", { id });
      req.io.to(message.sender_id._id.toString()).emit("deleteMessage", { id });
    } else {
      console.error("Socket.IO (req.io) is undefined!");
    }

    res.status(200).json({ message: "Deleted message successfully!" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: error.message });
  }
};
