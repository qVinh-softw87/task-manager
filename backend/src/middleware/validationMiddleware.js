const { body, validationResult } = require("express-validator");

// Helper to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg, // Return the first error message
    });
  }
  next();
};

const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[a-zA-Z]/).withMessage("Password must contain at least one letter"),
  validate
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  validate
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
    .matches(/\d/).withMessage("New password must contain at least one number")
    .matches(/[a-zA-Z]/).withMessage("New password must contain at least one letter"),
  validate
];

const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"]).withMessage("Invalid status value"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"]).withMessage("Invalid priority value"),
  body("dueDate")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid due date");
      }
      return true;
    }),
  validate
];

const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"]).withMessage("Invalid status value"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"]).withMessage("Invalid priority value"),
  body("dueDate")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid due date");
      }
      return true;
    }),
  validate
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Name cannot be empty")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email")
    .optional()
    .trim()
    .notEmpty().withMessage("Email cannot be empty")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  createTaskValidation,
  updateTaskValidation,
  updateProfileValidation
};
