const express = require("express");
const swaggerUi = require("swagger-ui-express");
const app = express();

const swaggerSpec = require("./config/swagger");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");

// middleware convert Json to Object
app.use(express.json());

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// return OpenAPI specification by JSON format for tool or another system
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// Register middleware: Route all request starting with /api/auth to authRoutes to handler
app.use("/api/auth", authRoutes);
// Register middleware: Route all requests starting with /api/task to taskRoutes to handler
app.use("/api/tasks", taskRoutes);
// Register middleware: handler not found
app.use(notFound);
// Register middleware: Handle unhandled errors and errors from next(error)/throw
app.use(errorHandler);

module.exports = app;
