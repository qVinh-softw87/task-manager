const mongoose = require("mongoose");
const Task = require("../models/Task");

// createTask
exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required",
            });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            user: req.user._id,
        });

        return res.status(200).json({
            message: "Task created successfully",
            data: task,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// getAllTasks from user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Tasks fetched successfully",
            data: tasks,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// getTaskById (detail task from user)
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        return res.status(200).json({
            message: "Task fetched successfully",
            data: task,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// updateTask
exports.updateTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, status } = req.body;

        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (status !== undefined) task.status = status;

        const updatedTask = await task.save();

        return res.status(200).json({
            message: "Task updated successfully",
            data: updatedTask,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// deleteTask
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        await task.deleteOne();

        return res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
