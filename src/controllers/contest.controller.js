const contestService = require("../services/contest.service");

exports.createContest = async (req, res) => {
    try {
        const contest = await contestService.createContest(req.body, req.user.id);

        res.status(201).json({
            message: "Contest created successfully",
            contest
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.getContests = async (req, res) => {
    try {
        const contests = await contestService.getContests();
        res.json(contests);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.getContestById = async (req, res) => {
    try {
        const contest = await contestService.getContestById(
            req.params.id,
            req.user ? req.user.id : null
        );
        res.json(contest);
    } catch (error) {
        console.error(error);

        const statusCode = error.message.includes("not found") ? 404 : 400;
        res.status(statusCode).json({
            message: error.message
        });
    }
};

exports.joinContest = async (req, res) => {
    try {
        const participant = await contestService.joinContest(
            req.params.id,
            req.user.id
        );

        res.status(201).json({
            message: "Joined contest successfully",
            participant
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.addProblemToContest = async (req, res) => {
    try {
        const contestProblem = await contestService.addProblemToContest(
            req.params.id,
            req.body.problemId,
            req.user.id
        );

        res.status(201).json({
            message: "Problem added to contest successfully",
            contestProblem
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.removeProblemFromContest = async (req, res) => {
    try {
        await contestService.removeProblemFromContest(
            req.params.id,
            req.params.problemId
        );

        res.json({
            message: "Problem removed from contest successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await contestService.getLeaderboard(req.params.id);
        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.startVirtualContest = async (req, res) => {
    try {
        const result = await contestService.startVirtualContest(
            req.params.id,
            req.user.id
        );

        res.status(201).json({
            message: "Virtual contest started successfully",
            ...result
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};