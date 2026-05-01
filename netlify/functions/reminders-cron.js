export const handler = async (event) => {
  console.log("Running reminders cron job...");
  try {
    const baseUrl = process.env.URL || "https://rad-phoenix-e16f3f.netlify.app";
    const response = await fetch(`${baseUrl}/api/cron/reminders`, {
      headers: {
        // You can add a secret header here if you set it in .env
        "Authorization": `Bearer ${process.env.CRON_SECRET || ""}`
      }
    });
    const data = await response.json();
    console.log("Cron response:", data);
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Cron execution failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// This export is for Netlify to recognize it as a scheduled function if not using netlify.toml
// But since we use netlify.toml, it's redundant but safe.
// export const config = { schedule: "@hourly" };
