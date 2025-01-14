const winston = require("winston");
const path = require("node:path");

// Define the log file path (you can specify the directory and file name)
const logFilePath = path.join(__dirname, "..", "logs", "user-signup.txt");

// Create logs directory if it doesn't exist
const fs = require("fs");
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

// Create a logger instance
const logger = winston.createLogger({
  level: "info", // Minimum level to log
  transports: [
    // Log to file (txt format)
    new winston.transports.File({
      filename: logFilePath,
      level: "info", // Log info and above
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} - ${level.toUpperCase()} - ${message}`;
        })
      ),
    }),
  ],
});

module.exports = logger;
