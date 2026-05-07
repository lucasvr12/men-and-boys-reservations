import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CALENDAR_IDS } from "@/lib/constants";
import { updateAppointmentStatus } from "@/lib/googleSheets";

async function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { branch, phone, date, time, status = "Cancelada" } = await req.json(); // We need details to update Sheets

    const calendarId = CALENDAR_IDS[branch.toLowerCase()];
    if (!calendarId) return NextResponse.json({ error: "Branch invalid" }, { status: 400 });

    const auth = await getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.delete({
      calendarId,
      eventId: id,
    });

    // Update status in Sheets
    if (phone && date && time) {
      await updateAppointmentStatus(phone, date, time, status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Error deleting event" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { branch, oldBranch, date, time, stylistName, serviceName, name, phone } = body;

    const auth = await getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    // Calculate start and end datetime
    const startDateTime = new Date(`${date}T${time}:00-06:00`);
    const durationMinutes = 30; // Default or fetch from service
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const event = {
      summary: `Cita: ${name} - ${serviceName}`,
      description: `Cliente: ${name}\nTeléfono: ${phone}\nEstilista: ${stylistName}\nServicio: ${serviceName}\nSucursal: ${branch}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Monterrey",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Monterrey",
      },
    };

    // If branch changed, we must delete from old and insert into new
    if (oldBranch && branch.toLowerCase() !== oldBranch.toLowerCase()) {
      const oldCalendarId = CALENDAR_IDS[oldBranch.toLowerCase()];
      const newCalendarId = CALENDAR_IDS[branch.toLowerCase()];

      if (oldCalendarId) {
        await calendar.events.delete({ calendarId: oldCalendarId, eventId: id });
      }

      if (newCalendarId) {
        const newEvent = await calendar.events.insert({
          calendarId: newCalendarId,
          requestBody: event,
        });
        return NextResponse.json({ success: true, newId: newEvent.data.id });
      }
    } else {
      // Normal patch in same calendar
      const calendarId = CALENDAR_IDS[branch.toLowerCase()];
      if (!calendarId) return NextResponse.json({ error: "Branch invalid" }, { status: 400 });

      await calendar.events.patch({
        calendarId,
        eventId: id,
        requestBody: event,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Error updating event" }, { status: 500 });
  }
}
