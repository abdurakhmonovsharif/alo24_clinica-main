const express = require("express");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");

const app = express();

// Middleware to enable CORS for localhost only
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Database connection
const { start } = require("./connectDB/db");
start(app);

// Routers
const { routers } = require("./routers/routers");
routers(app);

// Message scheduling
const { sendMessage } = require("./routers/message/message");
sendMessage();
setInterval(() => {
  sendMessage();
}, 1000 * 60 * 60 * 12);

// Static file serving in production
if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "./frontend", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./frontend", "build", "index.html"));
  });
}
