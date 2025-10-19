// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const Africastalking = require("africastalking");

const allowed = [
  'https://Louizyyye.github.com',
  'https://Louzyyye.github.com/Summer_medical'
  ];

const app = express();
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowed.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.json());

// ✅ Connect to PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL Database"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

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
    if (!phone)
      return res.status(400).json({ success: false, message: "Phone number required" });

    const otp = require("crypto").randomInt(100000, 999999);
    const message = `Your Summer Medical verification code is ${otp}`;

    const result = await sms.send({
      to: [phone],
      message,
      from: process.env.AT_SENDER_ID || "",
    });

// ✅ Verify OTP Endpoint
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ success: false, message: "Phone and OTP required" });

    // Find OTP in database
    const result = await pool.query(
      "SELECT * FROM otps WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
      [phone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No OTP found for this number" });
    }

    const storedOtp = result.rows[0].code;

    // ✅ Compare codes
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

    // Optional: store OTP
    await pool.query(
      "INSERT INTO otps(phone, code, created_at) VALUES($1, $2, NOW())",
      [phone, otp]
    );

    console.log("📲 OTP sent:", result);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Root route
app.get("/", (_, res) => {
  res.send("✅ Summer Medical Backend (PostgreSQL + Africa's Talking) is running");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
