const express = require("express");

const router = express.Router();

const testcaseController = require("../controllers/testcase.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post(
    "/problems/:id/testcases",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    testcaseController.createTestCase
);

router.get(
    "/problems/:id/testcases",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    testcaseController.getProblemTestCases
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    testcaseController.deleteTestCase
);

module.exports = router;