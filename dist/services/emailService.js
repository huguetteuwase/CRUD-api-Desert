"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_templates_1 = require("../templates/email.templates");
class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }
    initialize() {
        if (this.initialized)
            return;
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
        // Check if email credentials are provided
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not configured. Emails will be logged only.');
            this.transporter = null;
            this.initialized = true;
            return;
        }
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log('Email service configured successfully!');
        this.initialized = true;
    }
    async sendEmail(options) {
        this.initialize(); // Initialize when first used
        try {
            // If no transporter configured, just log
            if (!this.transporter) {
                console.log(`[EMAIL] To: ${options.to}, Subject: ${options.subject}`);
                return;
            }
            await this.transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'CRUD API'}" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            console.log(`Email sent successfully to ${options.to}`);
        }
        catch (error) {
            console.error('Email sending failed:', error);
            // Fallback to console logging
            console.log(`[EMAIL FALLBACK] To: ${options.to}, Subject: ${options.subject}`);
        }
    }
    async sendWelcomeEmail(email, firstName) {
        const html = (0, email_templates_1.welcomeEmailTemplate)(firstName, email);
        await this.sendEmail({
            to: email,
            subject: 'Welcome to CRUD API',
            html,
        });
        console.log(`[EMAIL] Welcome email sent to ${firstName} (${email})`);
    }
    async sendPasswordResetEmail(email, firstName, resetToken) {
        const html = (0, email_templates_1.passwordResetTemplate)(firstName, resetToken);
        await this.sendEmail({
            to: email,
            subject: 'Password Reset Request',
            html,
        });
        console.log(`[EMAIL] Password reset email sent to ${firstName} (${email})`);
    }
    async sendPasswordChangedEmail(email, firstName) {
        console.log(`[EMAIL] Password changed email sent to ${firstName} (${email})`);
    }
    async sendOrderPlacedEmail(email, firstName, orderId, totalAmount) {
        const html = (0, email_templates_1.orderConfirmationTemplate)(firstName, orderId, totalAmount);
        await this.sendEmail({
            to: email,
            subject: 'Order Placed Successfully',
            html,
        });
        console.log(`[EMAIL] Order placed email sent to ${firstName} (${email}) - Order: ${orderId}`);
    }
    async sendOrderStatusEmail(email, firstName, orderId, status) {
        console.log(`[EMAIL] Order status email sent to ${firstName} (${email}) - Status: ${status}`);
    }
}
exports.emailService = new EmailService();
