import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// authorized

export const getMessagesBySender = async (req, res) => {
  try {
    const messages = await Message.find({ sender_id: req.user.id });
    res.status(200).json({ messages: messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessagesByReceiver = async (req, res) => {
  try {
    const messages = await Message.find({ receiver_id: req.params.id });
    return res.status(200).json({ messages: messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// authorized
export const sentMessage = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const isExisted = await User.exists(user_id);
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
    const message = await Message.findByIdAndUpdate(req.params.id, content, {
      new: true,
    });
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
