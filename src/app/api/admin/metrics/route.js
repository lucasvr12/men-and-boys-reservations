import { google } from "googleapis";
import { NextResponse } from "next/server";

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    return NextResponse.json({ error: "GOOGLE_SHEET_ID no configurado" }, { status: 500 });
  }

  try {
    const sheets = await getSheetsClient();
    
    // Fetch Customers and Appointments
    const [customersRes, appointmentsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: "Clientes!A:H" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "Citas!A:I" }),
    ]);

    const customers = customersRes.data.values || [];
    const appointments = appointmentsRes.data.values || [];

    // Process Metrics
    // 1. Customers
    const totalCustomers = Math.max(0, customers.length - 1);
    
    // 2. Appointments Status
    const statusCounts = {
      Confirmada: 0,
      Cancelada: 0,
      "No asistió": 0,
      Finalizada: 0,
    };
    
    // 3. Appointments per Branch/Stylist/Service
    const branchCounts = {};
    const stylistCounts = {};
    const serviceCounts = {};
    const hourCounts = {};

    appointments.slice(1).forEach(row => {
      const [timestamp, date, time, phone, name, branch, stylist, service, status] = row;
      
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      if (status !== "Cancelada") {
        branchCounts[branch] = (branchCounts[branch] || 0) + 1;
        stylistCounts[stylist] = (stylistCounts[stylist] || 0) + 1;
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        
        const hour = time?.split(":")[0];
        if (hour) hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    return NextResponse.json({
      totalCustomers,
      statusCounts,
      branchCounts,
      stylistCounts,
      serviceCounts,
      hourCounts,
      totalAppointments: appointments.length - 1,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

