import { google } from "googleapis";
import { NextResponse } from "next/server";
import { saveAppointment } from "@/lib/googleSheets";
import { saveCustomer } from "@/lib/postgres";
import { stylists } from "@/lib/constants";

export const dynamic = 'force-dynamic';

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
    let { name, phone, date, time, branch, service, stylist, stylistName, branchName, serviceName } = body;

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
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // --- AUTO-ASSIGN STYLIST if "any" ---
    if (stylist === "any" || !stylistName || stylistName === "Sin preferencia") {
      const branchStylists = stylists.filter(s => s.branch === branch && s.canTakeAppointments);

      if (branchStylists.length > 0) {
        // Fetch today's events to count appointments per stylist
        const timeMin = new Date(`${date}T00:00:00-06:00`).toISOString();
        const timeMax = new Date(`${date}T23:59:59-06:00`).toISOString();
        let dayEvents = [];
        try {
          const res = await calendar.events.list({ calendarId, timeMin, timeMax, singleEvents: true });
          dayEvents = res.data.items || [];
        } catch (_) {}

        // Count appointments per stylist name
        const appointmentCounts = {};
        branchStylists.forEach(s => { appointmentCounts[s.name] = 0; });

        dayEvents.forEach(event => {
          const desc = event.description || "";
          const match = desc.match(/(?:Estilista|Barbero):\s*(.*)/);
          if (match) {
            const name = match[1].trim();
            if (appointmentCounts[name] !== undefined) {
              appointmentCounts[name]++;
            }
          }
        });

        // Also check: who is free at this specific time slot?
        const durationMins = SERVICE_DURATIONS[service] || 30;
        const slotStart = new Date(`${date}T${time}:00-06:00`);
        const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);
        const busyAtSlot = new Set();
        dayEvents.forEach(event => {
          const eStart = new Date(event.start.dateTime || event.start.date);
          const eEnd = new Date(event.end.dateTime || event.end.date);
          if (slotStart < eEnd && slotEnd > eStart) {
            const desc = event.description || "";
            const match = desc.match(/(?:Estilista|Barbero):\s*(.*)/);
            if (match) busyAtSlot.add(match[1].trim());
          }
        });

        // Pick the free stylist with fewest appointments (equitable distribution)
        const freeStylists = branchStylists.filter(s => !busyAtSlot.has(s.name));
        if (freeStylists.length > 0) {
          freeStylists.sort((a, b) => (appointmentCounts[a.name] || 0) - (appointmentCounts[b.name] || 0));
          const assigned = freeStylists[0];
          stylist = assigned.id;
          stylistName = assigned.name;
        } else {
          // Fallback: pick least busy even if technically busy (shouldn't happen if availability check works)
          branchStylists.sort((a, b) => (appointmentCounts[a.name] || 0) - (appointmentCounts[b.name] || 0));
          stylistName = branchStylists[0].name;
          stylist = branchStylists[0].id;
        }
      }
    }
    // --- END AUTO-ASSIGN ---

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
      requestBody: {
        ...event,
        description: `${event.description}\nRecordatorios: ${body.sendReminders ? "Sí" : "No"}`
      },
    });

    // SMS Integration
    try {
      const { sendSMS } = await import("@/lib/twilio");
      const { promises: fs } = await import("fs");
      const path = await import("path");
      
      const stylistsConfigPath = path.join(process.cwd(), 'src/data/stylists.json');
      const stylistsConfig = JSON.parse(await fs.readFile(stylistsConfigPath, 'utf8'));
      
      const stylistPhone = stylistsConfig[body.stylist]?.phone;

      // 1. SMS to Stylist
      if (stylistPhone) {
        await sendSMS(stylistPhone, `¡Nueva Cita! ✂️\nCliente: ${name}\nFecha: ${date}\nHora: ${time}\nServicio: ${serviceName}\nSucursal: ${branchName}`);
      }

      // 2. Immediate SMS to Customer
      if (body.sendReminders) {
        await sendSMS(phone, `Men & Boys: ¡Cita confirmada! ✂️\nTe esperamos el ${date} a las ${time} en ${branchName}.`);
      }
    } catch (smsErr) {
      console.error("Error sending immediate SMS:", smsErr);
      // We don't fail the request if SMS fails
    }

    // Save to Google Sheets
    try {
      await saveAppointment({
        date,
        time,
        phone,
        name: `${name} ${body.surname || ""}`.trim(),
        branchName,
        stylistName,
        serviceName
      });

      // Also update/save customer preferences
      await saveCustomer({
        phone,
        name,
        surname: body.surname || "",
        branch,
        stylist,
        service,
        day: date ? new Date(date + "T00:00:00").getDay().toString() : "0", // Store preferred day of week
        time
      });
    } catch (sheetErr) {
      console.error("Error saving to Google Sheets:", sheetErr);
    }

    return NextResponse.json({ success: true, eventLink: response.data.htmlLink });
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return NextResponse.json({ error: "Error al crear el evento en el calendario." }, { status: 500 });
  }
}
