import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CALENDAR_IDS } from "@/lib/constants";

async function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

export async function POST(req) {
  try {
    const { branch, type, stylistName, date, time, duration } = await req.json();

    const calendarId = CALENDAR_IDS[branch.toLowerCase()];
    if (!calendarId) return NextResponse.json({ error: "Branch invalid" }, { status: 400 });

    const auth = await getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const startDateTime = new Date(`${date}T${time}:00-06:00`);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 60) * 60000);

    const event = {
      summary: `${type.toUpperCase()}: ${stylistName}`,
      description: `Bloqueo de horario para ${stylistName} por ${type}.`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Monterrey",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Monterrey",
      },
      colorId: type === 'vacaciones' ? '11' : '5', // Red for vacations, Yellow for lunch
    };

    await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json({ error: "Error creating block" }, { status: 500 });
  }
}
