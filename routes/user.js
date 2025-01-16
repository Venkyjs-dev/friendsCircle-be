const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/validation");
const ConnectionRequest = require("../models/connectionRequest");

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
module.exports = userRouter;

/*
1. user shoudl be logged.
2. find all connections:
    - status === "accepted"
    - loggedUserId === fromUserId || loggedUserId === toUserId
3. get the other users data also using populate
4. if empty send error response
5. send resposne of all the valid connections 
*/
