import Notification from "../models/notification.model.js";

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



