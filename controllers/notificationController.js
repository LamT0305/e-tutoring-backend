import Notification from "../models/notification.model.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("relatedTo.id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
      isRead: false,
    })
      .populate("relatedTo.id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.user.id,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
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

export const createNotification = async (req, res) => {
  try {
    const { type, title, message, relatedTo } = req.body;

    if (!type || !title || !message) {
      return errorResponse(res, 400, "Type, title and message are required");
    }

    const notification = await Notification.create({
      recipient: req.params.userId,
      type,
      title: title.trim(),
      message: message.trim(),
      relatedTo,
    });

    // Socket.io emission if available
    if (req.io) {
      req.io.to(req.params.userId).emit("newNotification", notification);
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
