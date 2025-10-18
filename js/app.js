
const API_BASE_URL = "https://summermedical-backend.onrender.com/api";

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
