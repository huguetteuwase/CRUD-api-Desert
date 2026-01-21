// controllers/authController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { emailService } from "../services/emailService";
import { emailVerificationTemplate } from "../templates/email.templates";
import crypto from "crypto";

interface AuthRequest extends Request {
  user?: any;
}

// POST /auth/register
export const register = async (req: Request, res: Response) => {
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "User already exists with this email",
      });
    }

    // Create new user (password hashed automatically)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "customer", // Use provided role or default to customer
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();

    // Send verification email
    emailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      data: { user: userResponse, token },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are incorrect",
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

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
    const token = generateToken(user._id.toString());

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: userResponse, token },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// GET /auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// GET /auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #f44336;">Invalid Verification Link</h2>
          <p>The verification token is missing.</p>
        </body></html>
      `);
    }

    // Hash token to compare
    const hashedToken = crypto.createHash("sha256").update(token as string).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send(`
        <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #f44336;">Invalid or Expired Link</h2>
          <p>The verification link is invalid or has expired.</p>
          <a href="http://localhost:3000/api/auth/resend-verification" style="color: #4CAF50;">Request new verification email</a>
        </body></html>
      `);
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send welcome email after verification
    emailService.sendWelcomeEmail(user.email, user.firstName);

    res.status(200).send(`
      <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #4CAF50;">Email Verified Successfully!</h2>
        <p>Welcome ${user.firstName}! Your email has been verified.</p>
        <p>You can now close this window and return to the application.</p>
        <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
      </body></html>
    `);
  } catch (error: any) {
    res.status(500).send(`
      <html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #f44336;">Verification Failed</h2>
        <p>An error occurred during verification. Please try again.</p>
      </body></html>
    `);
  }
};

// POST /auth/logout
export const logout = async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// POST /auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send password reset email
    emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken, // In production, send this via email
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// POST /auth/reset-password/:resetToken
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Hash token to compare
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
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
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// PUT /auth/change-password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
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

    // Send password changed email
    emailService.sendPasswordChangedEmail(user.email, user.firstName);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// GET /auth/users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// GET /auth/users/:id (Admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// PUT /auth/users/:id (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// DELETE /auth/users/:id (Admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
