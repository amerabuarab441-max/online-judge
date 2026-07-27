const authService = require("../services/auth.service");

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);

        res.json({
            message: "Register successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};