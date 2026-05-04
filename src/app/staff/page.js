"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin, Users } from "lucide-react";
import { branches, stylists } from "@/lib/constants";

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function StaffAgenda() {
  const [mode, setMode] = useState("personal"); // "personal" | "branch"
  const [selectedStylist, setSelectedStylist] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("carrizalejo");

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [dayAppointments, setDayAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch monthly appointments whenever branch or mode changes
  useEffect(() => {
    fetchMonthly();
  }, [selectedBranch]);

  useEffect(() => {
    filterDay(selectedDate);
  }, [selectedDate, selectedStylist, mode, allAppointments]);

  const fetchMonthly = async () => {
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

    if (mode === "branch") {
      const branchName = branches.find(b => b.id === selectedBranch)?.name;
      filtered = filtered.filter(a => a.branch?.toLowerCase().includes(selectedBranch) || a.branch === branchName);
    } else if (mode === "personal" && selectedStylist) {
      const stylistName = stylists.find(s => s.id === selectedStylist)?.name;
      filtered = filtered.filter(a => a.stylist === stylistName || a.stylist === "Sin preferencia");
    }

    setDayAppointments(filtered);
  };

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getAppointmentsForDay = (fullDate) => {
    let filtered = allAppointments.filter(a => a.date === fullDate);
    if (mode === "branch") {
      filtered = filtered.filter(a =>
        a.branch?.toLowerCase().includes(selectedBranch) ||
        a.branch === branches.find(b => b.id === selectedBranch)?.name
      );
    } else if (mode === "personal" && selectedStylist) {
      const stylistName = stylists.find(s => s.id === selectedStylist)?.name;
      filtered = filtered.filter(a => a.stylist === stylistName || a.stylist === "Sin preferencia");
    }
    return filtered;
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth();
    const days = [];

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(<div key={`e-${i}`} className="h-14 md:h-20 border border-white/5 bg-white/[0.01]" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const dayApps = getAppointmentsForDay(fullDate);
      const isSelected = selectedDate === fullDate;
      const isToday = new Date().toISOString().split("T")[0] === fullDate;

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(fullDate)}
          className={`h-14 md:h-20 border border-white/10 p-1 md:p-2 text-left transition-all hover:bg-white/10 ${
            isSelected ? "bg-mbRed/30 border-mbRed/60" : "bg-white/5"
          } ${isToday ? "ring-2 ring-mbRed/40 ring-inset" : ""}`}
        >
          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>{d}</span>
          {dayApps.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-0.5">
              {dayApps.slice(0, 6).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-mbRed" />
              ))}
              {dayApps.length > 6 && <span className="text-[8px] text-mbRed font-bold">+{dayApps.length - 6}</span>}
            </div>
          )}
        </button>
      );
    }
    return days;
  };

  const stylistObj = stylists.find(s => s.id === selectedStylist);
  const branchObj = branches.find(b => b.id === selectedBranch);

  const showCalendar = mode === "branch" || (mode === "personal" && selectedStylist);

  return (
    <div className="animate-fade-in space-y-8 text-white">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-['Oswald'] font-bold uppercase">Mi Agenda</h1>
        <p className="text-gray-400 mt-2">Consulta tu horario y el de tu sucursal</p>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 max-w-sm mx-auto">
        <button
          onClick={() => setMode("personal")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "personal" ? "bg-mbRed text-white shadow-lg" : "text-gray-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4" /> Mi Agenda
        </button>
        <button
          onClick={() => setMode("branch")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "branch" ? "bg-mbRed text-white shadow-lg" : "text-gray-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> Agenda Sucursal
        </button>
      </div>

      {/* Selector Panel */}
      {mode === "personal" ? (
        <div className="max-w-sm mx-auto space-y-4 animate-step-in">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-widest">¿Quién eres?</label>
            <select
              className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-mbRed outline-none transition-colors"
              value={selectedStylist}
              onChange={e => setSelectedStylist(e.target.value)}
            >
              <option value="">Selecciona tu nombre...</option>
              {stylists.filter(s => s.canTakeAppointments).map(s => (
                <option key={s.id} value={s.id}>{s.name} — {branches.find(b => b.id === s.branch)?.name}</option>
              ))}
            </select>
          </div>
          {stylistObj && (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl animate-fade-in">
              <img src={stylistObj.img} className="w-14 h-14 rounded-full" alt={stylistObj.name} />
              <div>
                <p className="font-bold font-['Oswald'] text-xl uppercase">{stylistObj.name}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {branches.find(b => b.id === stylistObj.branch)?.name}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-sm mx-auto animate-step-in">
          <label className="block text-sm text-gray-400 mb-2 font-bold uppercase tracking-widest">Sucursal</label>
          <div className="grid grid-cols-3 gap-2">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                  selectedBranch === b.id
                    ? "bg-mbRed border-mbRed text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {showCalendar && (
        <div className="space-y-6 animate-step-in">
          {/* Month Calendar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-black/40 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg font-['Oswald'] font-bold uppercase flex items-center gap-2 capitalize">
                <Calendar className="w-5 h-5 text-mbRed" />
                {viewDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-1">
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setViewDate(new Date())} className="px-3 py-1 text-xs font-bold bg-mbRed/20 text-mbRed rounded-lg hover:bg-mbRed/30 transition-colors">
                  HOY
                </button>
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-white/10">
              {DAYS.map(d => (
                <div key={d} className="bg-black/60 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {d}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>

          {/* Day Detail */}
          <div className="space-y-4">
            <h3 className="text-xl font-['Oswald'] font-bold uppercase text-white">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
            </h3>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-mbRed border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Cargando agenda...</p>
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 italic">Sin citas para este día.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {dayAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((app, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 transition-all">
                      <div className="w-14 h-14 bg-mbRed/20 text-mbRed rounded-xl flex flex-col items-center justify-center font-bold font-['Oswald'] shrink-0">
                        <span className="text-xl leading-none">{app.time.split(":")[0]}</span>
                        <span className="text-[10px]">:{app.time.split(":")[1]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold font-['Oswald'] uppercase text-lg leading-tight">{app.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-mbRed/60" /> {app.time}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3 text-mbRed/60" /> {app.stylist}</span>
                          {mode === "branch" && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-mbRed/60" /> {app.branch}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state before selection */}
      {!showCalendar && (
        <div className="text-center py-16 text-gray-600">
          <Calendar className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Selecciona {mode === "personal" ? "tu nombre" : "una sucursal"} para ver la agenda.</p>
        </div>
      )}
    </div>
  );
}
