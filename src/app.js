const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/auth.routes");
const problemRoutes = require("./routes/problem.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/problems", problemRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Online Judge API 🚀",
  });
});

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
  });
});

// Get All Users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database Error",
    });
  }
});

module.exports = app;