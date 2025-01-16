const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/userAuth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_DATA = "firstName lastName age gender about skills photoUrl";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_DATA)
      .populate("toUserId", USER_DATA);
    if (connectionRequests.length == 0)
      throw new Error("No pending requests for this user!");
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.status(200).json({
      status: "Ok",
      data,
    });
  } catch (err) {
    res.status(400).json({
      status: "Not Ok",
      message: "Error: " + err.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      status: "accepted",
    }).populate("fromUserId", USER_DATA);
    if (connections.length === 0)
      throw new Error("User don't have connections");

    const data = connections.map((row) => row.fromUserId);

    res.status(200).json({
      status: "Ok",
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: "Not Ok",
      message: "Error: " + error.message,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const feed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_DATA);
    res.status(200).json({
      status: "OK",
      data: feed,
    });
  } catch (err) {
    res.status(400).json({
      status: "Not Ok",
      message: "ERROR: " + err.message,
    });
  }
});
module.exports = userRouter;
/*

Feed API Logic

1. need to send all the users present in my user collection in db
2. don't show these profiles in feed : 
    - own profile
    - sent connections - interested/ignored
    - received connections - accepted/rejected
3. logic:
    - get all the connection requests of the logged in user in the connection request collections.
        - loggedInUserId == fromUserId || loggedInUserId == toUserId
    - get the exact unique id's to which needs to be removed, in an array format.
    - write query on User collection and ignore the above unique ids and get the other users
    - show only proper data.


















*/
