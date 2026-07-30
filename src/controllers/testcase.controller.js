const testcaseService = require("../services/testcase.service");


exports.createTestCase = async (req, res) => {

    try {

        const testCase = await testcaseService.createTestCase(
            req.params.id,
            req.body
        );

        res.status(201).json({
            message: "Test case created successfully",
            testCase
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};


exports.getProblemTestCases = async (req, res) => {

    try {

        const testCases = await testcaseService.getProblemTestCases(
            req.params.id
        );

        res.json(testCases);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};


exports.deleteTestCase = async (req, res) => {

    try {

        await testcaseService.deleteTestCase(
            req.params.id
        );

        res.json({
            message: "Test case deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    }
};