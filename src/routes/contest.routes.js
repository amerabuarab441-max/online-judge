const express = require("express");
const router = express.Router();
const contestController = require("../controllers/contest.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// جلب كل المسابقات (متاح للجميع)
router.get("/", contestController.getContests);

// جلب تفاصيل مسابقة (متاح للجميع)
router.get("/:id", contestController.getContestById);

// لوحة الصدارة (متاح للجميع)
router.get("/:id/leaderboard", contestController.getLeaderboard);

// إنشاء مسابقة (أدمن فقط)
router.post(
    "/",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    contestController.createContest
);

// الانضمام إلى مسابقة (متسابق مسجل)
router.post(
    "/:id/join",
    authMiddleware,
    contestController.joinContest
);

// بدء مسابقة افتراضية (متسابق مسجل)
router.post(
    "/:id/virtual",
    authMiddleware,
    contestController.startVirtualContest
);

// إضافة مشكلة لمسابقة (أدمن فقط)
router.post(
    "/:id/problems",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    contestController.addProblemToContest
);

// حذف مشكلة من مسابقة (أدمن فقط)
router.delete(
    "/:id/problems/:problemId",
    authMiddleware,
    authorize("ADMIN", "PROBLEM_SETTER"),
    contestController.removeProblemFromContest
);

module.exports = router;