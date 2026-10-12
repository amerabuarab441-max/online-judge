const express = require("express");
const cors = require("cors");

const prisma = require("./config/prisma");

const authRoutes = require("./routes/auth.routes");
const problemRoutes = require("./routes/problem.routes");
const testcaseRoutes = require("./routes/testcase.routes");
const submissionRoutes = require("./routes/submission.routes");
const contestRoutes = require("./routes/contest.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/problems", problemRoutes);
app.use("/testcases", testcaseRoutes);
app.use("/submissions", submissionRoutes);
app.use("/contests", contestRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Online Judge API 🚀",
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
    });
});

module.exports = app;