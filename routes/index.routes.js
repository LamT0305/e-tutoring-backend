import user from "./user.route.js";
import student from "./student.route.js";
import tutor from "./tutor.route.js";
import staff from "./staff.route.js";
import message from "./message.route.js";
import blog from "./blog.route.js";
import comment from "./comment.route.js";
import schedule from "./schedule.route.js";
import notification from "./notification.route.js";
import analytic from "./analytic.route.js";

const routes = {
  user: user,
  student: student,
  tutor: tutor,
  staff: staff,
  message: message,
  blog: blog,
  comment: comment,
  schedule: schedule,
  notification: notification,
  analytic: analytic,
};

export default routes;
