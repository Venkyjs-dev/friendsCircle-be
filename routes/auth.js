const express = require("express");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const {
  validateSignup,
  validateLogin,
} = require("../middleware/validation.js");
const logger = require("../utils/logger.js");

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateSignup, // Apply validation middleware
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessage = `Input validation failed: ${errors}`;
      logger.error(errorMessage);

      // Send a generic error response
      return res.status(400).json({
        status: "failed",
        message: "Invalid input. Please check your data and try again.",
      });
    }

    // Extract and sanitize user details from the request body
    const { firstName, lastName, emailId, password } = req.body;

    try {
      // Check if a user with the same email already exists in the database
      const existingUser = await User.findOne({ emailId });
      if (existingUser) {
        // If user exists, return a generic conflict response
        return res.status(400).json({
          status: "failed",
          message: "Email ID already exists, please use a different one.",
        });
      }

      // Hash the password using bcrypt with 10 salt rounds for security
      const passwordHash = await bcrypt.hash(password, 10);

      // Create a new user document with the hashed password and other details
      const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
      });

      // Save the user document to the database
      await user.save();

      const successMessage = `User signed up successfully: {"firstName": "${firstName}", "lastName": "${lastName}", "emailId": "${emailId}"}`;

      // Log success message
      logger.info(successMessage);

      // Send a success response upon user creation
      res.status(201).json({
        status: "success",
        message: "User created successfully",
      });
    } catch (e) {
      // Handle unexpected errors (e.g., database issues)

      const errorMessage = `Signup failed - Error: ${e.message}`;
      logger.error(errorMessage);

      res.status(500).json({
        status: "failed",
        message: "Internal server error. Please try again later.",
      });
    }
  }
);

authRouter.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid input. Please check your data and try again. 1",
      });
    }
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(401).json({
        status: "Not Ok",
        message: "User not found",
      });
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid)
      return res.status(400).json({
        status: "not ok",
        message: "Invalid credidecntials ",
      });

    // create a token
    const token = await user.getJWT();
    // add token into cookie and send to client
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });

    res.status(200).json({
      status: "Ok",
      data: user,
    });
    logger.info(`${emailId} logged in successfully`);
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid input. Please check your data and try again.",
    });
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.json({
    status: "Ok",
    message: "Logout succefully",
  });
});

module.exports = authRouter;

/*
Steps to write signup api :
  1. validate req.body using express-validator middleware functions
  2. check the email alredy exiting in db
  3. hash the password 
  4. save the user on db
  5. send proper json response
*/
