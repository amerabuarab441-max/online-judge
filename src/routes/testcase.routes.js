const express = require("express");
const router = express.Router();
const testcaseController = require("../controllers/testcase.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// جلب كل الـ test cases لمشكلة معينة
router.get(
    "/problem/:problemId",
    authMiddleware,
    testcaseController.getTestCasesByProblem
);

// إنشاء test case جديد (للأدمن فقط)
router.post(
    "/",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    testcaseController.createTestCase
);

// حذف test case (للأدمن فقط)
router.delete(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    testcaseController.deleteTestCase
);

// تحديث test case (للأدمن فقط)
router.put(
    "/:id",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    testcaseController.updateTestCase
);

module.exports = router;