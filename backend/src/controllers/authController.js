const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

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

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(201).json({
            message: "Register successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: accessToken,
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

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            message: "Login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: accessToken,
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
                avatar: req.user.avatar,
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
        const allowedUpdateFields = ["name", "email", "avatar"];
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

        if (req.body.avatar !== undefined) {
            user.avatar = req.body.avatar;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
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

// Refresh Token
exports.refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "No refresh token provided",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({
                message: "Token is not valid or expired",
            });
        }

        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(403).json({
                message: "User not found",
            });
        }

        // Generate new pair of tokens (Sliding Session)
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Send new refresh token in HTTP-only cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            data: {
                token: newAccessToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
