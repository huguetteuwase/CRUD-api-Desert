"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Access denied. No token provided.",
            });
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                error: "Invalid token",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: "Invalid token",
        });
    }
};
exports.authenticate = authenticate;
// Authorization middleware
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Access denied. Insufficient permissions.",
            });
        }
        next();
    };
};
exports.authorize = authorize;
