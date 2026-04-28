const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email, password"
            });
        }

        // Check if email exist
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exist"
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        return res.status(201).json({
            message: "Register successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
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
                message: "Please provide email and password"
            });
        }

        // find email in database and get hash password
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        return res.status(200).json({
            message: "Login successful",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// Get current user is made by protect middleware for FE handler
exports.getMe = async(req, res) => {
    try {
        return res.status(200).json({
            message: "User fetched successfully",
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch(error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
