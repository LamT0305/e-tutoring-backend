// models/Allocation.js
const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  allocation_id: { type: Number, unique: true, required: true },
  student_id: { type: Number, required: true, ref: 'Student' },
  tutor_id: { type: Number, required: true, ref: 'Tutor' },
  allocated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Allocation', allocationSchema);
