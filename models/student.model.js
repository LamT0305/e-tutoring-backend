// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  student_id: { type: Number, unique: true, required: true },
  user_id: { type: Number, required: true, ref: "User" },
  tutor_id: { type: Number, ref: "Tutor" },
});

module.exports = mongoose.model("Student", studentSchema);
