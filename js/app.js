
const API_BASE_URL = "https://summermedical-backend.onrender.com/api";


// Step 1: Send OTP
async function sendOtp(phone) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error("Failed to send OTP");
    }

    const data = await response.json();
    console.log("✅ OTP sent:", data);
    return data; // could contain OTP token or status
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
  }
}

// Step 2: Verify OTP
async function verifyOtp(phone, otp) {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "OTP verification failed");
    }

    const data = await response.json();
    console.log("✅ OTP verified:", data);
    return data; // typically a token or verification success
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
  }
}

// Step 3: Register patient
async function registerPatient(name, phone, email, password, otp) {
  try {
    // Verify OTP first
    const otpResult = await verifyOtp(phone, otp);
    if (!otpResult.success) {
      throw new Error("OTP verification failed. Cannot register.");
    }

    // If OTP verified, proceed to register
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register patient");
    }

    const data = await response.json();
    console.log("✅ Registration successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Registration error:", error);
  }
}

// Example usage flow:
(async () => {
  const phone = "0712345678";
  await sendOtp(phone);

  const otp = prompt("Enter the OTP sent to your phone:"); // simple prompt for demo
  await registerPatient("Casper", phone, "casper@example.com", "strongpassword123", otp);
})();

fetch(`${API_BASE_URL}/patients`)
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to fetch patients: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log("✅ Patients data received:", data);
  })
  .catch(error => {
    console.error("❌ Error fetching patients:", error);
  });
