const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware.js");
const { 
    register, 
    login, 
    getMe } = require("../controllers/authController.js");

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);

module.exports = router;
