
const API_BASE_URL = "https://summermedical-backend.onrender.com/api";

// Function to register a new patient
async function registerPatient(name, phone, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        password,
      }),
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

// Example usage:
registerPatient("Casper", "0712345678", "casper@example.com", "strongpassword123");

async function sendOtp(phone) {
  const response = await fetch(`${API_BASE_URL}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json();
  console.log(data);
}

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
