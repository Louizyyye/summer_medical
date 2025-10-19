require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const Africastalking = require("africastalking");

// =========================
// ✅ Allowed Origins
// =========================
const allowedOrigins = [
  "https://Louizyyye.github.io",
  "https://Louzyyye.github.io/Summer_medical",
];

// =========================
// ✅ App Setup
// =========================
const app = express();
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "PUT", "OPTIONS", "DELETE", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// ✅ PostgreSQL Connection
// =========================
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL Database"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

// =========================
// ✅ Africa’s Talking Setup
// =========================
const africastalking = Africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = africastalking.SMS;

// =========================
// ✅ ROUTES
// =========================

// Root route
app.get("/", (_, res) => {
  res.send("✅ Summer Medical Backend (PostgreSQL + Africa's Talking) is running");
});

// Simple registration route
app.post("/api/register", (req, res) => {
  res.json({ success: true, message: "Registered + OTP sent successfully" });
});

// ✅ SEND OTP
app.post("/api/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `Your verification code is ${otp}`;

    // Send SMS
    const response = await sms.send({
      to: [phone],
      message,
      from: process.env.AFRICASTALKING_SENDER_ID || "AFRICASTKNG",
    });

    console.log("✅ SMS Response:", response);

    // Store OTP in DB
    await pool.query(
      "INSERT INTO otps(phone, code, created_at) VALUES($1, $2, NOW())",
      [phone, otp]
    );

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP Error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
  }
});

// ✅ VERIFY OTP
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const result = await pool.query(
      "SELECT * FROM otps WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
      [phone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No OTP found for this number" });
    }

    const storedOtp = result.rows[0].code;

    if (storedOtp === otp) {
      return res.json({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error during OTP verification" });
  }
});

// =========================
// ✅ Server Start
// =========================
const PORT = process.env.PORT || 3000;

app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use.`);
    } else {
      console.error(err);
    }
  });
