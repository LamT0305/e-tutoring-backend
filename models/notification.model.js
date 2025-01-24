// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: { type: Number, unique: true, required: true },
  user_id: { type: Number, required: true, ref: 'User' },
  content: { type: String, required: true },
  sent_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
