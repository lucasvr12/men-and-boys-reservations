"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, MapPin, Search, Trash2, Edit2, Coffee, Umbrella, PlusCircle, X, ChevronLeft, ChevronRight as ChevronRightIcon, CheckCircle, Users, AlertCircle, Eye, EyeOff, Camera } from "lucide-react";
import { branches, stylists } from "@/lib/constants";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState("appointments"); // "appointments", "full_agenda", "staff", "profiles", "employees", "services", "clientes"

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
  const [filterBranch, setFilterBranch] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Removed Metrics State
  
  // Customers State
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  // Edit State
  const [editingApp, setEditingApp] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Managed Data
  const [managedEmployees, setManagedEmployees] = useState([]);
  const [managedServices, setManagedServices] = useState([]);
  const [isSavingData, setIsSavingData] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Stylist Profile State
  const [showPasswords, setShowPasswords] = useState({});
  const [savingProfile, setSavingProfile] = useState({});

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
      const res = await fetch(`/api/admin/appointments?t=${Date.now()}`); 
      const data = await res.json();
      if (res.ok) setAllMonthlyAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    }
  };

  // fetchMetrics removed

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchMonthlyAppointments();
      fetchCustomers();
      fetchManagedData();
    }
  }, [filterDate, isAuthenticated]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const res = await fetch(`/api/admin/customers?t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchManagedData = async () => {
    try {
      const [empRes, servRes] = await Promise.all([
        fetch('/api/admin/employees'),
        fetch('/api/admin/services')
      ]);
      const empData = await empRes.json();
      const servData = await servRes.json();
      setManagedEmployees(empData.employees || []);
      setManagedServices(servData.services || []);
    } catch (err) {
      console.error("Error fetching managed data:", err);
    }
  };

  const exportToCSV = () => {
    if (customers.length === 0) return;
    
    const headers = ["Nombre", "Apellido", "Teléfono", "Sucursal Pref.", "Estilista Pref.", "Servicio Pref.", "Día Pref.", "Hora Pref."];
    const rows = customers.map(c => [
      c.name, 
      c.surname, 
      c.phone, 
      c.branch, 
      c.stylist, 
      c.service, 
      c.day, 
      c.time
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clientes_men_and_boys_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (app, status = "Cancelada") => {
    const confirmMsg = status === "No asistió" ? "¿Marcar como 'No asistió'?" : "¿Estás seguro de que deseas eliminar esta cita?";
    if (!confirm(confirmMsg)) return;
    
    try {
      const queryParams = new URLSearchParams({
        branch: app.branch || "",
        phone: app.phone || "",
        date: app.date || "",
        time: app.time || "",
        status: status,
        t: Date.now()
      }).toString();

      const res = await fetch(`/api/admin/appointments/${app.id}?${queryParams}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Error al procesar acción");
      }
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  const saveEmployees = async (data) => {
    setIsSavingData(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchManagedData();
    } finally {
      setIsSavingData(false);
    }
  };

  const saveServices = async (data) => {
    setIsSavingData(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchManagedData();
    } finally {
      setIsSavingData(false);
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
                  (app.name || "").includes("COMIDA") ? "bg-yellow-500" : 
                  (app.name || "").includes("VACACIONES") ? "bg-blue-500" : "bg-mbRed"
                }`}
                title={`${app.time || "00:00"} - ${app.name || ""}`}
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
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'appointments' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              CITAS
            </button>
            <button 
              onClick={() => setActiveTab("full_agenda")}
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'full_agenda' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              AGENDA COMPLETA
            </button>
            <button 
              onClick={() => setActiveTab("staff")}
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'staff' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              BLOQUEOS
            </button>
            <button 
              onClick={() => setActiveTab("employees")}
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'employees' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              EMPLEADAS
            </button>
            <button 
              onClick={() => setActiveTab("services")}
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'services' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              SERVICIOS
            </button>
            <button 
              onClick={() => setActiveTab("profiles")}
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'profiles' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              PERFILES
            </button>
            <button 
              onClick={() => setActiveTab("clientes")}
              className={`pb-2 px-1 text-[10px] font-bold transition-all ${activeTab === 'clientes' ? 'text-mbRed border-b-2 border-mbRed' : 'text-gray-500 hover:text-white'}`}
            >
              CLIENTES
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'appointments' ? (
        <div className="space-y-8">
          {/* Daily Appointments List */}
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">
                Citas del {filterDate ? new Date(filterDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : "Día no seleccionado"}
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

            {/* Branch Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilterBranch("all")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterBranch === "all" ? "bg-mbRed text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                Todas
              </button>
              {branches.map(b => (
                <button
                  key={b.id}
                  onClick={() => setFilterBranch(b.id)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filterBranch === b.id ? "bg-mbRed text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-mbRed border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm">Actualizando agenda...</p>
              </div>
            ) : (() => {
              const filtered = appointments.filter(app => {
                if (filterBranch === "all") return true;
                const branchObj = branches.find(b => b.id === filterBranch);
                return (app.branch || "").toLowerCase().includes(filterBranch) ||
                       app.branch === branchObj?.name;
              });
              if (filtered.length === 0) return (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center text-gray-500 italic">
                  No hay citas para {filterBranch === "all" ? "este día" : branches.find(b => b.id === filterBranch)?.name}.
                </div>
              );
              return (
                <div className="overflow-x-auto rounded-2xl border border-white/10 animate-fade-in">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/60 border-b border-white/10">
                        <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hora</th>
                        <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cliente</th>
                        <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Sucursal</th>
                        <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Estilista</th>
                        <th className="text-center px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered
                        .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                        .map((app, i) => (
                        <tr
                          key={app.id || i}
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                            (app.name || "").includes("COMIDA") ? "bg-yellow-500/5" :
                            (app.name || "").includes("VACACIONES") ? "bg-blue-500/5" : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <span className="font-bold font-['Oswald'] text-mbRed text-lg">{app.time || "—"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-white flex items-center gap-2">
                              {app.name || "Sin nombre"}
                              {(app.name || "").includes("COMIDA") && <Coffee className="w-3 h-3 text-yellow-500" />}
                              {(app.name || "").includes("VACACIONES") && <Umbrella className="w-3 h-3 text-blue-400" />}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-gray-400 text-xs">{app.branch || "—"}</span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-gray-400 text-xs">{app.stylist || "—"}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => setEditingApp(app)}
                              className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Monthly Calendar Integration */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
        </div>
      ) : activeTab === 'full_agenda' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">Agenda General - {filterDate}</h2>
            <div className="flex items-center gap-4">
              <select 
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                value={agendaSelectedBranch}
                onChange={(e) => setAgendaSelectedBranch(e.target.value)}
              >
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input 
                type="date" 
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/60 border-b border-white/10">
                  <th className="p-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky left-0 bg-black/80 z-20 w-24">Hora</th>
                  {stylists.filter(s => s.branch === agendaSelectedBranch || s.branch === 'all').map(s => (
                    <th key={s.id} className="p-4 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest min-w-[150px]">
                      <div className="flex flex-col items-center gap-1">
                        <img 
                          src={s.img} 
                          className="w-8 h-8 rounded-full border border-mbRed/30" 
                          alt="" 
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=333&color=fff`;
                          }}
                        />
                        <span>{s.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const slots = [];
                  for (let h = 10; h < 20; h++) {
                    for (let m = 0; m < 60; m += 30) {
                      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
                    }
                  }
                  return slots.map(time => (
                    <tr key={time} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-['Oswald'] font-bold text-mbRed text-lg sticky left-0 bg-black/80 z-10 group-hover:bg-white/5 border-r border-white/5">{time}</td>
                      {stylists.filter(s => s.branch === agendaSelectedBranch || s.branch === 'all').map(s => {
                        const app = appointments.find(a => a.time === time && (a.stylist === s.name || (s.id === 'any' && a.stylist === 'Sin preferencia')));
                        const isBlock = app && ((app.name || "").includes("COMIDA") || (app.name || "").includes("VACACIONES") || (app.name || "").includes("BLOQUEO"));
                        
                        return (
                          <td key={s.id} className={`p-1 border-r border-white/5 min-h-[60px]`}>
                            {app ? (
                              <div 
                                onClick={() => setEditingApp(app)}
                                className={`p-2 rounded-lg h-full text-[10px] cursor-pointer transition-all hover:scale-[1.02] ${
                                  isBlock ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" : 
                                  "bg-mbRed/20 text-white border border-mbRed/30"
                                }`}
                              >
                                <p className="font-bold uppercase truncate">{app.name}</p>
                                <p className="text-[8px] opacity-60 truncate">{app.serviceName || "Servicio"}</p>
                              </div>
                            ) : (
                              <div className="h-full w-full opacity-0 hover:opacity-100 flex items-center justify-center">
                                <PlusCircle className="w-4 h-4 text-gray-700" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'employees' ? (
        <div className="space-y-6 animate-fade-in pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">Gestión de Empleadas</h2>
            <button 
              onClick={() => {
                setEditingEmployee({
                  id: `e-${Date.now()}`,
                  name: "",
                  branch: "carrizalejo",
                  img: `https://ui-avatars.com/api/?background=111&color=cc0000&name=New`,
                  canTakeAppointments: true,
                  role: "stylist"
                });
              }}
              className="bg-mbRed text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Nueva Empleada
            </button>
          </div>
          
          <div className="grid gap-4">
            {managedEmployees.map(emp => (
              <div key={emp.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <img 
                    src={emp.img} 
                    className="w-12 h-12 rounded-full object-cover border border-white/10" 
                    alt="" 
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=333&color=fff`;
                    }}
                  />
                  <div>
                    <p className="font-bold uppercase text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {branches.find(b => b.id === emp.branch)?.name || emp.branch}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingEmployee(emp)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${emp.name}?`)) {
                        saveEmployees(managedEmployees.filter(e => e.id !== emp.id));
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-mbRed transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'services' ? (
        <div className="space-y-6 animate-fade-in pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">Catálogo de Servicios</h2>
            <button 
              onClick={() => {
                setEditingService({
                  id: `s-${Date.now()}`,
                  name: "",
                  price: "$0",
                  durationMins: 30,
                  category: "HAIRSTUDIO",
                  branches: ["carrizalejo", "mision", "nacional"],
                  active: true
                });
              }}
              className="bg-mbRed text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Servicio
            </button>
          </div>
          
          <div className="grid gap-3">
            {managedServices.map(serv => (
              <div key={serv.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <p className="font-bold uppercase text-white text-lg">{serv.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-mbRed font-bold text-sm bg-mbRed/10 px-2 py-0.5 rounded-lg">{serv.price}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{serv.durationMins} min</span>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">{serv.category}</span>
                    {!serv.active && <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full uppercase font-bold">Inactivo</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingService(serv)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`¿Eliminar ${serv.name}?`)) {
                        saveServices(managedServices.filter(s => s.id !== serv.id));
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-mbRed transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : activeTab === 'profiles' ? (
        <div className="space-y-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">Perfiles del Staff</h2>
            <p className="text-xs text-gray-500">Foto, teléfono y contraseña de acceso por estilista</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylists.filter(s => s.canTakeAppointments).map(stylist => (
              <div key={stylist.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-5 hover:border-white/20 transition-all">
                
                {/* Photo section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <img 
                      src={stylistSettings[stylist.id]?.photo || stylist.img} 
                      alt={stylist.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:border-mbRed/50 transition-all"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(stylist.name)}&background=333&color=fff`;
                      }}
                    />
                    <label 
                      htmlFor={`photo-${stylist.id}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </label>
                    <input 
                      id={`photo-${stylist.id}`}
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setStylistSettings(prev => ({
                            ...prev,
                            [stylist.id]: { ...prev[stylist.id], photo: ev.target.result }
                          }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-['Oswald'] font-bold uppercase text-white">{stylist.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      {branches.find(b => b.id === stylist.branch)?.name || stylist.branch}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Teléfono SMS</label>
                  <input 
                    type="tel"
                    placeholder="+528112345678"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-sm text-white outline-none focus:border-mbRed transition-colors"
                    value={stylistSettings[stylist.id]?.phone || ""}
                    onChange={(e) => {
                      setStylistSettings(prev => ({ ...prev, [stylist.id]: { ...prev[stylist.id], phone: e.target.value } }));
                    }}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Contraseña de Acceso Staff</label>
                  <div className="relative">
                    <input 
                      type={showPasswords[stylist.id] ? "text" : "password"}
                      placeholder="myb2026$$"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 pr-10 text-sm text-white outline-none focus:border-mbRed transition-colors font-mono"
                      value={stylistSettings[stylist.id]?.password || ""}
                      onChange={(e) => {
                        setStylistSettings(prev => ({ ...prev, [stylist.id]: { ...prev[stylist.id], password: e.target.value } }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, [stylist.id]: !prev[stylist.id] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPasswords[stylist.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600">Dejar en blanco para usar la contraseña actual (myb2026$$)</p>
                </div>

                {/* Save button */}
                <button 
                  disabled={savingProfile[stylist.id]}
                  onClick={async () => {
                    setSavingProfile(prev => ({ ...prev, [stylist.id]: true }));
                    try {
                      const res = await fetch('/api/admin/stylists', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(stylistSettings)
                      });
                      if (res.ok) {
                        setSavingProfile(prev => ({ ...prev, [stylist.id]: false }));
                        alert(`¡Perfil de ${stylist.name} guardado!`);
                      }
                    } catch (err) {
                      alert("Error al guardar");
                      setSavingProfile(prev => ({ ...prev, [stylist.id]: false }));
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-mbRed/20 text-mbRed border border-mbRed/30 hover:bg-mbRed hover:text-white py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  {savingProfile[stylist.id] ? "Guardando..." : "Guardar Perfil"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'clientes' ? (
        <div className="space-y-8 animate-slide-up pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase text-white">Directorio de Clientes</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full md:w-80">
                <Search className="w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o teléfono..."
                  className="bg-transparent border-none focus:ring-0 text-sm text-white w-full"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
              </div>
              <button 
                onClick={exportToCSV}
                className="bg-white text-black font-bold py-3 px-6 rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl"
              >
                Descargar Excel (CSV)
              </button>
            </div>
          </div>

          {isLoadingCustomers ? (
            <div className="text-center py-40">
              <div className="w-12 h-12 border-4 border-mbRed border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-500 font-bold uppercase tracking-widest">Cargando base de datos de clientes...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-20 text-center text-gray-500 italic">
              Aún no hay clientes registrados en el sistema.
            </div>
          ) : (
            <div className="grid gap-4">
              {customers
                .filter(c => 
                  (c.name || "").toLowerCase().includes(customerSearch.toLowerCase()) || 
                  (c.phone || "").includes(customerSearch)
                )
                .map((customer, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-mbRed/10 text-mbRed rounded-full flex items-center justify-center font-bold text-xl font-['Oswald'] border border-mbRed/20">
                      {(customer.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-['Oswald'] font-bold uppercase text-white">
                        {customer.name} {customer.surname}
                      </h3>
                      <p className="text-mbRed font-bold text-sm">{customer.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-2xl">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sucursal</p>
                      <p className="text-xs font-bold text-gray-300">{customer.branch || "N/A"}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Estilista</p>
                      <p className="text-xs font-bold text-gray-300">{customer.stylist || "N/A"}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Día Pref.</p>
                      <p className="text-xs font-bold text-gray-300">
                        {customer.day === "1" ? "Lun" : customer.day === "2" ? "Mar" : customer.day === "3" ? "Mié" : customer.day === "4" ? "Jue" : customer.day === "5" ? "Vie" : customer.day === "6" ? "Sáb" : "Dom"}
                      </p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Últ. Hora</p>
                      <p className="text-xs font-bold text-gray-300">{customer.time || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                        <img 
                          src={s.img} 
                          className="w-6 h-6 rounded-full" 
                          alt="" 
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=333&color=fff`;
                          }}
                        />
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

      {/* Service Editor Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-3xl p-8 relative animate-scale-in">
            <button onClick={() => setEditingService(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-['Oswald'] font-bold uppercase text-white mb-8">Administrar Servicio</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const exists = managedServices.find(s => s.id === editingService.id);
              if (exists) {
                saveServices(managedServices.map(s => s.id === editingService.id ? editingService : s));
              } else {
                saveServices([...managedServices, editingService]);
              }
              setEditingService(null);
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Nombre del Servicio</label>
                  <input 
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                    value={editingService.name}
                    onChange={e => setEditingService({...editingService, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Precio</label>
                  <input 
                    type="text" required placeholder="$280"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                    value={editingService.price}
                    onChange={e => setEditingService({...editingService, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Duración (Mins)</label>
                  <input 
                    type="number" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                    value={editingService.durationMins}
                    onChange={e => setEditingService({...editingService, durationMins: parseInt(e.target.value)})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Categoría / Bloque</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                    value={editingService.category}
                    onChange={e => setEditingService({...editingService, category: e.target.value})}
                  >
                    <option value="HAIRSTUDIO">HAIRSTUDIO (Cabello)</option>
                    <option value="AFEITADO">AFEITADO (Barba)</option>
                    <option value="GROOMING">GROOMING (Limpieza)</option>
                    <option value="SPA">SPA (Tratamientos)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                <input 
                  type="checkbox" id="service-active"
                  className="w-5 h-5 accent-mbRed"
                  checked={editingService.active}
                  onChange={e => setEditingService({...editingService, active: e.target.checked})}
                />
                <label htmlFor="service-active" className="text-sm text-gray-300 font-bold uppercase tracking-widest">Servicio Activo</label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-mbRed text-white font-bold py-5 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-[0.2em] font-['Oswald'] shadow-xl shadow-mbRed/20"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Employee Editor Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-3xl p-8 relative animate-scale-in">
            <button onClick={() => setEditingEmployee(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-['Oswald'] font-bold uppercase text-white mb-8">Administrar Empleada</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const exists = managedEmployees.find(emp => emp.id === editingEmployee.id);
              if (exists) {
                saveEmployees(managedEmployees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
              } else {
                saveEmployees([...managedEmployees, editingEmployee]);
              }
              setEditingEmployee(null);
            }} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <img 
                  src={editingEmployee.img} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-mbRed mb-4" 
                  alt="" 
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editingEmployee.name)}&background=333&color=fff`;
                  }}
                />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Vista previa del perfil</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
                  <input 
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                    value={editingEmployee.name}
                    onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Sucursal Asignada</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                    value={editingEmployee.branch}
                    onChange={e => setEditingEmployee({...editingEmployee, branch: e.target.value})}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                    <option value="all">Todas las sucursales</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Rol</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-mbRed transition-all"
                      value={editingEmployee.role}
                      onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value})}
                    >
                      <option value="stylist">Estilista</option>
                      <option value="receptionist">Recepcionista</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input 
                      type="checkbox" id="emp-active"
                      className="w-5 h-5 accent-mbRed"
                      checked={editingEmployee.canTakeAppointments}
                      onChange={e => setEditingEmployee({...editingEmployee, canTakeAppointments: e.target.checked})}
                    />
                    <label htmlFor="emp-active" className="text-xs text-gray-300 font-bold uppercase tracking-widest">Recibe Citas</label>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-mbRed text-white font-bold py-5 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-[0.2em] font-['Oswald'] shadow-xl shadow-mbRed/20"
              >
                Guardar Empleada
              </button>
            </form>
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
            <h2 className="text-2xl font-['Oswald'] font-bold uppercase mb-6 text-white text-center">Editar Cita</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => { handleDelete(editingApp, "No asistió"); setEditingApp(null); }}
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-yellow-500/10 hover:border-yellow-500/30 group transition-all"
              >
                <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-yellow-500">No Asistió</span>
              </button>
              <button 
                onClick={() => { handleDelete(editingApp, "Cancelada"); setEditingApp(null); }}
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 group transition-all"
              >
                <Trash2 className="w-6 h-6 text-red-500 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-red-500">Cancelar Cita</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-6 border-t border-white/10">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre del Cliente</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-mbRed"
                  value={editingApp.name}
                  onChange={e => setEditingApp({...editingApp, name: e.target.value})}
                  required
                />
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sucursal</label>
                  <select 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                    value={editingApp.branch?.toLowerCase()}
                    onChange={e => {
                      const branchId = e.target.value;
                      const branchName = branches.find(b => b.id === branchId)?.name;
                      setEditingApp({...editingApp, branch: branchName});
                    }}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estilista</label>
                  <select 
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                    value={editingApp.stylist}
                    onChange={e => setEditingApp({...editingApp, stylist: e.target.value, stylistName: e.target.value})}
                  >
                    <option value="Sin preferencia">Sin preferencia</option>
                    {stylists.filter(s => s.branch === (branches.find(b => b.name === editingApp.branch)?.id || editingApp.branch?.toLowerCase()) || s.branch === 'all').map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
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
