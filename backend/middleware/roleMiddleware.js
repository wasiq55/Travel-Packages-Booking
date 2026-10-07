
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log("Authenticated user role:", req.user?.role);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = authorize;