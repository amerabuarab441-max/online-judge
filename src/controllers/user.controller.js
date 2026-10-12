const userService = require("../services/user.service");

exports.getUserProfile = async (req, res) => {
    try {
        const profile = await userService.getUserProfile(req.params.id);
        res.json(profile);
    } catch (error) {
        console.error(error);
        const statusCode = error.message === "User not found" ? 404 : 400;
        res.status(statusCode).json({
            message: error.message
        });
    }
};

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = await userService.getGlobalLeaderboard(limit);
        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};