const express = require("express");
const connectDB = require("./config/database");
const app = express();
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/requests.js");
const userRouter = require("./routes/user.js");
const PORT = 7777;
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("DB connection made successfully....");
    app.listen(PORT, () => {
      console.log("app started at " + PORT);
    });
  })
  .catch((e) => {
    console.log("DB connection failed: " + e.message);
  });

// mongodb+srv://venkatesh131755:yGiIuGKu7odxPDk5@mynodecluster.r553g.mongodb.net/
