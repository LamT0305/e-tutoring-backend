import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tutor is required"],
      index: true,
      validate: {
        validator: async function (tutorId) {
          const User = mongoose.model("User");
          const tutor = await User.findById(tutorId);
          return tutor && tutor.role === "tutor";
        },
        message: "Only tutors can create schedules",
      },
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
      validate: {
        validator: async function (studentId) {
          const User = mongoose.model("User");
          const student = await User.findById(studentId);
          return student && student.role === "student";
        },
        message: "Selected user must be a student",
      },
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      index: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Start time must be in the future",
      },
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    meetingType: {
      type: String,
      enum: ["online", "offline"],
      required: [true, "Meeting type is required"],
    },
    meetingLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return this.meetingType !== "online" || value;
        },
        message: "Meeting link is required for online meetings",
      },
    },
    location: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return this.meetingType !== "offline" || value;
        },
        message: "Location is required for offline meetings",
      },
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
        maxLength: 1000,
      },
      createdAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ScheduleSchema.index({ tutor: 1, startTime: -1 });
ScheduleSchema.index({ student: 1, startTime: -1 });
ScheduleSchema.index({ status: 1, startTime: 1 });

// Virtuals
ScheduleSchema.virtual("isUpcoming").get(function () {
  return this.status === "upcoming" && this.startTime > new Date();
});

ScheduleSchema.virtual("sessionDuration").get(function () {
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

// Methods
ScheduleSchema.methods.cancelMeeting = async function (reason) {
  if (this.status === "completed") {
    throw new Error("Cannot cancel a completed meeting");
  }
  this.status = "cancelled";
  this.notes = reason;
  return await this.save();
};

ScheduleSchema.methods.completeMeeting = async function () {
  if (this.startTime > new Date()) {
    throw new Error("Cannot complete a future meeting");
  }
  if (this.status === "cancelled") {
    throw new Error("Cannot complete a cancelled meeting");
  }
  this.status = "completed";
  return await this.save();
};

ScheduleSchema.methods.addFeedback = async function (rating, comment) {
  if (this.status !== "completed") {
    throw new Error("Can only add feedback to completed meetings");
  }
  if (this.feedback?.createdAt) {
    throw new Error("Feedback already exists");
  }
  this.feedback = { rating, comment, createdAt: new Date() };
  return await this.save();
};

const Schedule = mongoose.model("Schedule", ScheduleSchema);
export default Schedule;
