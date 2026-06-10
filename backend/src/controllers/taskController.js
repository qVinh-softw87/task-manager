const mongoose = require("mongoose");
const Task = require("../models/Task");

const ALLOWED_STATUS = ["pending", "in-progress", "completed"];
const ALLOWED_PRIORITY = ["low", "medium", "high"];
const ALLOWED_SORT = ["createdAt", "-createdAt", "dueDate", "-dueDate", "priority", "-priority", "timeSpent", "-timeSpent"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const isValidStatus = (status) => ALLOWED_STATUS.includes(status);
const isValidPriority = (priority) => ALLOWED_PRIORITY.includes(priority);
const isValidSort = (sort) => ALLOWED_SORT.includes(sort);
const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());
const trimValue = (value) => (typeof value === "string" ? value.trim() : value);
const isEmptyString = (value) => typeof value === "string" && value.trim() === "";

const validateTaskQuery = (query) => {
    const {
        status,
        priority,
        search,
        sort,
        page = 1,
        limit = 10,
    } = query;

    const trimmedSearch = search ? search.trim() : "";
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (status && !isValidStatus(status)) {
        return { error: "Invalid status value" };
    }

    if (priority && !isValidPriority(priority)) {
        return { error: "Invalid priority value" };
    }

    if (sort && !isValidSort(sort)) {
        return { error: "Invalid sort value" };
    }

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        return { error: "Page must be a positive integer" };
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 50) {
        return { error: "Limit must be a positive integer and not greater than 50" };
    }

    return {
        status,
        priority,
        search: trimmedSearch,
        sortOption: sort || "-createdAt",
        pageNumber,
        limitNumber,
        isTrash: query.isTrash === 'true',
    };
};

