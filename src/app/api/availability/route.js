import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CALENDAR_IDS, SERVICE_DURATIONS, stylists } from "@/lib/constants";
import { getVacations } from "@/lib/googleSheets";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const branch = searchParams.get("branch");
    const serviceDuration = searchParams.get("duration") || "30min";
    const selectedStylistId = searchParams.get("stylist") || "any";
    const step = parseInt(searchParams.get("step") || "30"); // 15 for staff, 30 for clients

    if (!date || !branch) {
      return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    const calendarId = CALENDAR_IDS[branch];
    const hasCredentials = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL && calendarId;

    const targetDate = new Date(`${date}T00:00:00-06:00`);
    const dayOfWeek = targetDate.getDay();

    if (dayOfWeek === 0) {
      return NextResponse.json({ availableSlots: [], message: "Cerrado los Domingos" });
    }

    const openingHour = 10;
    const closingHour = dayOfWeek === 6 ? 19 : 20;

    const slots = [];
    const durationMins = SERVICE_DURATIONS[serviceDuration] || 30;
    const lastPossibleStartMin = (closingHour * 60) - durationMins;

    for (let h = openingHour; h < closingHour; h++) {
      for (let m = 0; m < 60; m += step) {
        const slotStartMin = h * 60 + m;
        if (slotStartMin <= lastPossibleStartMin) {
          const timeString = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
          slots.push(timeString);
        }
      }
    }

    let events = [];
    if (hasCredentials) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });

      const calendar = google.calendar({ version: "v3", auth });
      const timeMin = new Date(`${date}T00:00:00-06:00`).toISOString();
      const timeMax = new Date(`${date}T23:59:59-06:00`).toISOString();

      const response = await calendar.events.list({
        calendarId: calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
      });
      events = response.data.items || [];
    }

    // Get the list of real stylists for this branch
    const branchStylists = stylists.filter(s => s.branch === branch && s.canTakeAppointments);
    const totalStylistsCount = branchStylists.length;

    // Check for Vacations
    const vacations = await getVacations();
    const stylistOnVacation = vacations.find(v => 
      v.stylistId === selectedStylistId && 
      date >= v.startDate && 
      date <= v.endDate
    );

    if (stylistOnVacation) {
      return NextResponse.json({ 
        availableSlots: [], 
        status: "vacation",
        message: `Estilista en vacaciones (del ${stylistOnVacation.startDate} al ${stylistOnVacation.endDate})`
      });
    }

    const resultSlots = slots.map((slotTime) => {
      const slotStart = new Date(`${date}T${slotTime}:00-06:00`);
      const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);

      // Past check
      const now = new Date();
      if (slotStart < now) return { time: slotTime, available: false, past: true };

      // Find which stylists are busy at this time
      const busyStylistsNames = new Set();
      
      events.forEach(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        // Check for overlap
        if (slotStart < eventEnd && slotEnd > eventStart) {
          const description = event.description || "";
          const summary = event.summary || "";
          
          let stylistName = null;
          const stylistMatch = description.match(/(?:Estilista|Barbero):\s*(.*)/);
          if (stylistMatch) {
            stylistName = stylistMatch[1].trim();
          } else {
            const blockingMatch = summary.match(/(?:COMIDA|VACACIONES|BLOQUEO):\s*(.*)/i);
            if (blockingMatch) {
              stylistName = blockingMatch[1].trim();
            }
          }

          if (stylistName) busyStylistsNames.add(stylistName);
        }
      });

      let isAvailable = false;
      if (selectedStylistId === "any") {
        isAvailable = busyStylistsNames.size < totalStylistsCount;
      } else {
        const selectedStylist = stylists.find(s => s.id === selectedStylistId);
        isAvailable = !busyStylistsNames.has(selectedStylist?.name);
      }

      return { time: slotTime, available: isAvailable };
    });

    return NextResponse.json({ availableSlots: resultSlots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Error al consultar disponibilidad." }, { status: 500 });
  }
}
