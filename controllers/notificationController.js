import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const sentNotifications = async (user_id, content) => {
  try {
    if (!user_id || !content) {
      return new String("user and content are required");
    }
    const isExisted = await User.findById(user_id).exists();
    if (!isExisted) {
      return new String("User does not exist");
    }

    const notification = await Notification.create({
      user_id: user_id,
      content: content,
    });
    return notification.toJSON();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
