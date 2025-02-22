import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: Date.now(),
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["0", "1", "-1"], // 0: requesting, 1: accepted, -1: rejected
    default: "0",
  },
  note: {
    type: String,
    default: "",
  },
  meetingType: {
    type: String,
    enum: ["online", "offline"],
    default: "online",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Schedule = mongoose.model("Schedule", ScheduleSchema);
export default Schedule;
