const express = require("express");
const router = express.Router();

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");
const {
    createTaskValidation,
    updateTaskValidation,
} = require("../middleware/validationMiddleware");

// protect all task route before handling, must be login
router.use(protect);

// create task
router.post("/", createTaskValidation, createTask);

// get all tasks
router.get("/", getTasks);

// get task by id
router.get("/:id", getTaskById);

// update task
router.put("/:id", updateTaskValidation, updateTask);

// delete task
router.delete("/:id", deleteTask);

module.exports = router;
