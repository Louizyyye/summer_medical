// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const africastalking = require("africastalking");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // <-- CRUCIAL for reading req.body

// Initialize Africa's Talking SDK
const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

// POST /api/send-otp
app.post("/api/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send SMS using Africa's Talking
    const sms = AT.SMS;
    const result = await sms.send({
      to: phone,
      message: `Your Summer Medical OTP is ${otp}`,
      from: process.env.AT_SENDER_ID,
    });

    console.log("✅ SMS sent successfully:", result);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // only for testing
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
