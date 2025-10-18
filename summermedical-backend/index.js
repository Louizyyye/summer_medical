// =========================
// Backend Entry Point
// =========================

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const africastalking = require("africastalking")
const dotenv = require("dotenv")

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "https://Louizyyye.github.com",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// =========================
// MySQL Connection
// =========================

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // change this
  database: "summer_medical", // change this to your actual DB
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err.message);
  } else {
    console.log("✅ Connected to MySQL database.");
  }
});

// =========================
// API Routes
// =========================

app.get("/api", (req, res) => {
  res.send("Backend is running and connected to MySQL!");
});

// Example query route
app.get("/api/patients", (req, res) => {
  db.query("SELECT * FROM patients", (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});


// =========================
// Frontend Serving (for production)
// =========================

// If you ever build the frontend locally (e.g., React → build folder)
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const at = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = at.SMS;

app.post("/api/send-otp", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const response = await sms.send({
      to: [phone],
      message: `Your Summer Medical OTP is ${otp}`,
    });

    console.log("✅ OTP sent:", response);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ OTP failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// =========================
// Start Server
// =========================

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
