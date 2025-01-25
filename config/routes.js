import routes from "../routes/index.routes.js"; // Ensure this path is correct

const routers = (app) => {
  app.use("/api/v1/role", routes.role);
  app.use("/api/v1/user", routes.user);
  app.use("/api/v1/student", routes.student);
  app.use("/api/v1/tutor", routes.tutor);
};

export default routers;
