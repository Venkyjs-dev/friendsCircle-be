const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://<UserName>:<password>@mynodecluster.r553g.mongodb.net/<db name>"
  );
};

module.exports = connectDB;
