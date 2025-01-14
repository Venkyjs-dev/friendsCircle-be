const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middleware/validation");

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.userId;
      const status = req.params.status;

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status))
        throw new Error(`Invalid status type: ${status}`);

      const toUser = await User.findById(toUserId);
      if (!toUser) throw new Error("User not found!");

      const existingConnection = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnection) throw new Error("Duplicate connection!");

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await connectionRequest.save();

      res.status(200).json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName} `,
      });
    } catch (err) {
      res.status(400).json({
        message: "Error: " + err.message,
      });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status))
        throw new Error("Invalid StatusType " + status);

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) throw new Error("Connection Request Not Found!");

      connectionRequest.status = status;

      const data = await connectionRequest.save();
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
  }
);

/*
1. user should loggedIn
2. validate req:
    - status: it should only accepted or rejected 
    - requestId: it should present in db
3. loggedIn user should be toUserId
4. status in connection request should be only interested
5. modify status to accpeted or rejected 
6. save the connectionrequest back to db;
*/

module.exports = requestRouter;
