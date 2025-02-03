import routes from "../routes/index.routes.js"; 

const routers = (app) => {
  app.use("/api/v1/role", routes.role);
  app.use("/api/v1/user", routes.user);
  app.use("/api/v1/student", routes.student);
  app.use("/api/v1/tutor", routes.tutor);
  app.use("/api/v1/staff", routes.staff);
};

export default routers;
