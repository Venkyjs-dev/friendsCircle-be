const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const {
  validateProfileEdit,
  validateForgotPassword,
} = require("../middleware/validation");
const { validationResult } = require("express-validator");
const { userAuth } = require("../middleware/userAuth");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, about, skills } = req.user;
    const profile = { firstName, lastName, about, skills };

    res.status(200).json({
      status: "Ok",
      data: req.user,
    });
  } catch (e) {
    res.status(403).json({
      status: "Not ok",
      message: "Invalid requirest: " + e.message,
    });
  }
});

profileRouter.patch(
  "/profile/edit",
  userAuth,
  validateProfileEdit,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ status: "Not Ok", errors: errors.array() });
      }

      const allowedUpdates = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "about",
        "skills",
        "photoUrl",
      ];
      const loggedInUser = req.user;

      Object.entries(req.body).forEach(([key, value]) => {
        if (!allowedUpdates.includes(key)) {
          throw new Error("Email/password or not editable!");
        }

        if (value) {
          loggedInUser[key] = value;
        }
      });
      await loggedInUser.save();

      const {
        firstName,
        lastName,
        age,
        gender,
        photoUrl,
        skills,
        about,
        emailId,
      } = loggedInUser;

      const updateUserData = {
        firstName,
        lastName,
        emailId,
        age,
        gender,
        photoUrl,
        about,
        skills,
      };
      res.status(200).json({
        message: `${loggedInUser.firstName} your profile updated successfully `,
        data: updateUserData,
      });
    } catch (e) {
      res.status(400).json({
        status: "Not Ok",
        message: "Unable to update profile: " + e.message,
      });
    }
  }
);

profileRouter.patch(
  "/profile/update-password",
  validateForgotPassword,
  userAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ status: "Not Ok", errors: errors.array() });
      }
      const user = req.user;

      const { oldPassword, newPassword } = req.body;
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) throw new Error("Invalid password!");
      const passwordHash = await bcrypt.hash(newPassword, 10);

      user.password = passwordHash;

      await user.save();

      res.status(200).json({
        status: "Ok",
        message: "Password updated succefully login again!",
      });
    } catch (e) {
      res.status(400).json({
        status: "Not Ok",
        message: "Invalid request email/password 1" + e.message,
      });
    }
  }
);

module.exports = profileRouter;
