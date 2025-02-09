const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      minLength: 2,
      maxLength: 50,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 50,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Invalid Gender: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "Hey there is node js learnign project!",
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error("only 10 skill an add!");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://randomuser.me/api/portraits/men/1.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("invalid photo url!" + value);
        }
      },
    },
  },
  { timestamps: true }
);

UserSchema.methods.getJWT = async function () {
  try {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "VENKY@123");
    return token;
  } catch (e) {
    res.status(400).json({
      status: "Not Ok",
    });
  }
};

UserSchema.methods.validatePassword = async function (password) {
  try {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    return isPasswordValid;
  } catch (e) {
    res.status(400).json({
      status: "Not Ok",
    });
  }
};

module.exports = model("User", UserSchema);
