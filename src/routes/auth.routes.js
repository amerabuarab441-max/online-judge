const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Protected route",
        user: req.user
    });
});

router.get(
    "/admin",
    authMiddleware,
    authorize("ADMIN"),
    (req, res) => {
        res.json({
            message: "Welcome Admin",
            user: req.user
        });
    }
);

module.exports = router;