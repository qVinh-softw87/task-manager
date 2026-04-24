const express = require("express");
const app = express();

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

// middleware convert Json to Object
app.use(express.json());

// Route all request starting with /api/auth to authRoutes to handler
app.use("/api/auth", authRoutes);
// Route all requests starting with /api/task to taskRoutes to handler
app.use("/api/tasks", taskRoutes);

module.exports = app;
