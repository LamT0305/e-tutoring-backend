// models/Allocation.js
import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  allocated_at: { type: Date, default: Date.now },
});

const Allocation = mongoose.model("Allocation", allocationSchema);
export default Allocation;
