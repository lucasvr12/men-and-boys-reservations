import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  return google.sheets({ version: "v4", auth });
}

export async function getCustomerByPhone(phone) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!spreadsheetId) {
    console.warn("GOOGLE_SHEET_ID not configured");
    return null;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Clientes!A:H", // Assumes Clientes sheet exists
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    // Headers: Phone, Name, Surname, Branch, Stylist, Service, Day, Time
    const customerRow = rows.find(row => row[0] === phone);
    if (!customerRow) return null;

    return {
      phone: customerRow[0],
      name: customerRow[1],
      surname: customerRow[2],
      branch: customerRow[3],
      stylist: customerRow[4],
      service: customerRow[5],
      day: customerRow[6],
      time: customerRow[7],
    };
  } catch (error) {
    console.error("Error fetching customer from Sheets:", error);
    return null;
  }
}

export async function saveCustomer(customerData) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) return;

  const { phone, name, surname, branch, stylist, service, day, time } = customerData;
  const values = [[phone, name, surname, branch, stylist, service, day, time]];

  try {
    // Check if customer exists to update or append
    const existing = await getCustomerByPhone(phone);
    
    if (existing) {
      // Update logic would require finding the row index
      // For simplicity in this first version, we might just append or use a more complex update logic
      // Let's find the row index
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Clientes!A:A",
      });
      const rows = response.data.values;
      const rowIndex = rows.findIndex(row => row[0] === phone) + 1;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Clientes!A${rowIndex}:H${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Clientes!A:H",
        valueInputOption: "RAW",
        requestBody: { values },
      });
    }
  } catch (error) {
    console.error("Error saving customer to Sheets:", error);
  }
}

export async function saveAppointment(appointmentData) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) return;

  const { date, time, phone, name, branchName, stylistName, serviceName, status = "Confirmada" } = appointmentData;
  const values = [[new Date().toISOString(), date, time, phone, name, branchName, stylistName, serviceName, status]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Citas!A:I",
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } catch (error) {
    console.error("Error saving appointment to Sheets:", error);
  }
}

export async function updateAppointmentStatus(phone, date, time, newStatus) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) return;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Citas!A:I",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return;

    // Find row by phone, date, and time
    const rowIndex = rows.findIndex(row => row[3] === phone && row[1] === date && row[2] === time) + 1;

    if (rowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Citas!I${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: { values: [[newStatus]] },
      });
    }
  } catch (error) {
    console.error("Error updating appointment status in Sheets:", error);
  }
}

export async function getVacations() {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) return [];

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Vacaciones!A:E",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      stylistId: row[0],
      stylistName: row[1],
      startDate: row[2],
      endDate: row[3],
      reason: row[4],
    }));
  } catch (error) {
    console.error("Error getting vacations from Sheets:", error);
    return [];
  }
}

export async function saveVacation(vacationData) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) return;

  const { stylistId, stylistName, startDate, endDate, reason } = vacationData;
  const values = [[stylistId, stylistName, startDate, endDate, reason]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Vacaciones!A:E",
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } catch (error) {
    console.error("Error saving vacation to Sheets:", error);
  }
}
