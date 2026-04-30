"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, MapPin, Search } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Monterrey2026$$") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Contraseña incorrecta");
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-['Oswald'] font-bold uppercase">Acceso Restringido</h1>
            <p className="text-gray-400 mt-2">Solo personal autorizado de Men & Boys</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Ingresa la contraseña"
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-mbRed outline-none transition-colors pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {loginError && <p className="text-mbRed text-sm animate-shake">{loginError}</p>}
          </div>
          <button 
            type="submit" 
            className="w-full bg-mbRed text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest shadow-lg shadow-mbRed/20"
          >
            Acceder al Panel
          </button>
        </form>
      </div>
    );
  }

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
