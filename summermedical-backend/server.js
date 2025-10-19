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

    if (!phone) return res.status(400).json({ error: "Phone number required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const message = `Your verification code is ${otp}`;

    const response = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SENDER_ID || "AFRICASTKNG", // 👈 FIX HERE
    });

    console.log("✅ SMS Response:", response);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
