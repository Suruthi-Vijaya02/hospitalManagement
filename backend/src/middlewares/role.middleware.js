exports.roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Access denied: No user information found in request",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: Role '${req.user.role}' is not authorized to perform this action`,
            });
        }
        next();
    };
};