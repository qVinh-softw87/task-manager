const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware.js");
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
} = require("../controllers/authController.js");

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
