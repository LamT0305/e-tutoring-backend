import routes from "../routes/index.routes.js";

const routers = (app) => {
  // API routes
  app.use("/api/v1/users", routes.user);
  app.use("/api/v1/students", routes.student);
  app.use("/api/v1/tutors", routes.tutor);
  app.use("/api/v1/staff", routes.staff);
  app.use("/api/v1/messages", routes.message);
  app.use("/api/v1/blogs", routes.blog);
  app.use("/api/v1/comments", routes.comment);
  app.use("/api/v1/schedules", routes.schedule);
  app.use("/api/v1/notifications", routes.notification);
  app.use("/api/v1/analytics", routes.analytic);
};

export default routers;
