const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware.js");
const { authLimiter } = require("../middleware/rateLimitMiddleware.js");
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    updateProfileValidation,
} = require("../middleware/validationMiddleware.js");
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    refresh,
    logout,
} = require("../controllers/authController.js");

router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfileValidation, updateProfile);
router.put("/change-password", protect, authLimiter, changePasswordValidation, changePassword);

module.exports = router;
