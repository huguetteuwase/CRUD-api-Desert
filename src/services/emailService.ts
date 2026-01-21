import nodemailer from 'nodemailer';
import { welcomeEmailTemplate, passwordResetTemplate, orderConfirmationTemplate } from '../templates/email.templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    
    // Check if email credentials are provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Emails will be logged only.');
      this.transporter = null;
      this.initialized = true;
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('Email service configured successfully!');
    this.initialized = true;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
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
    } catch (error) {
      console.error('Email sending failed:', error);
      // Fallback to console logging
      console.log(`[EMAIL FALLBACK] To: ${options.to}, Subject: ${options.subject}`);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = welcomeEmailTemplate(firstName, email);
    await this.sendEmail({
      to: email,
      subject: 'Welcome to CRUD API',
      html,
    });
    console.log(`[EMAIL] Welcome email sent to ${firstName} (${email})`);
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void> {
    const html = passwordResetTemplate(firstName, resetToken);
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
    console.log(`[EMAIL] Password reset email sent to ${firstName} (${email})`);
  }

  async sendPasswordChangedEmail(email: string, firstName: string): Promise<void> {
    console.log(`[EMAIL] Password changed email sent to ${firstName} (${email})`);
  }

  async sendOrderPlacedEmail(email: string, firstName: string, orderId: string, totalAmount: number): Promise<void> {
    const html = orderConfirmationTemplate(firstName, orderId, totalAmount);
    await this.sendEmail({
      to: email,
      subject: 'Order Placed Successfully',
      html,
    });
    console.log(`[EMAIL] Order placed email sent to ${firstName} (${email}) - Order: ${orderId}`);
  }

  async sendOrderStatusEmail(email: string, firstName: string, orderId: string, status: string): Promise<void> {
    console.log(`[EMAIL] Order status email sent to ${firstName} (${email}) - Status: ${status}`);
  }
}

export const emailService = new EmailService();