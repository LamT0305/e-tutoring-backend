import Allocation from "../models/allocation.model.js";
import Schedule from "../models/schedule.model.js";
import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

const generateAnalytics = async (studentId) => {
  // Get all schedules for the student
  const schedules = await Schedule.find({ student: studentId });
  const blogs = await Blog.find({ author_id: studentId });
  const comments = await Comment.find({ author_id: studentId });

  // Calculate session statistics
  const total_sessions = schedules.length;
  const completed_sessions = schedules.filter(
    (s) => s.status === "completed"
  ).length;
  const cancelled_sessions = schedules.filter(
    (s) => s.status === "cancelled"
  ).length;

  // Calculate average session duration (in minutes)
  const completedSchedules = schedules.filter((s) => s.status === "completed");
  const average_session_duration =
    completedSchedules.length > 0
      ? Math.round(
          completedSchedules.reduce(
            (acc, curr) => acc + (curr.endTime - curr.startTime) / (1000 * 60),
            0
          ) / completedSchedules.length
        )
      : 0;

  // Calculate blog statistics
  const total_blogs = blogs.length;
  const blog_views = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const total_comments = comments.length;

  // Calculate subject performance
  const subjectMap = new Map();
  schedules.forEach((schedule) => {
    const current = subjectMap.get(schedule.subject) || {
      sessions_count: 0,
      completed: 0,
    };
    current.sessions_count++;
    if (schedule.status === "completed") current.completed++;
    subjectMap.set(schedule.subject, current);
  });

  const subjects = Array.from(subjectMap.entries()).map(([name, data]) => ({
    name,
    sessions_count: data.sessions_count,
    progress: Math.round((data.completed / data.sessions_count) * 100),
  }));

  const sessions_over_time = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of day
  const fifteenDaysAgo = new Date(today);
  fifteenDaysAgo.setDate(today.getDate() - 14);
  fifteenDaysAgo.setHours(0, 0, 0, 0); // Set to start of day

  for (
    let date = new Date(fifteenDaysAgo);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
    }).length;

    sessions_over_time.push({
      date: date.toISOString().split("T")[0],
      count,
    });
  }

  return {
    total_sessions,
    completed_sessions,
    cancelled_sessions,
    total_blogs,
    blog_views,
    total_comments,
    average_session_duration,
    subjects,
    sessions_over_time,
    last_active: new Date(),
  };
};

export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check authorization
    if (req.user.role !== "staff" && req.user.role !== "tutor") {
      return errorResponse(res, 403, "Not authorized to view analytics");
    }

    // If tutor, verify they are assigned to this student
    if (req.user.role === "tutor") {
      const isAssigned = await Allocation.exists({
        tutor_id: req.user.id,
        student_id: studentId,
      });

      if (!isAssigned) {
        return errorResponse(
          res,
          403,
          "Not authorized to view this student's analytics"
        );
      }
    }

    const analytics = await generateAnalytics(studentId);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getOverallAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Not authorized to view overall analytics"
      );
    }

    // Get all students
    const allocations = await Allocation.find().distinct("student_id");
    const analyticsPromises = allocations.map((studentId) =>
      generateAnalytics(studentId)
    );
    const analytics = await Promise.all(analyticsPromises);

    // Aggregate data for overall statistics
    const totalSessions = analytics.reduce(
      (acc, curr) => acc + curr.total_sessions,
      0
    );
    const completedSessions = analytics.reduce(
      (acc, curr) => acc + curr.completed_sessions,
      0
    );
    const cancelledSessions = analytics.reduce(
      (acc, curr) => acc + curr.cancelled_sessions,
      0
    );
    const totalBlogs = analytics.reduce(
      (acc, curr) => acc + curr.total_blogs,
      0
    );
    const blogViews = analytics.reduce((acc, curr) => acc + curr.blog_views, 0);
    const totalComments = analytics.reduce(
      (acc, curr) => acc + curr.total_comments,
      0
    );
    const averageSessionDuration =
      analytics.reduce((acc, curr) => acc + curr.average_session_duration, 0) /
      analytics.length;

    res.status(200).json({
      success: true,
      analytics: {
        totalSessions,
        completedSessions,
        cancelledSessions,
        totalBlogs,
        blogViews,
        totalComments,
        averageSessionDuration,
        detailedAnalytics: analytics, // Include detailed analytics for each student
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
