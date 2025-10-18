const API_BASE_URL = "https://summermedical-backend.onrender.com"; // backend server


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
