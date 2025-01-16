const jwt = require("jsonwebtoken");
const User = require("../models/user");

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
  userAuth,
};
