"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, MapPin, Search } from "lucide-react";

// Mock data for appointments
const MOCK_APPOINTMENTS = [
  {
    id: 1,
    name: "Carlos Mendoza",
    phone: "81 1234 5678",
    date: "2024-05-10",
    time: "10:00",
    branch: "Carrizalejo",
    service: "Servicio Completo",
    barber: "Barbero 1",
  },
  {
    id: 2,
    name: "Andrés Garza",
    phone: "81 8765 4321",
    date: "2024-05-10",
    time: "14:30",
    branch: "Carretera Nacional",
    service: "Corte Rápido",
    barber: "Sin preferencia",
  },
];

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments when component mounts or filterDate changes
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = filterDate ? `/api/admin/appointments?date=${filterDate}` : '/api/admin/appointments';
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Error al cargar las citas");
        }
        
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [filterDate]);

  const filteredAppointments = appointments;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-['Oswald'] font-bold uppercase">Panel de Staff</h1>
          <p className="text-gray-400">Administra las citas de Men & Boys.</p>
        </div>
        <div className="flex items-center gap-2 bg-black/50 border border-white/20 rounded-lg p-2">
          <Search className="w-5 h-5 text-gray-500 ml-2" />
          <input
            type="date"
            className="bg-transparent border-none focus:ring-0 text-sm [color-scheme:dark]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-mbRed border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Conectando con Google Calendar...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-mbRed p-6 rounded-xl text-center">
          <h3 className="font-bold mb-2">Aviso</h3>
          <p>{error}</p>
          <p className="text-sm mt-2 opacity-80">Por favor configura las credenciales de Google Cloud en el archivo .env.local</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No hay citas registradas {filterDate ? "para esta fecha" : ""}.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((app) => (
            <div
              key={app.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-mbRed/20 text-mbRed rounded-full flex items-center justify-center font-bold">
                  {app.time.split(":")[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg font-['Oswald'] uppercase tracking-wide">
                    {app.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {app.time} ({app.date})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {app.branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" /> {app.barber}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-2">
                  {app.service}
                </div>
                <div className="text-gray-500 text-sm">{app.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
