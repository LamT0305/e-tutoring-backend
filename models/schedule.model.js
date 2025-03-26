import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tutor is required"],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 15, // minimum 15 minutes
      max: 180, // maximum 3 hours
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    meetingType: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
ScheduleSchema.index({ tutor: 1, startTime: -1 });
ScheduleSchema.index({ student: 1, startTime: -1 });
ScheduleSchema.index({ status: 1, startTime: 1 });

// Validate end time is after start time
ScheduleSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    next(new Error("End time must be after start time"));
  }
  next();
});

// Virtual for checking if meeting is upcoming
ScheduleSchema.virtual("isUpcoming").get(function () {
  return this.startTime > new Date();
});

// Method to cancel meeting
ScheduleSchema.methods.cancelMeeting = async function (reason) {
  this.status = "cancelled";
  this.notes = reason;
  return await this.save();
};

// Method to complete meeting
ScheduleSchema.methods.completeMeeting = async function () {
  this.status = "completed";
  return await this.save();
};

const Schedule = mongoose.model("Schedule", ScheduleSchema);
export default Schedule;
