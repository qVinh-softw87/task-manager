const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        dueDate: {
            type: Date,
        },

        timeSpent: {
            type: Number,
            default: 0,
        },

        lastStartedAt: {
            type: Date,
            default: null,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        deletedAt: {
            type: Date,
            default: null,
            index: { expires: 691200 } // Auto delete after 8 days (691200 seconds) when deletedAt is set
        },
    },

    {
        timestamps: true,
    }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
