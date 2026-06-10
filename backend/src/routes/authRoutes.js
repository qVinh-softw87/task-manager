const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware.js");
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

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfileValidation, updateProfile);
router.put("/change-password", protect, changePasswordValidation, changePassword);

module.exports = router;
