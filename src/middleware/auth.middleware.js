const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authorization header is missing"
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    const token = authHeader.substring(7);

    if (!token) {
        return res.status(401).json({
            message: "Token is missing"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({
                message: "Token has expired"
            });

        }

        if (error.name === "JsonWebTokenError") {

            return res.status(401).json({
                message: "Invalid token"
            });

        }

        return res.status(401).json({
            message: "Authentication failed"
        });

    }

}

module.exports = authMiddleware;