const problemService = require("../services/problem.service");

exports.createProblem = async (req, res) => {
    try {

        const problem = await problemService.createProblem(
            req.body,
            req.user.id
        );

        res.status(201).json({
            message: "Problem created successfully",
            problem
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};