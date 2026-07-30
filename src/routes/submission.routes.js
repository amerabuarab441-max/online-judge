const express = require("express");

const router = express.Router();

const submissionController = require("../controllers/submission.controller");
const authMiddleware = require("../middleware/auth.middleware");


// Create submission
router.post(
    "/",
    authMiddleware,
    submissionController.createSubmission
);


// Get current user submissions
router.get(
    "/my",
    authMiddleware,
    submissionController.getMySubmissions
);


// Get submissions of a problem
router.get(
    "/problem/:id",
    authMiddleware,
    submissionController.getProblemSubmissions
);


module.exports = router;