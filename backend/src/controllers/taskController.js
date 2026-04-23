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

// getTasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    return res.status(200).json({
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// getTaskById
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task id format",
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      req.body,

      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      data: task,
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task id format",
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task completed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
