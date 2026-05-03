const mongoose = require("mongoose");
const Task = require("../models/Task");

const ALLOWED_STATUS = ["pending", "in-progress", "completed"];
const ALLOWED_PRIORITY = ["low", "medium", "high"];
const ALLOWED_SORT = ["createdAt", "-createdAt", "dueDate", "-dueDate"];

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

        const task = await Task.create({
            ...normalizedData,
            user: req.user._id,
        });

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
        } = validatedQuery;

        const filter = {
            user: req.user._id,
        };

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

        Object.assign(task, normalizedData);

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
