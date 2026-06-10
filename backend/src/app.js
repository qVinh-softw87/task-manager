const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const app = express();


const swaggerSpec = require("./config/swagger");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
];
if (process.env.CLIENT_URL) {
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    allowedOrigins.push(clientUrl);
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error(`Blocked by CORS policy. Origin: ${origin}. Allowed: ${JSON.stringify(allowedOrigins)}`), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Middleware to parse cookies
app.use(cookieParser());

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
