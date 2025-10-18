// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const Africastalking = require("africastalking");

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ✅ Initialize Africa's Talking
const africastalking = Africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = africastalking.SMS;

// ✅ Send OTP Endpoint
app.post("/api/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Phone number required" });

    const otp = require("crypto").randomInt(100000, 999999);
    const message = `Your Summer Medical verification code is ${otp}`;

    const result = await sms.send({
      to: phone,
      message,
      from: process.env.AT_SENDER_ID || "",
    });

    console.log("📲 OTP sent to:", phone, result);
    res.json({ success: true, message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Root route for health check
app.get("/", (req, res) => {
  res.send("✅ Summer Medical Backend (Africa's Talking) is running");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
