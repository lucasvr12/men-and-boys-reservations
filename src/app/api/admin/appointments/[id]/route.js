import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CALENDAR_IDS } from "@/lib/constants";
import { updateAppointmentStatus } from "@/lib/googleSheets";

export const dynamic = 'force-dynamic';

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
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch") || "";
    const phone = searchParams.get("phone") || "";
    const date = searchParams.get("date") || "";
    const time = searchParams.get("time") || "";
    const status = searchParams.get("status") || "Cancelada";

    let branchId = branch.toLowerCase();
    if (branch === "Misión del Valle") branchId = "mision";
    if (branch === "Carretera Nacional") branchId = "nacional";
    if (branch === "Carrizalejo") branchId = "carrizalejo";

    const calendarId = CALENDAR_IDS[branchId];
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
    return NextResponse.json({ error: "Error deleting event", details: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const name = body.name;
    const phone = body.phone;
    const date = body.date;
    const time = body.time;
    const branch = body.branchName || body.branch || "";
    const serviceName = body.serviceName || body.service || "";
    const stylistName = body.stylistName || body.stylist || "";
    const oldBranch = body.oldBranch;

    let branchId = branch.toLowerCase();
    if (branch === "Misión del Valle") branchId = "mision";
    if (branch === "Carretera Nacional") branchId = "nacional";
    if (branch === "Carrizalejo") branchId = "carrizalejo";

    const calendarId = CALENDAR_IDS[branchId];
    if (!calendarId) return NextResponse.json({ error: "Branch invalid" }, { status: 400 });

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
      let oldBranchId = oldBranch.toLowerCase();
      if (oldBranch === "Misión del Valle") oldBranchId = "mision";
      if (oldBranch === "Carretera Nacional") oldBranchId = "nacional";
      if (oldBranch === "Carrizalejo") oldBranchId = "carrizalejo";

      let newBranchId = branch.toLowerCase();
      if (branch === "Misión del Valle") newBranchId = "mision";
      if (branch === "Carretera Nacional") newBranchId = "nacional";
      if (branch === "Carrizalejo") newBranchId = "carrizalejo";

      const oldCalendarId = CALENDAR_IDS[oldBranchId];
      const newCalendarId = CALENDAR_IDS[newBranchId];

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
      let patchBranchId = branch.toLowerCase();
      if (branch === "Misión del Valle") patchBranchId = "mision";
      if (branch === "Carretera Nacional") patchBranchId = "nacional";
      if (branch === "Carrizalejo") patchBranchId = "carrizalejo";

      const calendarId = CALENDAR_IDS[patchBranchId];
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
