const express = require("express");

const router = express.Router();

const submissionController =
require("../controllers/submission.controller");

const authMiddleware =
require("../middleware/auth.middleware");



router.post(
    "/",
    authMiddleware,
    submissionController.createSubmission
);



router.get(
    "/my",
    authMiddleware,
    submissionController.getMySubmissions
);



router.get(
    "/problem/:id",
    authMiddleware,
    submissionController.getProblemSubmissions
);



router.get(
    "/:id",
    authMiddleware,
    submissionController.getSubmissionById
);



module.exports = router;