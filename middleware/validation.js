const { check } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const validateSignup = [
  check("firstName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("First name is required."),
  check("lastName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),
  check("emailId")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email."),
  check("password")
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      "Password must include uppercase, lowercase, digit, and special character."
    ),
];

const validateLogin = [
  check("emailId")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email."),
  check("password")
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      "Password must include uppercase, lowercase, digit, and special character."
    ),
];

const validateProfileEdit = [
  // Validate firstName (optional field)
  check("firstName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be a string between 2 and 50 characters."),

  // Validate lastName (optional field)
  check("lastName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be a string between 2 and 50 characters."),

  // Validate about (optional field)
  check("about")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("About section can have a maximum of 200 characters."),

  // Validate skills (optional field)
  check("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array.")
    .custom((skills) => {
      if (!skills.every((skill) => typeof skill === "string")) {
        throw new Error("Each skill must be a string.");
      }
      return true;
    }),

  // Validate age (optional field)
  check("age")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be an integer between 0 and 120."),

  // Validate gender (optional field)
  check("gender")
    .optional()
    .isIn(["male", "female", "non-binary", "other", "prefer not to say"])
    .withMessage(
      "Gender must be one of: male, female, non-binary, other, or prefer not to say."
    ),

  // Validate photoUrl (optional field)
  check("photoUrl")
    .optional()
    .isString()
    .trim()
    .isURL()
    .withMessage("Photo URL must be a valid URL."),
];

const validateForgotPassword = [
  check("newPassword")
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      "Password must include uppercase, lowercase, digit, and special character."
    ),
  check("oldPassword")
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      "Password must include uppercase, lowercase, digit, and special character."
    ),
];

const userAuth = async function (req, res, next) {
  try {
    const cookies = req.cookies;
    const { token } = cookies;

    if (!token) throw new Error("invalid token");

    const decodedMessage = await jwt.verify(token, "VENKY@123");
    const { _id } = decodedMessage;
    const user = await User.findById(_id);

    if (!user) throw new Error("user not found");

    req.user = user;

    next();
  } catch (e) {
    res.status(400).json({
      status: "Not Ok",
      message: "Invalid token: " + e.message,
    });
  }
};

module.exports = {
  validateSignup,
  validateLogin,
  validateProfileEdit,
  validateForgotPassword,
  userAuth,
};
