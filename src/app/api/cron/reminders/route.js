import { google } from "googleapis";
import { sendSMS } from "@/lib/twilio";

const CALENDAR_IDS = {
  carrizalejo: process.env.CALENDAR_ID_CARRIZALEJO,
  mision: process.env.CALENDAR_ID_MISION,
  nacional: process.env.CALENDAR_ID_NACIONAL,
};

export async function GET(req) {
  // Simple security check (optional: use a secret header)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours ahead

    let logs = [];

    for (const [branchId, calId] of Object.entries(CALENDAR_IDS)) {
      if (!calId) continue;

      const res = await calendar.events.list({
        calendarId: calId,
        timeMin: now.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = res.data.items || [];

      for (const event of events) {
        const desc = event.description || "";
        if (!desc.includes("Recordatorios: Sí")) continue;

        const startTime = new Date(event.start.dateTime || event.start.date);
        const diffMs = startTime - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        // Parse phone and other info from description
        const phoneMatch = desc.match(/Teléfono: ([^\n]+)/);
        const branchMatch = desc.match(/Sucursal: ([^\n]+)/);
        const phone = phoneMatch ? phoneMatch[1].trim() : null;
        const branchName = branchMatch ? branchMatch[1].trim() : "Men & Boys";

        if (!phone) continue;

        let updatedDesc = desc;
        let sentAny = false;

        // 1 Day Reminder (Approx 24-22 hours before)
        if (diffHours <= 24 && diffHours > 22 && !desc.includes("Rem 1d: OK")) {
          const msg = `Recordatorio Men & Boys: Tu cita en ${branchName} es mañana a las ${startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}.`;
          await sendSMS(phone, msg);
          updatedDesc += "\nRem 1d: OK";
          sentAny = true;
        }

        // 1.5 Hour Reminder (Approx 1.6-0.5 hours before)
        if (diffHours <= 1.6 && diffHours > 0.5 && !desc.includes("Rem 1.5h: OK")) {
          const msg = `Men & Boys: Tu cita es en 1.5 horas (${startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}). ¡Te esperamos!`;
          await sendSMS(phone, msg);
          updatedDesc += "\nRem 1.5h: OK";
          sentAny = true;
        }

        if (sentAny) {
          await calendar.events.patch({
            calendarId: calId,
            eventId: event.id,
            requestBody: { description: updatedDesc }
          });
          logs.push(`Sent reminder for ${event.summary} to ${phone}`);
        }
      }
    }

    return Response.json({ success: true, logs });
  } catch (error) {
    console.error("Cron Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
