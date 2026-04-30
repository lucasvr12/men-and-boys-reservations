import { google } from "googleapis";
import { NextResponse } from "next/server";

const CALENDAR_IDS = {
  carrizalejo: process.env.CALENDAR_ID_CARRIZALEJO,
  mision: process.env.CALENDAR_ID_MISION,
  nacional: process.env.CALENDAR_ID_NACIONAL,
};

// Mapeo de duración de servicio a minutos
const SERVICE_DURATIONS = {
  "15min": 15,
  "30min": 30,
  "60min": 60,
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const branch = searchParams.get("branch");
    const serviceDuration = searchParams.get("duration") || "30min";

    if (!date || !branch) {
      return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    const calendarId = CALENDAR_IDS[branch];
    // Si no hay credenciales, vamos a simular horarios disponibles (útil para que la app no falle mientras el usuario configura el .env)
    const hasCredentials = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL && calendarId;

    const targetDate = new Date(`${date}T00:00:00-06:00`);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday

    if (dayOfWeek === 0) {
      return NextResponse.json({ availableSlots: [], message: "Cerrado los Domingos" });
    }

    const openingHour = 10;
    const closingHour = dayOfWeek === 6 ? 19 : 20; // 19:00 for Sat, 20:00 for Mon-Fri

    // Generate all possible 30-minute slots
    const slots = [];
    const durationMins = SERVICE_DURATIONS[serviceDuration] || 30;
    
    // Si la duración es mayor a 30 min (ej 60min), no podemos agendar a las 19:30 si cerramos a las 20:00
    // Calculamos el último slot posible
    const lastPossibleStartMin = (closingHour * 60) - durationMins;

    for (let h = openingHour; h < closingHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotStartMin = h * 60 + m;
        if (slotStartMin <= lastPossibleStartMin) {
          const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
          slots.push(timeString);
        }
      }
    }

    // Now, get FreeBusy from Google Calendar
    let busyPeriods = [];
    if (hasCredentials) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });

      const calendar = google.calendar({ version: "v3", auth });
      
      const timeMin = new Date(`${date}T00:00:00-06:00`);
      const timeMax = new Date(`${date}T23:59:59-06:00`);

      const freeBusyRes = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          timeZone: "America/Monterrey",
          items: [{ id: calendarId }],
        },
      });

      const calendars = freeBusyRes.data.calendars;
      if (calendars && calendars[calendarId]) {
        busyPeriods = calendars[calendarId].busy;
      }
    }

    // Filter slots that overlap with busy periods
    const availableSlots = slots.filter((slotTime) => {
      const slotStart = new Date(`${date}T${slotTime}:00-06:00`);
      const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);

      // Check if this slot overlaps with any busy period
      const isOverlapping = busyPeriods.some((busy) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        
        return (slotStart < busyEnd && slotEnd > busyStart);
      });

      // Filter out past slots if the date is today
      const now = new Date();
      if (slotStart < now) {
        return false;
      }

      return !isOverlapping;
    });

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Error al consultar disponibilidad." }, { status: 500 });
  }
}
