const express = require("express");
const router = express.Router();

const problemController = require("../controllers/problem.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


router.post(
    "/",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    problemController.createProblem
);

router.put(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    problemController.updateProblem
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    problemController.deleteProblem
);

router.get(
    "/",
    problemController.getProblems
);


router.get(
    "/:id",
    problemController.getProblemById
);


module.exports = router;