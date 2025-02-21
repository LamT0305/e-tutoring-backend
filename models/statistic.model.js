// models/Statistic.js
import mongoose from "mongoose";

const statisticSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  interaction: { type: String, required: true },
  content: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
}
);

const Statistic = mongoose.model("Statistic", statisticSchema);
export default Statistic;
