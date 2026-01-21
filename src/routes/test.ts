import { Router } from "express";
import { emailService } from "../services/emailService";

const router = Router();

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    const { email, firstName } = req.body;
    
    if (!email || !firstName) {
      return res.status(400).json({ error: "Email and firstName required" });
    }

    await emailService.sendWelcomeEmail(email, firstName);
    
    res.json({ 
      success: true, 
      message: "Test email sent (check console logs)" 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;