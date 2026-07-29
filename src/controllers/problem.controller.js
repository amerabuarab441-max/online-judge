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
exports.getProblems = async (req, res) => {

    try {

        const problems = await problemService.getProblems();

        res.json(problems);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};



exports.getProblemById = async (req, res) => {

    try {

        const problem = await problemService.getProblemById(
            req.params.id
        );


        res.json(problem);


    } catch (error) {

        console.error(error);

        res.status(404).json({
            message: error.message
        });

    }

};
exports.updateProblem = async (req, res) => {

    try {

        const problem = await problemService.updateProblem(
            req.params.id,
            req.body
        );

        res.json({
            message: "Problem updated successfully",
            problem
        });


    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};
exports.deleteProblem = async (req, res) => {

    try {

        await problemService.deleteProblem(
            req.params.id
        );

        res.json({
            message: "Problem deleted successfully"
        });


    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};