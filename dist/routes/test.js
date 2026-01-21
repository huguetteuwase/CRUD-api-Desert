"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
// Test email endpoint
router.post("/test-email", async (req, res) => {
    try {
        const { email, firstName } = req.body;
        if (!email || !firstName) {
            return res.status(400).json({ error: "Email and firstName required" });
        }
        await emailService_1.emailService.sendWelcomeEmail(email, firstName);
        res.json({
            success: true,
            message: "Test email sent (check console logs)"
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
