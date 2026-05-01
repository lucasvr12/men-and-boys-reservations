import { google } from "googleapis";
import { NextResponse } from "next/server";

// Define calendar IDs based on branch
const CALENDAR_IDS = {
  carrizalejo: process.env.CALENDAR_ID_CARRIZALEJO,
  mision: process.env.CALENDAR_ID_MISION,
  nacional: process.env.CALENDAR_ID_NACIONAL,
};

// Map service duration to minutes
const SERVICE_DURATIONS = {
  "15min": 15,
  "30min": 30,
  "60min": 60,
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, date, time, branch, service, stylistName, branchName, serviceName } = body;

    const calendarId = CALENDAR_IDS[branch];
    if (!calendarId) {
      return NextResponse.json({ error: "Calendar ID no configurado para esta sucursal." }, { status: 400 });
    }

    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json({ error: "Credenciales de Google no configuradas." }, { status: 500 });
    }

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Replace escaped newlines so the private key is parsed correctly
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Calculate start and end datetime
    const startDateTime = new Date(`${date}T${time}:00-06:00`); // Assuming Monterrey Timezone (CST/CDT)
    const durationMinutes = SERVICE_DURATIONS[service] || 30;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const event = {
      summary: `Cita: ${name} - ${serviceName}`,
      description: `Cliente: ${name}\nTeléfono: ${phone}\nEstilista: ${stylistName}\nServicio: ${serviceName}\nSucursal: ${branchName}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Monterrey",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Monterrey",
      },
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    return NextResponse.json({ success: true, eventLink: response.data.htmlLink });
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return NextResponse.json({ error: "Error al crear el evento en el calendario." }, { status: 500 });
  }
}
