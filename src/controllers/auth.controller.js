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

        res.status(400).json({
            message: error.message
        });

    }
};



exports.login = async (req, res) => {
    try {

        const result = await authService.login(req.body);

        res.json({
            message: "Login successful",
            ...result
        });

    } catch (error) {

        console.error(error);

        res.status(401).json({
            message: error.message
        });

    }
};