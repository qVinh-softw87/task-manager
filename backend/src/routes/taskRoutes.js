const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");

// create task
router.post("/", taskController.createTask);

// get all tasks
router.get("/", taskController.getTasks);

//update task
router.put("/:id", taskController.updateTask);

//delete task
router.delete("/:id", taskController.deleteTask);

module.exports = router;

