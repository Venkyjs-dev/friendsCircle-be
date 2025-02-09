const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://<user name>:<password>@cluster0.cndea.mongodb.net/"
  );
};

module.exports = connectDB;