const validateTaskPayload = (payload, { isUpdate = false } = {}) => {
    const normalizedData = {};

    if (!isUpdate || payload.title !== undefined) {
        const trimmedTitle = trimValue(payload.title);

        if (!trimmedTitle) {
            return { error: isUpdate ? "Title cannot be empty" : "Title is required" };
        }

        normalizedData.title = trimmedTitle;
    }

    if (payload.description !== undefined) {
        normalizedData.description = trimValue(payload.description);
    }

    if (payload.priority !== undefined) {
        if (isEmptyString(payload.priority) || !isValidPriority(payload.priority)) {
            return { error: "Invalid priority value" };
        }

        normalizedData.priority = payload.priority;
    }

    if (payload.status !== undefined) {
        if (isEmptyString(payload.status) || !isValidStatus(payload.status)) {
            return { error: "Invalid status value" };
        }

        normalizedData.status = payload.status;
    }

    if (payload.dueDate !== undefined) {
        if (payload.dueDate === null || isEmptyString(payload.dueDate) || !isValidDate(payload.dueDate)) {
            return { error: "Invalid dueDate value" };
        }

        normalizedData.dueDate = payload.dueDate;
    }

    return { normalizedData };
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { error, normalizedData } = validateTaskPayload(req.body);

        if (error) {
            return res.status(400).json({
                message: error,
            });
        }

        const status = normalizedData.status || "pending";
        const taskData = {
            ...normalizedData,
            user: req.user._id,
        };
        if (status === "in-progress") {
            taskData.lastStartedAt = new Date();
        }
        const task = await Task.create(taskData);

        return res.status(201).json({
            message: "Task created successfully",
            data: task,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Get tasks with filter, search, sort, and pagination
exports.getTasks = async (req, res) => {
    try {
        const validatedQuery = validateTaskQuery(req.query);

        if (validatedQuery.error) {
            return res.status(400).json({
                message: validatedQuery.error,
            });
        }

        const {
            status,
            priority,
            search,
            sortOption,
            pageNumber,
            limitNumber,
            isTrash,
        } = validatedQuery;

        const filter = {
            user: req.user._id,
        };

        if (isTrash) {
            filter.deletedAt = { $ne: null };
        } else {
            filter.deletedAt = null;
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // Filter by priority
        if (priority) {
            filter.priority = priority;
        }

        // Search by title
        if (search) {
            filter.title = {
                $regex: search,
                $options: "i",
            };
        }

        // Pagination
        const skip = (pageNumber - 1) * limitNumber;

        const tasks = await Task.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber);

        const total = await Task.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNumber);

        return res.status(200).json({
            message: "Tasks fetched successfully",
            data: tasks,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Get a single task by 
exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task id format",
            });
        }

        const task = await Task.findOne({
            _id: id,
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

// Update a task by id
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task id format",
            });
        }

        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const { error, normalizedData } = validateTaskPayload(req.body, { isUpdate: true });

        if (error) {
            return res.status(400).json({
                message: error,
            });
        }

        const oldStatus = task.status;
        const newStatus = normalizedData.status;

        Object.assign(task, normalizedData);

        if (newStatus !== undefined && newStatus !== oldStatus) {
            if (newStatus === "in-progress") {
                task.lastStartedAt = new Date();
            } else if (oldStatus === "in-progress") {
                if (task.lastStartedAt) {
                    const elapsed = Math.floor((new Date() - new Date(task.lastStartedAt)) / 1000);
                    task.timeSpent = (task.timeSpent || 0) + elapsed;
                }
                task.lastStartedAt = null;
            }
        }

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

// Delete a task by id
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task id format",
            });
        }

        const task = await Task.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        task.deletedAt = new Date();
        if (task.status === "in-progress" && task.lastStartedAt) {
            const elapsed = Math.floor((new Date() - new Date(task.lastStartedAt)) / 1000);
            task.timeSpent = (task.timeSpent || 0) + elapsed;
            task.lastStartedAt = null;
        }
        await task.save();

        return res.status(200).json({
            message: "Task moved to trash successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Bulk delete tasks (soft delete)
exports.bulkDeleteTasks = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Task IDs are required" });
        }

        const validIds = ids.filter(isValidObjectId);
        if (validIds.length === 0) {
            return res.status(400).json({ message: "No valid Task IDs provided" });
        }

        await Task.updateMany({
            _id: { $in: validIds },
            user: req.user._id,
        }, {
            $set: { deletedAt: new Date() }
        });

        return res.status(200).json({ message: "Tasks moved to trash successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Bulk update tasks
exports.bulkUpdateTasks = async (req, res) => {
    try {
        const { ids, updateData } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Task IDs are required" });
        }
        
        if (!updateData) {
             return res.status(400).json({ message: "Update data is required" });
        }

        const validIds = ids.filter(isValidObjectId);
        
        await Task.updateMany(
            { _id: { $in: validIds }, user: req.user._id },
            { $set: updateData }
        );

        return res.status(200).json({ message: "Tasks updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Restore a task
exports.restoreTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task id format" });
        }

        const task = await Task.findOne({ _id: id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.deletedAt = null;
        await task.save();

        return res.status(200).json({
            message: "Task restored successfully",
            data: task
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Permanently delete a task
exports.permanentDeleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task id format" });
        }

        const task = await Task.findOne({ _id: id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        await task.deleteOne();

        return res.status(200).json({
            message: "Task permanently deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get analytics
exports.getTaskAnalytics = async (req, res) => {
    try {
        // Find tasks that are not soft-deleted
        const tasks = await Task.find({ user: req.user._id, deletedAt: null });

        const totalTasks = tasks.length;
        let pending = 0;
        let inProgress = 0;
        let completed = 0;
        let totalTimeSpent = 0;

        // Last 7 days data grouping
        const last7DaysTasks = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            last7DaysTasks.push({
                date: d.toISOString().split('T')[0], // YYYY-MM-DD
                count: 0
            });
        }

        tasks.forEach(task => {
            if (task.status === 'pending') pending++;
            else if (task.status === 'in-progress') inProgress++;
            else if (task.status === 'completed') {
                completed++;
                // If it's completed, we use updatedAt to approximate completion date
                const updatedDateStr = task.updatedAt.toISOString().split('T')[0];
                const dayMatch = last7DaysTasks.find(d => d.date === updatedDateStr);
                if (dayMatch) {
                    dayMatch.count++;
                }
            }
            totalTimeSpent += (task.timeSpent || 0);
        });

        const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

        return res.status(200).json({
            message: "Analytics fetched successfully",
            data: {
                totalTasks,
                pending,
                inProgress,
                completed,
                completionRate,
                totalTimeSpent,
                weeklyData: last7DaysTasks
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
