// models/Statistic.js
const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
  stat_id: { type: Number, unique: true, required: true },
  tutor_id: { type: Number, required: true, ref: 'Tutor' },
  total_messages: { type: Number, required: true },
  last_7_days: { type: Number, required: true }
});

module.exports = mongoose.model('Statistic', statisticSchema);
