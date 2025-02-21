import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

export const AuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            console.error("No token provided in Authorization header");
            const error = new Error("Access denied! No token provided!");
            error.status = 401;
            throw error;
        }

        // Verify token and handle specific JWT errors
        const verifyTokenAndDecoding = jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if (err) {
                console.error("Token verification failed:", err.name);
                if (err.name === 'TokenExpiredError') {
                    const error = new Error("Token expired! Please login again.");
                    error.status = 401;
                    throw error;
                }
                if (err.name === 'JsonWebTokenError') {
                    const error = new Error("Invalid token format!");
                    error.status = 401;
                    throw error;
                }
                const error = new Error("Invalid token!");
                error.status = 401;
                throw error;
            }
            return decoded;
        });

        if (!verifyTokenAndDecoding) {
            console.error("Token verification returned null");
            const error = new Error("Invalid token!");
            error.status = 401;
            throw error;
        }

        req.accountId = verifyTokenAndDecoding.accountId;
        next();
    } catch (error) {
        console.error("Authentication error:", error);

        if (error instanceof Error) {
            return res.status(error.status || 500).json({
                message: error.message,
                errorType: error.name || "AuthenticationError"
            });
        }
        return res.status(500).json({
            message: "An unexpected error occurred while trying to authenticate the user!",
            errorType: "UnexpectedError"
        });
    }
}
