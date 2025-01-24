// models/Tutor.js
const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  tutor_id: { type: Number, unique: true, required: true },
  user_id: { type: Number, required: true, ref: 'User' }
});

module.exports = mongoose.model('Tutor', tutorSchema);
