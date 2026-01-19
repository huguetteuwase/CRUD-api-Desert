"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = require("../models/User");
// GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User_1.User.find().select("-password");
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
exports.getUsers = getUsers;
// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id).select("-password");
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
// POST /api/users
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const user = await User_1.User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || "customer",
        });
        const { password: _, ...userResponse } = user.toObject();
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userResponse,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.createUser = createUser;
// PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, role, isActive } = req.body;
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
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
        const { password: _, ...userResponse } = user.toObject();
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: userResponse,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.updateUser = updateUser;
// DELETE /api/users/:id
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
