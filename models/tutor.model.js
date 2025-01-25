// models/Tutor.js
import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Tutor = mongoose.model("Tutor", tutorSchema);
export default Tutor;
