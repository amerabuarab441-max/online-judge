const submissionService = require("../services/submission.service");


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



exports.getMySubmissions = async (req, res) => {

    try {

        const submissions = await submissionService.getMySubmissions(
            req.user.id
        );


        res.json(submissions);


    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};



exports.getProblemSubmissions = async (req, res) => {

    try {

        const submissions = await submissionService.getProblemSubmissions(
            req.params.id
        );


        res.json(submissions);


    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};