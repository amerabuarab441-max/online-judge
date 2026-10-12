const submissionService = require("../services/submission/submission.service");

exports.createSubmission = async (req, res) => {
    try {
        const submission = await submissionService.createSubmission(
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: "Submission created successfully",
            submission
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

// 🆕 مع pagination
exports.getMySubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        const result = await submissionService.getMySubmissions(
            req.user.id,
            page,
            limit
        );

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

// 🆕 مع صلاحيات و pagination
exports.getProblemSubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        const result = await submissionService.getProblemSubmissions(
            req.params.id,
            req.user.id,
            req.user.role,
            page,
            limit
        );

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(403).json({
            message: error.message
        });
    }
};

// 🆕 مع صلاحيات
exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await submissionService.getSubmissionById(
            req.params.id,
            req.user.id,
            req.user.role
        );

        res.json(submission);
    } catch (error) {
        console.error(error);

        const statusCode = error.message.includes("not found") ? 404 : 403;
        res.status(statusCode).json({
            message: error.message
        });
    }
};