const express = require("express");
const app = express();

// middleware convert Json to Object
app.use(express.json());

const  taskRoutes = require("./routes/taskRoutes");

// Route all requests starting with /api/task to taskRoutes to handler
app.use("/api/tasks", taskRoutes);

module.exports = app;