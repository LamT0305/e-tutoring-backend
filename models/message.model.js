// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message_id: { type: Number, unique: true, required: true },
  sender_id: { type: Number, required: true, ref: 'User' },
  receiver_id: { type: Number, required: true, ref: 'User' },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
