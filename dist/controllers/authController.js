"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.getMe = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
// POST /auth/register
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                error: "All fields are required",
            });
        }
        // Validate role if provided
        if (role && !["customer", "vendor", "admin"].includes(role)) {
            return res.status(400).json({
                error: "Invalid role. Must be customer, vendor, or admin",
            });
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: "User already exists with this email",
            });
        }
        // Create new user (password hashed automatically)
        const user = await User_1.User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || "customer", // Use provided role or default to customer
        });
        // Generate token
        const token = (0, jwt_1.generateToken)(user._id.toString());
        // Remove password from response
        const { password: _, ...userResponse } = user.toObject();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user: userResponse, token },
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};
exports.register = register;
// POST /auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are incorrect",
            });
        }
        // Find user and include password field
        const user = await User_1.User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                error: "Account is deactivated",
            });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)(user._id.toString());
        // Remove password from response
        const { password: _, ...userResponse } = user.toObject();
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: { user: userResponse, token },
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};
exports.login = login;
// GET /auth/me
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user,
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};
exports.getMe = getMe;
// POST /auth/logout
const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password reset token generated",
            resetToken, // In production, send this via email
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
// POST /auth/reset-password/:resetToken
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { resetToken } = req.params;
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }
        // Hash token to compare
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        const user = await User_1.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }
        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.resetPassword = resetPassword;
// PUT /auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: "Current password and new password are required",
            });
        }
        const user = await User_1.User.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.changePassword = changePassword;
// GET /auth/users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.User.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.getAllUsers = getAllUsers;
// GET /auth/users/:id (Admin only)
const getUserById = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.getUserById = getUserById;
// PUT /auth/users/:id (Admin only)
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, role, isActive } = req.body;
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Update fields
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (email)
            user.email = email;
        if (role)
            user.role = role;
        if (isActive !== undefined)
            user.isActive = isActive;
        await user.save();
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.updateUser = updateUser;
// DELETE /auth/users/:id (Admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.deleteUser = deleteUser;
