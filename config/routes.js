import routes from "../routes/index.routes.js";

const routers = (app) => {
  app.use("/api/v1/role", routes.role);
  app.use("/api/v1/user", routes.user);
  app.use("/api/v1/student", routes.student);
  app.use("/api/v1/tutor", routes.tutor);
  app.use("/api/v1/staff", routes.staff);
  app.use("/api/v1/message", routes.message);
  app.use("/api/v1/blog", routes.blog);
  app.use("/api/v1/comment", routes.comment);
  app.use("/api/v1/schedule", routes.schedule);
};

export default routers;
