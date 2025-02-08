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
      .populate("receiver_id", "name");

    // Create a Set to hold unique user IDs
    const userIds = new Set();

    messages.forEach((msg) => {
      if (msg.sender_id._id.toString() !== userId) {
        userIds.add(msg.sender_id._id.toString());
      }
      if (msg.receiver_id._id.toString() !== userId) {
        userIds.add(msg.receiver_id._id.toString());
      }
    });
    const uniqueUserIds = Array.from(userIds);
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select(
      "name email"
    );

    res.status(200).json(users);
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

// authorized
export const sendMessage = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const isExisted = await User.findById(user_id);
    if (!isExisted) {
      return res.status(404).send({ Message: "receiver not found" });
    }
    const message = await Message.create({
      sender_id: user_id,
      receiver_id: receiver_id,
      content: content,
    });

    res.status(200).json({ message: message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// authorized

export const updateMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        content: content,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// authorized

export const deleteMessage = async (req, res) => {
  try {
    const deleteMessage = await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted message successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
