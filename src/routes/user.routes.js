const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Get global leaderboard (public)
router.get("/leaderboard", userController.getGlobalLeaderboard);

// Get user profile (protected - only your own profile or admin)
router.get("/:id", authMiddleware, userController.getUserProfile);

module.exports = router;