"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, MapPin, Search, Trash2, Edit2, Coffee, Umbrella, PlusCircle, X, ChevronLeft, ChevronRight as ChevronRightIcon, CheckCircle, Users } from "lucide-react";
import { branches, stylists } from "@/lib/constants";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState("appointments"); // "appointments", "staff", "profiles", "agenda"

  // Personal Agenda State
  const [agendaMode, setAgendaMode] = useState("personal"); // "personal" | "branch"
  const [agendaSelectedStylist, setAgendaSelectedStylist] = useState("");
  const [agendaSelectedBranch, setAgendaSelectedBranch] = useState("carrizalejo");
  const [agendaViewDate, setAgendaViewDate] = useState(new Date());
  const [agendaSelectedDate, setAgendaSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [agendaDayApps, setAgendaDayApps] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [allMonthlyAppointments, setAllMonthlyAppointments] = useState([]);
  const [stylistSettings, setStylistSettings] = useState({});
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  // Edit State
  const [editingApp, setEditingApp] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Block State
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockData, setBlockData] = useState({
    stylistName: "",
    type: "comida",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    duration: 60,
    branch: "mision"
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Monterrey2026$$") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Contraseña incorrecta");
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = filterDate ? `/api/admin/appointments?date=${filterDate}` : '/api/admin/appointments';
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error al cargar las citas");
      
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonthlyAppointments = async () => {
    try {
      const res = await fetch('/api/admin/appointments'); 
      const data = await res.json();
      if (res.ok) setAllMonthlyAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    }
  };

  const fetchStylistSettings = async () => {
    try {
      const res = await fetch('/api/admin/stylists');
      const data = await res.json();
      setStylistSettings(data);
    } catch (err) {
      console.error("Error fetching stylist settings:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchMonthlyAppointments();
      fetchStylistSettings();
    }
  }, [filterDate, isAuthenticated]);

  const handleDelete = async (id, branch) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;
    
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ branch }),
      });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchAppointments();
      fetchMonthlyAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/appointments/${editingApp.id}`, {
        method: "PATCH",
        body: JSON.stringify(editingApp),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setEditingApp(null);
      fetchAppointments();
      fetchMonthlyAppointments();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    setIsBlocking(true);
    try {
      const res = await fetch("/api/admin/staff/block", {
        method: "POST",
        body: JSON.stringify(blockData),
      });
      if (!res.ok) throw new Error("Error al crear bloqueo");
      alert("Bloqueo creado con éxito");
      fetchAppointments();
      fetchMonthlyAppointments();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBlocking(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(viewDate);
    const days = [];
    
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-16 md:h-24 border border-white/5 bg-white/[0.01]"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currentFullDate = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const dayApps = allMonthlyAppointments.filter(a => a.date === currentFullDate);
      const isSelected = filterDate === currentFullDate;
      const isToday = new Date().toISOString().split("T")[0] === currentFullDate;

      days.push(
        <button
          key={d}
          onClick={() => setFilterDate(currentFullDate)}
          className={`h-16 md:h-24 border border-white/10 p-1 md:p-2 text-left transition-all hover:bg-white/10 relative ${
            isSelected ? "bg-mbRed/30 border-mbRed/50 z-10" : "bg-white/5"
          } ${isToday ? "ring-2 ring-mbRed/50 ring-inset" : ""}`}
        >
          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>{d}</span>
          <div className="mt-1 flex flex-wrap gap-0.5">
            {dayApps.map((app, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${
                  app.name.includes("COMIDA") ? "bg-yellow-500" : 
                  app.name.includes("VACACIONES") ? "bg-blue-500" : "bg-mbRed"
                }`}
                title={`${app.time} - ${app.name}`}
              ></div>
            ))}
          </div>
        </button>
      );
    }

    return days;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-['Oswald'] font-bold uppercase text-white">Acceso Restringido</h1>
            <p className="text-gray-400 mt-2">Solo personal autorizado de Men & Boys</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Ingresa la contraseña"
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-mbRed outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {loginError && <p className="text-mbRed text-sm">{loginError}</p>}
          </div>
          <button type="submit" className="w-full bg-mbRed text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest">
            Acceder
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-['Oswald'] font-bold uppercase text-white">Panel de Control</h1>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setActiveTab("appointments")}
              className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'appointments' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              CITAS Y CALENDARIO
            </button>
            <button 
              onClick={() => setActiveTab("staff")}
              className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'staff' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              GESTIÓN STAFF
            </button>
            <button 
              onClick={() => setActiveTab("profiles")}
              className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'profiles' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              PERFILES STAFF
            </button>
            <button 
              onClick={() => setActiveTab("agenda")}
              className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'agenda' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              MI AGENDA
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'appointments' ? (
        <div className="space-y-8">
          {/* Monthly Calendar Integration */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-slide-up shadow-2xl">
            <div className="p-6 bg-black/40 flex items-center justify-between border-b border-white/10">
              <h2 className="text-xl font-['Oswald'] font-bold uppercase flex items-center gap-3 text-white">
                <CalendarIcon className="text-mbRed" />
                {viewDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setViewDate(new Date())} className="px-3 py-1 text-xs font-bold bg-mbRed/20 text-mbRed rounded-lg hover:bg-mbRed/30 transition-colors">HOY</button>
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"><ChevronRightIcon className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-white/10">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="bg-black/60 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>

          {/* Daily Appointments List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">
                Citas del {new Date(filterDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <div className="hidden md:flex items-center gap-2 bg-black/50 border border-white/20 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  className="bg-transparent border-none focus:ring-0 text-sm [color-scheme:dark] text-white"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-mbRed border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm">Actualizando agenda...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-20 text-center text-gray-500 italic">
                No hay citas ni bloqueos registrados para este día.
              </div>
            ) : (
              <div className="grid gap-4 animate-fade-in">
                {appointments.map((app) => (
                  <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/30 transition-all group shadow-lg hover:shadow-mbRed/5">
                    <div className="flex items-start gap-4 text-white">
                      <div className="w-14 h-14 bg-mbRed/20 text-mbRed rounded-xl flex items-center justify-center font-bold text-xl font-['Oswald']">
                        {app.time.split(":")[0]}
                        <span className="text-[10px] ml-0.5">:{app.time.split(":")[1]}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg font-['Oswald'] uppercase tracking-wide flex items-center gap-2 text-white">
                          {app.name}
                          {app.name.includes("COMIDA") && <Coffee className="w-4 h-4 text-yellow-500" />}
                          {app.name.includes("VACACIONES") && <Umbrella className="w-4 h-4 text-blue-500" />}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-mbRed/60" /> {app.time}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-mbRed/60" /> {app.branch}</span>
                          <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-mbRed/60" /> {app.stylist}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingApp(app)}
                        className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id, app.branch)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'profiles' ? (
        <div className="space-y-8 animate-slide-up">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylists.filter(s => s.canTakeAppointments).map(stylist => (
              <div key={stylist.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <img src={stylist.img} alt={stylist.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xl font-['Oswald'] font-bold uppercase">{stylist.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{stylist.branch}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Número para SMS</label>
                  <div className="flex gap-2">
                    <input 
                      type="tel"
                      placeholder="+528112345678"
                      className="flex-1 bg-black/50 border border-white/20 rounded-lg p-2 text-sm text-white outline-none focus:border-mbRed transition-colors"
                      value={stylistSettings[stylist.id]?.phone || ""}
                      onChange={(e) => {
                        const newSettings = {
                          ...stylistSettings,
                          [stylist.id]: { ...stylistSettings[stylist.id], phone: e.target.value }
                        };
                        setStylistSettings(newSettings);
                      }}
                    />
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/admin/stylists', {
                            method: 'POST',
                            body: JSON.stringify(stylistSettings)
                          });
                          if (res.ok) alert("Perfil actualizado");
                        } catch (err) {
                          alert("Error al guardar");
                        }
                      }}
                      className="bg-mbRed/20 text-mbRed hover:bg-mbRed hover:text-white p-2 rounded-lg transition-all"
                      title="Guardar"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600">Incluye código de país (ej. +52)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'agenda' ? (
        <div className="space-y-8 animate-slide-up">
          {/* Mode Selector */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 max-w-sm">
            <button
              onClick={() => setAgendaMode("personal")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${agendaMode === "personal" ? "bg-mbRed text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <User className="w-4 h-4" /> Mi Agenda
            </button>
            <button
              onClick={() => setAgendaMode("branch")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${agendaMode === "branch" ? "bg-mbRed text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <Users className="w-4 h-4" /> Agenda Sucursal
            </button>
          </div>

          {/* Selector */}
          {agendaMode === "personal" ? (
            <div className="max-w-sm space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-widest">¿Quién eres?</label>
                <select
                  className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-mbRed outline-none transition-colors"
                  value={agendaSelectedStylist}
                  onChange={e => setAgendaSelectedStylist(e.target.value)}
                >
                  <option value="">Selecciona tu nombre...</option>
                  {stylists.filter(s => s.canTakeAppointments).map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {branches.find(b => b.id === s.branch)?.name}</option>
                  ))}
                </select>
              </div>
              {agendaSelectedStylist && (() => {
                const s = stylists.find(st => st.id === agendaSelectedStylist);
                return (
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl animate-fade-in">
                    <img src={s.img} className="w-14 h-14 rounded-full" alt={s.name} />
                    <div>
                      <p className="font-bold font-['Oswald'] text-xl uppercase">{s.name}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {branches.find(b => b.id === s.branch)?.name}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="max-w-sm">
              <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-widest">Sucursal</label>
              <div className="grid grid-cols-3 gap-2">
                {branches.map(b => (
                  <button key={b.id} onClick={() => setAgendaSelectedBranch(b.id)}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${agendaSelectedBranch === b.id ? "bg-mbRed border-mbRed text-white" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"}`}>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agenda Calendar */}
          {(agendaMode === "branch" || (agendaMode === "personal" && agendaSelectedStylist)) && (() => {
            const getAgendaDayApps = (fullDate) => {
              let filtered = allMonthlyAppointments.filter(a => a.date === fullDate);
              if (agendaMode === "branch") {
                filtered = filtered.filter(a => a.branch?.toLowerCase().includes(agendaSelectedBranch) || a.branch === branches.find(b => b.id === agendaSelectedBranch)?.name);
              } else if (agendaSelectedStylist) {
                const stylistName = stylists.find(s => s.id === agendaSelectedStylist)?.name;
                filtered = filtered.filter(a => a.stylist === stylistName || a.stylist === "Sin preferencia");
              }
              return filtered;
            };

            const renderAgendaCalendar = () => {
              const year = agendaViewDate.getFullYear();
              const month = agendaViewDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const days = [];
              for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
                days.push(<div key={`e-${i}`} className="h-14 md:h-20 border border-white/5 bg-white/[0.01]" />);
              }
              for (let d = 1; d <= daysInMonth; d++) {
                const fullDate = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
                const dayApps = getAgendaDayApps(fullDate);
                const isSelected = agendaSelectedDate === fullDate;
                const isToday = new Date().toISOString().split("T")[0] === fullDate;
                days.push(
                  <button key={d} onClick={() => setAgendaSelectedDate(fullDate)}
                    className={`h-14 md:h-20 border border-white/10 p-1 md:p-2 text-left transition-all hover:bg-white/10 ${isSelected ? "bg-mbRed/30 border-mbRed/60" : "bg-white/5"} ${isToday ? "ring-2 ring-mbRed/40 ring-inset" : ""}`}>
                    <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>{d}</span>
                    {dayApps.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {dayApps.slice(0, 6).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-mbRed" />)}
                        {dayApps.length > 6 && <span className="text-[8px] text-mbRed font-bold">+{dayApps.length - 6}</span>}
                      </div>
                    )}
                  </button>
                );
              }
              return days;
            };

            const selectedDayApps = getAgendaDayApps(agendaSelectedDate);

            return (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-5 bg-black/40 flex items-center justify-between border-b border-white/10">
                    <h2 className="text-lg font-['Oswald'] font-bold uppercase flex items-center gap-2 capitalize text-white">
                      <CalendarIcon className="w-5 h-5 text-mbRed" />
                      {agendaViewDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-1">
                      <button onClick={() => setAgendaViewDate(new Date(agendaViewDate.setMonth(agendaViewDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={() => setAgendaViewDate(new Date())} className="px-3 py-1 text-xs font-bold bg-mbRed/20 text-mbRed rounded-lg hover:bg-mbRed/30 transition-colors">HOY</button>
                      <button onClick={() => setAgendaViewDate(new Date(agendaViewDate.setMonth(agendaViewDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-white/10">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                      <div key={d} className="bg-black/60 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d}</div>
                    ))}
                    {renderAgendaCalendar()}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-['Oswald'] font-bold uppercase text-white">
                    {new Date(agendaSelectedDate + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                  </h3>
                  {selectedDayApps.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500 italic">Sin citas para este día.</div>
                  ) : (
                    <div className="grid gap-3">
                      {selectedDayApps.sort((a, b) => a.time.localeCompare(b.time)).map((app, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 transition-all">
                          <div className="w-14 h-14 bg-mbRed/20 text-mbRed rounded-xl flex flex-col items-center justify-center font-bold font-['Oswald'] shrink-0">
                            <span className="text-xl leading-none">{app.time.split(":")[0]}</span>
                            <span className="text-[10px]">:{app.time.split(":")[1]}</span>
                          </div>
                          <div>
                            <p className="font-bold font-['Oswald'] uppercase text-lg leading-tight text-white">{app.name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-mbRed/60" /> {app.time}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3 text-mbRed/60" /> {app.stylist}</span>
                              {agendaMode === "branch" && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-mbRed/60" /> {app.branch}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {/* Block Form */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-['Oswald'] font-bold uppercase flex items-center gap-2 text-white">
              <PlusCircle className="text-mbRed" /> Bloquear Horario
            </h2>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sucursal</label>
                <select 
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                  value={blockData.branch}
                  onChange={e => setBlockData({...blockData, branch: e.target.value})}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estilista</label>
                <select 
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                  value={blockData.stylistName}
                  onChange={e => setBlockData({...blockData, stylistName: e.target.value})}
                  required
                >
                  <option value="">Selecciona...</option>
                  {stylists.filter(s => s.branch === blockData.branch || s.branch === 'all').map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                  <select 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                    value={blockData.type}
                    onChange={e => setBlockData({...blockData, type: e.target.value})}
                  >
                    <option value="comida">Comida</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="bloqueo">Otro Bloqueo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duración (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                    value={blockData.duration}
                    onChange={e => setBlockData({...blockData, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white [color-scheme:dark]"
                    value={blockData.date}
                    onChange={e => setBlockData({...blockData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hora Inicio</label>
                  <input 
                    type="time" 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white [color-scheme:dark]"
                    value={blockData.time}
                    onChange={e => setBlockData({...blockData, time: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isBlocking}
                className="w-full bg-mbRed text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all"
              >
                {isBlocking ? "Bloqueando..." : "Crear Bloqueo"}
              </button>
            </form>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <h2 className="text-xl font-['Oswald'] font-bold uppercase mb-6 text-white">Staff por Sucursal</h2>
            <div className="space-y-6">
              {branches.map(branch => (
                <div key={branch.id}>
                  <h4 className="text-mbRed font-bold text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {branch.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stylists.filter(s => s.branch === branch.id).map(s => (
                      <div key={s.id} className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-white">
                        <img src={s.img} className="w-6 h-6 rounded-full" alt="" />
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl p-8 relative animate-scale-in">
            <button onClick={() => setEditingApp(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase mb-6 text-white">Editar Cita</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white [color-scheme:dark]"
                    value={editingApp.date}
                    onChange={e => setEditingApp({...editingApp, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hora</label>
                  <input 
                    type="time" 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white [color-scheme:dark]"
                    value={editingApp.time}
                    onChange={e => setEditingApp({...editingApp, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estilista</label>
                <select 
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                  value={editingApp.stylist}
                  onChange={e => setEditingApp({...editingApp, stylist: e.target.value, stylistName: e.target.value})}
                >
                  {stylists.filter(s => s.branch === editingApp.branch.toLowerCase() || s.branch === 'all').map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingApp(null)}
                  className="flex-1 bg-white/5 border border-white/10 py-3 rounded-lg font-bold text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 bg-mbRed text-white py-3 rounded-lg font-bold hover:bg-red-700"
                >
                  {isUpdating ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
