const express = require("express");
const router = express.Router();

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    bulkUpdateTasks,
    restoreTask,
    permanentDeleteTask,
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

// bulk delete tasks
router.post("/bulk-delete", bulkDeleteTasks);

// bulk update tasks
router.post("/bulk-update", bulkUpdateTasks);

// get task by id
router.get("/:id", getTaskById);

// update task
router.put("/:id", updateTaskValidation, updateTask);

// delete task (soft delete)
router.delete("/:id", deleteTask);

// restore task
router.put("/:id/restore", restoreTask);

// permanent delete task
router.delete("/:id/permanent", permanentDeleteTask);

module.exports = router;
