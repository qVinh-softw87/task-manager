const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check authorization
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check token
        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user in database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                message: "Not authorized, user not found"
            });
        }

        // Assign user to req.user, use next() for handling in controller
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message
        });
    }
};
