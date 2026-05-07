import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function test() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const client_email = process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  console.log("Testing Sheets Connection...");
  console.log("Email:", client_email);
  console.log("Sheet ID:", spreadsheetId);

  if (!spreadsheetId || !client_email || !private_key) {
    console.error("Missing environment variables!");
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email, private_key },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.get({ spreadsheetId });
    
    console.log("Success! Connected to:", response.data.properties.title);
    console.log("Sheets found:", response.data.sheets.map(s => s.properties.title).join(", "));
  } catch (error) {
    console.error("Connection failed!");
    console.error(error.message);
  }
}

test();
