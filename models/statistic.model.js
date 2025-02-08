// models/Statistic.js
const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tutor",
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Student",
  },
  interaction: { type: String, required: true },
  type: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Statistic", statisticSchema);
