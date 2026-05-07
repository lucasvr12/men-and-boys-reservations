"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  PlusCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Users, 
  Trash2, 
  Edit2, 
  AlertCircle,
  LogOut,
  Phone,
  Umbrella
} from "lucide-react";
import { branches, stylists } from "@/lib/constants";

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function StaffAgenda() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState(1); // 1: Branch, 2: Stylist, 3: Password
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedStylist, setSelectedStylist] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data State
  const [allAppointments, setAllAppointments] = useState([]);
  const [dayAppointments, setDayAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dayTimeline, setDayTimeline] = useState([]);

  // UI State
  const [editingApp, setEditingApp] = useState(null);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickAppData, setQuickAppData] = useState({
    name: "",
    surname: "",
    phone: "",
    time: "09:00",
    service: "30min",
  });

  // Vacation State
  const [isManagingVacations, setIsManagingVacations] = useState(false);
  const [vacationData, setVacationData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "Vacaciones",
  });

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterDay(selectedDate);
    fetchDayTimeline(selectedDate);
  }, [selectedDate, allAppointments, selectedStylist]);

  const fetchDayTimeline = async (date) => {
    if (!selectedBranch || !selectedStylist) return;
    try {
      const res = await fetch(`/api/availability?date=${date}&branch=${selectedBranch}&stylist=${selectedStylist}&step=15`);
      const data = await res.json();
      setDayTimeline(data.availableSlots || []);
    } catch (e) {}
  };

  // Logic
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "myb2026$$") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Contraseña incorrecta");
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/appointments");
      const data = await res.json();
      setAllAppointments(data.appointments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDay = (date) => {
    let filtered = allAppointments.filter(a => a.date === date);
    const stylistName = stylists.find(s => s.id === selectedStylist)?.name;
    // Show stylist's appointments or "Sin preferencia"
    filtered = filtered.filter(a => a.stylist === stylistName || a.stylist === "Sin preferencia");
    setDayAppointments(filtered);
  };

  const handleAction = async (action, app) => {
    if (action === "delete" || action === "noshow") {
      const confirmMsg = action === "delete" ? "¿Liberar este horario?" : "¿Marcar como 'No asistió' y liberar horario?";
      if (!confirm(confirmMsg)) return;

      try {
        const res = await fetch(`/api/admin/appointments/${app.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            branch: app.branch,
            phone: app.phone,
            date: app.date,
            time: app.time,
            status: action === "noshow" ? "No asistió" : "Cancelada"
          }),
        });
        if (res.ok) fetchAppointments();
      } catch (e) {
        alert("Error al procesar acción");
      }
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const stylistName = stylists.find(s => s.id === selectedStylist)?.name;
    const branchName = branches.find(b => b.id === selectedBranch)?.name;

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quickAppData,
          branch: selectedBranch,
          branchName: branchName,
          stylist: selectedStylist,
          stylistName: stylistName,
          date: selectedDate,
          serviceName: "Corte Estándar", 
          sendReminders: !!quickAppData.phone,
        }),
      });

      if (res.ok) {
        setIsQuickAdding(false);
        setQuickAppData({ name: "", surname: "", phone: "", time: "09:00", service: "30min" });
        fetchAppointments();
      } else {
        const err = await res.json();
        alert(err.error || "Error al crear cita");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVacationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/vacations", {
        method: "POST",
        body: JSON.stringify({
          stylistId: selectedStylist,
          stylistName: stylists.find(s => s.id === selectedStylist)?.name,
          ...vacationData
        })
      });
      if (res.ok) {
        setIsManagingVacations(false);
        alert("Vacaciones registradas. Tu agenda quedará bloqueada en esas fechas.");
      }
    } catch (e) {
      alert("Error al registrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${editingApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingApp,
          stylistName: editingApp.stylist,
          serviceName: editingApp.serviceName || "Servicio",
        }),
      });
      if (res.ok) {
        setEditingApp(null);
        fetchAppointments();
      }
    } catch (e) {
      alert("Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth();
    const days = [];
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1; 

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`e-${i}`} className="h-12 border border-white/5 bg-white/[0.01]" />);
    }

    const stylistName = stylists.find(s => s.id === selectedStylist)?.name;

    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const dayApps = allAppointments.filter(a => a.date === fullDate && (a.stylist === stylistName || a.stylist === "Sin preferencia"));
      const isSelected = selectedDate === fullDate;
      const isToday = new Date().toISOString().split("T")[0] === fullDate;

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(fullDate)}
          className={`h-12 border border-white/10 p-1 transition-all hover:bg-white/10 flex flex-col items-center justify-center relative ${
            isSelected ? "bg-mbRed/30 border-mbRed/60" : "bg-white/5"
          } ${isToday ? "ring-1 ring-mbRed ring-inset" : ""}`}
        >
          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>{d}</span>
          {dayApps.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayApps.slice(0, 3).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-mbRed" />
              ))}
            </div>
          )}
        </button>
      );
    }
    return days;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-10 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-['Oswald'] font-bold uppercase tracking-widest">Módulo Staff</h1>
          <p className="text-gray-500 mt-2">Acceso exclusivo para estilistas</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          {step === 1 && (
            <div className="space-y-6 animate-step-in">
              <h2 className="text-xl font-bold uppercase tracking-widest text-center">1. Selecciona Sucursal</h2>
              <div className="grid grid-cols-1 gap-3">
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBranch(b.id); setStep(2); }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-mbRed hover:border-mbRed transition-all font-bold uppercase text-left flex items-center justify-between group"
                  >
                    <span>{b.name}</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-step-in">
              <button onClick={() => setStep(1)} className="text-gray-500 text-xs uppercase flex items-center gap-1 hover:text-white">
                <ChevronLeft className="w-3 h-3" /> Volver
              </button>
              <h2 className="text-xl font-bold uppercase tracking-widest text-center">2. ¿Quién eres?</h2>
              <div className="grid grid-cols-2 gap-3">
                {stylists.filter(s => s.branch === selectedBranch && s.canTakeAppointments).map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStylist(s.id); setStep(3); }}
                    className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-mbRed/20 hover:border-mbRed transition-all"
                  >
                    <img src={s.img} className="w-12 h-12 rounded-full mb-2 object-cover" alt="" />
                    <span className="text-xs font-bold uppercase">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-step-in">
              <button onClick={() => setStep(2)} className="text-gray-500 text-xs uppercase flex items-center gap-1 hover:text-white">
                <ChevronLeft className="w-3 h-3" /> Volver
              </button>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl mb-4">
                <img src={stylists.find(s => s.id === selectedStylist)?.img} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-bold uppercase leading-none">{stylists.find(s => s.id === selectedStylist)?.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{branches.find(b => b.id === selectedBranch)?.name}</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-[0.2em]">Contraseña</label>
                  <input
                    type="password"
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-mbRed outline-none transition-all text-center tracking-[0.5em]"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                  />
                  {loginError && <p className="text-mbRed text-xs mt-2 text-center">{loginError}</p>}
                </div>
                <button type="submit" className="w-full bg-mbRed text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest shadow-xl shadow-mbRed/20">
                  Entrar a mi agenda
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  const stylistObj = stylists.find(s => s.id === selectedStylist);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <img src={stylistObj?.img} className="w-16 h-16 rounded-full border-2 border-mbRed object-cover" alt="" />
          <div>
            <h1 className="text-2xl font-['Oswald'] font-bold uppercase tracking-tight text-white leading-none">Agenda de {stylistObj?.name}</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-mbRed" /> {branches.find(b => b.id === selectedBranch)?.name}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setIsAuthenticated(false); setStep(1); setPassword(""); }}
          className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-mbRed hover:border-mbRed transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* 1. AGENDA DEL DÍA */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-['Oswald'] font-bold uppercase tracking-widest text-mbRed flex items-center gap-2">
            <Clock className="w-6 h-6" /> Citas de Hoy
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsManagingVacations(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-400 font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
            >
              <Umbrella className="w-4 h-4" /> Vacaciones / Descanso
            </button>
            <button 
              onClick={() => setIsQuickAdding(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Registro Rápido
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-mbRed border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : dayAppointments.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <p className="text-gray-500 italic">No tienes citas programadas para hoy.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {dayAppointments
              .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
              .map((app, i) => (
                <div 
                  key={i} 
                  className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-lg"
                  onClick={() => setEditingApp(app)}
                >
                  <div className="w-16 h-16 bg-mbRed/20 text-mbRed rounded-2xl flex flex-col items-center justify-center font-bold font-['Oswald'] shrink-0 border border-mbRed/10">
                    <span className="text-2xl leading-none">{(app.time || "00:00").split(":")[0]}</span>
                    <span className="text-xs">:{((app.time || "00:00").split(":")[1])}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-['Oswald'] uppercase text-xl text-white truncate">
                      {app.name || "Sin nombre"}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-mbRed/60" /> {app.time}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Timeline Preview (Gaps) */}
        {!isLoading && dayTimeline.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Línea de Tiempo (15 min)</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {dayTimeline.map((slot) => (
                <div 
                  key={slot.time}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold text-center border ${
                    slot.available 
                      ? "bg-green-500/10 border-green-500/20 text-green-500" 
                      : "bg-white/5 border-white/10 text-gray-600"
                  }`}
                >
                  {slot.time}
                  {!slot.available && <div className="text-[8px] opacity-40">OCUPADO</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. CALENDARIO COMPLETO */}
      <div className="space-y-4 pt-10 border-t border-white/5">
        <h2 className="text-xl font-['Oswald'] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> Explorar Calendario
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 bg-black/40 flex items-center justify-between border-b border-white/10">
            <h3 className="font-['Oswald'] font-bold uppercase flex items-center gap-2 text-white capitalize">
              {viewDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-white" /></button>
              <button onClick={() => setViewDate(new Date())} className="px-3 py-1 text-[10px] font-bold bg-mbRed/20 text-mbRed rounded-lg hover:bg-mbRed/30 transition-colors uppercase">HOY</button>
              <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-white" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-white/10">
            {DAYS.map(d => (
              <div key={d} className="bg-black/60 py-2 text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">{d}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {isQuickAdding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-3xl p-8 relative animate-scale-in">
            <button onClick={() => setIsQuickAdding(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-['Oswald'] font-bold uppercase text-white">Registro Rápido</h2>
              <p className="text-gray-500 text-sm mt-1">Fecha: {selectedDate}</p>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" required placeholder="Nombre"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                  value={quickAppData.name}
                  onChange={e => setQuickAppData({...quickAppData, name: e.target.value})}
                />
                <input 
                  type="text" required placeholder="Apellido"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                  value={quickAppData.surname}
                  onChange={e => setQuickAppData({...quickAppData, surname: e.target.value})}
                />
              </div>
              <input 
                type="tel" placeholder="Teléfono (Opcional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                value={quickAppData.phone}
                onChange={e => setQuickAppData({...quickAppData, phone: e.target.value})}
              />
              <input 
                type="time" required step="900"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all [color-scheme:dark]"
                value={quickAppData.time}
                onChange={e => setQuickAppData({...quickAppData, time: e.target.value})}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-mbRed text-white font-bold py-5 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-[0.2em] font-['Oswald'] shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Confirmar Cita"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {isManagingVacations && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-3xl p-8 relative animate-scale-in">
            <button onClick={() => setIsManagingVacations(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-['Oswald'] font-bold uppercase text-white">Vacaciones y Descansos</h2>
              <p className="text-gray-400 text-sm mt-1">Bloquea tu disponibilidad.</p>
            </div>

            <form onSubmit={handleVacationSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Fecha de Inicio</label>
                  <input 
                    type="date" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all [color-scheme:dark]"
                    value={vacationData.startDate}
                    onChange={e => setVacationData({...vacationData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Fecha de Regreso</label>
                  <input 
                    type="date" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all [color-scheme:dark]"
                    value={vacationData.endDate}
                    onChange={e => setVacationData({...vacationData, endDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Motivo</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none"
                    value={vacationData.reason}
                    onChange={e => setVacationData({...vacationData, reason: e.target.value})}
                  >
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Descanso">Descanso Semanal</option>
                    <option value="Permiso">Permiso Especial</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-[0.2em] font-['Oswald'] shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Guardar Vacaciones"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Action Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden relative animate-scale-in">
            <div className="p-8 pb-4">
              <button onClick={() => setEditingApp(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-['Oswald'] font-bold uppercase text-white mb-2 text-center">Editar Cita</h2>
              <div className="flex items-center gap-3 bg-mbRed/10 border border-mbRed/20 p-4 rounded-2xl mb-8">
                <div className="w-12 h-12 bg-mbRed text-white rounded-xl flex items-center justify-center font-bold text-xl font-['Oswald']">
                  {editingApp.time}
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-xl leading-none">{editingApp.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <button 
                  onClick={() => handleAction("noshow", editingApp)}
                  className="flex flex-col items-center justify-center p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-yellow-500/10 hover:border-yellow-500/30 group transition-all"
                >
                  <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-yellow-500">No Asistió</span>
                </button>
                <button 
                  onClick={() => handleAction("delete", editingApp)}
                  className="flex flex-col items-center justify-center p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 group transition-all"
                >
                  <Trash2 className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-red-500">Eliminar</span>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 pt-6 border-t border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-mbRed"
                    value={editingApp.name}
                    onChange={e => setEditingApp({...editingApp, name: e.target.value})}
                  />
                  <input 
                    type="time" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-mbRed [color-scheme:dark]"
                    value={editingApp.time}
                    onChange={e => setEditingApp({...editingApp, time: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-mbRed text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest text-xs"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
