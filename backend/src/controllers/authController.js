const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email, password",
            });
        }

        // Check if email exist
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exist",
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        return res.status(201).json({
            message: "Register successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        // find email in database and get hash password
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        return res.status(200).json({
            message: "Login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Get current authenticated user
exports.getMe = async (req, res) => {
    try {
        return res.status(200).json({
            message: "User fetched successfully",
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const allowedUpdateFields = ["name", "email"];
        const updateFields = Object.keys(req.body);

        if (updateFields.length === 0) {
            return res.status(400).json({
                message: "No fields provided for update",
            });
        }

        const isValidOperation = updateFields.every((field) =>
            allowedUpdateFields.includes(field)
        );

        if (!isValidOperation) {
            return res.status(400).json({
                message: "Invalid update fields",
            });
        }

        const { name, email } = req.body;
        let trimmedName;
        let normalizedEmail;

        if (name !== undefined) {
            if (typeof name !== "string") {
                return res.status(400).json({
                    message: "Name must be a string",
                });
            }

            trimmedName = name.trim();

            if (trimmedName.length < 2) {
                return res.status(400).json({
                    message: "Name must be at least 2 characters",
                });
            }
        }

        if (email !== undefined) {
            if (typeof email !== "string") {
                return res.status(400).json({
                    message: "Email must be a string",
                });
            }

            normalizedEmail = email.trim().toLowerCase();

            if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
                return res.status(400).json({
                    message: "Please use a valid email address",
                });
            }
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (normalizedEmail && normalizedEmail !== user.email) {
            const existingUser = await User.findOne({ email: normalizedEmail });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email already exists",
                });
            }

            user.email = normalizedEmail;
        }

        if (trimmedName !== undefined) {
            user.name = trimmedName;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {
            return res.status(400).json({
                message: "Current password and new password must be strings",
            });
        }

        const trimmedCurrentPassword = currentPassword.trim();
        const trimmedNewPassword = newPassword.trim();

        if (!trimmedCurrentPassword || !trimmedNewPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }

        if (trimmedNewPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters",
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isCurrentPasswordMatch = await user.comparePassword(trimmedCurrentPassword);

        if (!isCurrentPasswordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }

        const isSameAsOldPassword = await user.comparePassword(trimmedNewPassword);

        if (isSameAsOldPassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        user.password = trimmedNewPassword;

        await user.save();

        return res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
