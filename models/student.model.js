import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", 
  },
  tutor_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
  }],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Student = mongoose.model("Student", studentSchema); 
export default Student; 
