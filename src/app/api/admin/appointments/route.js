import { google } from "googleapis";
import { NextResponse } from "next/server";

const CALENDAR_IDS = {
  Carrizalejo: process.env.CALENDAR_ID_CARRIZALEJO,
  "Misión del Valle": process.env.CALENDAR_ID_MISION,
  "Carretera Nacional": process.env.CALENDAR_ID_NACIONAL,
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD (opcional)

    const hasCredentials = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL;
    
    if (!hasCredentials) {
      // Si no hay credenciales, retornamos un error o mock data
      return NextResponse.json({ error: "Credenciales de Google no configuradas en el servidor." }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    
    // Determinar el rango de fechas
    let timeMin, timeMax;
    if (date) {
      timeMin = new Date(`${date}T00:00:00-06:00`).toISOString();
      timeMax = new Date(`${date}T23:59:59-06:00`).toISOString();
    } else {
      // Si no hay fecha, traemos desde hoy hacia adelante (próximos 30 días por ejemplo)
      const today = new Date();
      timeMin = today.toISOString();
      const future = new Date(today);
      future.setDate(future.getDate() + 30);
      timeMax = future.toISOString();
    }

    let allAppointments = [];

    // Iterar por cada sucursal y buscar sus eventos
    for (const [branchName, calendarId] of Object.entries(CALENDAR_IDS)) {
      if (!calendarId) continue;

      try {
        const response = await calendar.events.list({
          calendarId: calendarId,
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
          orderBy: "startTime",
        });

        const events = response.data.items || [];
        
        events.forEach((event) => {
          // Extraer información de la descripción que guardamos antes
          const description = event.description || "";
          
          // Parsear la descripción para sacar el teléfono, estilista y servicio
          const getMatch = (regex) => {
            const match = description.match(regex);
            return match ? match[1].trim() : "No especificado";
          };

           const phone = getMatch(/Teléfono:\s*(.*)/);
          const stylist = getMatch(/(?:Estilista|Barbero):\s*(.*)/);
          const service = getMatch(/Servicio:\s*(.*)/);
          
          // Obtener nombre del cliente del Summary o de la descripción
          const name = getMatch(/Cliente:\s*(.*)/) || (event.summary ? event.summary.replace("Cita: ", "") : "Sin Nombre");

          // Formatear la fecha y hora
          const startDateTime = new Date(event.start.dateTime || event.start.date);
          const formattedDate = startDateTime.toISOString().split("T")[0];
          const formattedTime = startDateTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Monterrey' });

          allAppointments.push({
            id: event.id,
            name,
            phone,
            date: formattedDate,
            time: formattedTime,
             branch: branchName,
            service,
            stylist,
          });
        });
      } catch (err) {
        console.error(`Error fetching events for branch ${branchName}:`, err);
      }
    }

    // Ordenar todas las citas por fecha y luego por hora
    allAppointments.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    return NextResponse.json({ appointments: allAppointments });
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return NextResponse.json({ error: "Error al consultar las citas." }, { status: 500 });
  }
}
