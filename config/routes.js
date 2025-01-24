import routes from "../routes/index.routes.js"; // Ensure this path is correct

const routers = (app) => {
    app.use("/api/v1/role", routes.role); // Added leading slash
    app.use("/api/v1/user", routes.user); // Added leading slash
};

export default routers;
