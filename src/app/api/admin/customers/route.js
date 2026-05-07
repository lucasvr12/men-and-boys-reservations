import { NextResponse } from "next/server";
import { google } from "googleapis";

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ error: "GOOGLE_SHEET_ID no configurada" }, { status: 500 });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Clientes!A:H",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return NextResponse.json({ customers: [] });
    }

    // Skip header row
    const customers = rows.slice(1).map(row => ({
      phone: row[0],
      name: row[1],
      surname: row[2],
      branch: row[3],
      stylist: row[4],
      service: row[5],
      day: row[6],
      time: row[7],
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers for admin:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}
