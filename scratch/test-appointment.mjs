import fetch from "node-fetch";

async function testPost() {
  const url = "https://men-and-boys-reservations.vercel.app/api/appointments";
  const payload = {
    name: "TestUser",
    phone: "8180000000",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    branch: "carrizalejo",
    branchName: "Carrizalejo",
    service: "30min",
    serviceName: "Corte Tradicional",
    stylist: "any",
    stylistName: "Cualquiera",
    sendReminders: false
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

testPost();
