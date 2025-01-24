// models/Meeting.js
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meeting_id: { type: Number, unique: true, required: true },
  student_id: { type: Number, required: true, ref: 'Student' },
  tutor_id: { type: Number, required: true, ref: 'Tutor' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String },
  is_virtual: { type: Boolean, default: false },
  notes: { type: String }
});

module.exports = mongoose.model('Meeting', meetingSchema);
