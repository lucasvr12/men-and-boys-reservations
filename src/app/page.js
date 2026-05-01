"use client";

import { useState } from "react";
import { MapPin, Clock, User, Calendar as CalendarIcon, CheckCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { branches, stylists } from "@/lib/constants";

const services = [
  { id: "15min", name: "Corte Rápido", duration: "15 min", price: "$150" },
  { id: "30min", name: "Corte Estándar", duration: "30 min", price: "$250" },
  { id: "60min", name: "Servicio Completo", duration: "1 hora", price: "$400" },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: "",
    service: "",
    stylist: "",
    name: "",
    phone: "",
    date: "",
    time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const updateData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "date") {
      fetchAvailability(value);
    }
  };

  const fetchAvailability = async (selectedDate) => {
    setFormData((prev) => ({ ...prev, time: "" })); // Reset time
    setIsLoadingTimes(true);
    setClosedMessage("");
    try {
      const res = await fetch(`/api/availability?date=${selectedDate}&branch=${formData.branch}&duration=${formData.service}&stylist=${formData.stylist}`);
      const data = await res.json();
      if (data.message) {
        setClosedMessage(data.message);
        setAvailableTimes([]);
      } else {
        setAvailableTimes(data.availableSlots || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  const handleBranchSelect = (id) => {
    updateData("branch", id);
  };

  const handleServiceSelect = (id) => {
    updateData("service", id);
    nextStep();
  };

  const handleStylistSelect = (id) => {
    updateData("stylist", id);
    nextStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          branchName: branches.find(b => b.id === formData.branch)?.name,
          serviceName: services.find(s => s.id === formData.service)?.name,
          stylistName: stylists.find(s => s.id === formData.stylist)?.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la cita");
      }
      
      nextStep();
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al registrar la cita: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* Progress Bar */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 font-['Oswald'] tracking-wider">
            <span className={step >= 1 ? "text-mbRed" : ""}>SUCURSAL</span>
            <span className={step >= 2 ? "text-mbRed" : ""}>SERVICIO</span>
            <span className={step >= 3 ? "text-mbRed" : ""}>ESTILISTA</span>
            <span className={step >= 4 ? "text-mbRed" : ""}>DATOS</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-mbRed transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: SUCURSAL */}
      {step === 1 && (
        <div key="step1" className="space-y-6 animate-step-in">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">Elige tu sucursal</h1>
            <p className="text-gray-400">Selecciona la ubicación más cercana a ti en Nuevo León.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch.id)}
                className={`flex flex-col items-center p-8 border rounded-xl transition-all duration-300 hover:-translate-y-1 ${
                  formData.branch === branch.id
                    ? "border-mbRed bg-mbRed/10 shadow-lg shadow-mbRed/20"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <MapPin className={`w-10 h-10 mb-4 ${formData.branch === branch.id ? "text-mbRed" : "text-gray-400"}`} />
                <h3 className="text-xl font-bold font-['Oswald'] uppercase">{branch.name}</h3>
                <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">{branch.address}</p>
              </button>
            ))}
          </div>

          {/* Map Display Section */}
          {formData.branch && (
            <div className="mt-8 animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-mbRed uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Ubicación en Mapa
                </h4>
                <span className="text-[10px] text-gray-500 uppercase">Cerca de ti</span>
              </div>
              <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative bg-white/5">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(branches.find(b => b.id === formData.branch).address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={nextStep}
                  className="w-full bg-mbRed text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all uppercase tracking-[0.2em] shadow-lg shadow-mbRed/30 animate-bounce-subtle"
                >
                  Continuar con esta sucursal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SERVICIO */}
      {step === 2 && (
        <div key="step2" className="space-y-6 animate-step-in">
          <button onClick={prevStep} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">¿Qué servicio buscas?</h2>
            <p className="text-gray-400">Elige la duración de tu cita.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`flex flex-col text-left p-6 border rounded-xl transition-all duration-300 hover:-translate-y-1 ${
                  formData.service === service.id
                    ? "border-mbRed bg-mbRed/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-start w-full mb-4">
                  <Clock className={`w-8 h-8 ${formData.service === service.id ? "text-mbRed" : "text-gray-400"}`} />
                  <span className="font-bold text-lg">{service.price}</span>
                </div>
                <h3 className="text-xl font-bold font-['Oswald'] uppercase">{service.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{service.duration}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: ESTILISTA */}
      {step === 3 && (
        <div key="step3" className="space-y-6 animate-step-in">
          <button onClick={prevStep} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">Elige tu estilista</h2>
            <p className="text-gray-400">Si no tienes preferencia, asignaremos al primero disponible.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stylists
              .filter(s => s.branch === "all" || s.branch === formData.branch)
              .map((stylist) => (
                <button
                  key={stylist.id}
                  onClick={() => handleStylistSelect(stylist.id)}
                  className={`flex flex-col items-center p-6 border rounded-xl transition-all duration-300 hover:-translate-y-1 ${
                    formData.stylist === stylist.id
                      ? "border-mbRed bg-mbRed/10"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <img src={stylist.img} alt={stylist.name} className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-transparent" />
                  <h3 className="font-bold font-['Oswald'] uppercase text-center">{stylist.name}</h3>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* STEP 4: DATOS */}
      {step === 4 && (
        <div key="step4" className="max-w-md mx-auto space-y-6 animate-step-in">
          <button onClick={prevStep} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">Confirma tu cita</h2>
            <p className="text-gray-400">Ingresa tus datos para completar la reservación.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h4 className="font-['Oswald'] uppercase text-gray-400 mb-4 text-sm">Resumen de tu cita</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sucursal:</span>
                <span className="font-bold">{branches.find(b => b.id === formData.branch)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Servicio:</span>
                <span className="font-bold">{services.find(s => s.id === formData.service)?.name} ({services.find(s => s.id === formData.service)?.duration})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estilista:</span>
                <span className="font-bold">{stylists.find(s => s.id === formData.stylist)?.name}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-black/50 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-mbRed focus:ring-1 focus:ring-mbRed transition-colors"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => updateData("name", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono (Para SMS)</label>
              <input
                type="tel"
                required
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-mbRed focus:ring-1 focus:ring-mbRed transition-colors"
                placeholder="81 1234 5678"
                value={formData.phone}
                onChange={(e) => updateData("phone", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-lg">
              <input 
                type="checkbox" 
                id="sendReminders"
                className="w-5 h-5 accent-mbRed"
                checked={formData.sendReminders || false}
                onChange={(e) => updateData("sendReminders", e.target.checked)}
              />
              <label htmlFor="sendReminders" className="text-sm text-gray-300">
                Enviarme recordatorios por SMS (1 día y 1.5 horas antes)
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-black/50 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-mbRed focus:ring-1 focus:ring-mbRed transition-colors [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => updateData("date", e.target.value)}
                />
              </div>
            </div>

            {formData.date && (
              <div className="mb-4 animate-fade-in">
                <label className="block text-sm font-medium mb-2">Horarios Disponibles</label>
                
                {isLoadingTimes ? (
                  <div className="flex items-center justify-center p-6 text-gray-400">
                    <div className="w-5 h-5 border-2 border-mbRed border-t-transparent rounded-full animate-spin mr-2"></div>
                    Buscando horarios libres...
                  </div>
                ) : closedMessage ? (
                  <div className="bg-red-500/10 text-mbRed p-4 rounded-lg text-center font-bold">
                    {closedMessage}
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center text-gray-400">
                    Lo sentimos, no hay horarios disponibles para esta fecha. Intenta con otro día.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => updateData("time", time)}
                        className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                          formData.time === time
                            ? "bg-mbRed text-white"
                            : "bg-white/5 border border-white/10 hover:border-mbRed/50 hover:bg-mbRed/10 text-gray-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" required value={formData.time} />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.time}
              className="w-full bg-mbRed hover:bg-red-700 text-white font-bold py-4 rounded-lg mt-6 transition-all font-['Oswald'] uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Procesando...</span>
              ) : (
                <>Confirmar Cita <ChevronRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 5: SUCCESS */}
      {step === 5 && (
        <div key="step5" className="text-center py-20 animate-scale-in">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-5xl font-['Oswald'] font-bold mb-4 uppercase">¡Cita Confirmada!</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
            Hemos registrado tu reservación. Te hemos enviado un SMS de confirmación al <strong className="text-white">{formData.phone}</strong>.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-md mx-auto mb-8 text-left">
            <div className="grid grid-cols-2 gap-y-4 text-lg">
              <div className="text-gray-400">Día:</div>
              <div className="font-bold text-right">{formData.date}</div>
              <div className="text-gray-400">Hora:</div>
              <div className="font-bold text-right">{formData.time}</div>
              <div className="text-gray-400">Sucursal:</div>
              <div className="font-bold text-right">{branches.find(b => b.id === formData.branch)?.name}</div>
            </div>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setFormData({ branch: "", service: "", stylist: "", name: "", phone: "", date: "", time: "" });
            }}
            className="text-mbRed hover:text-red-400 font-bold transition-colors font-['Oswald'] uppercase tracking-wider"
          >
            Hacer otra reservación
          </button>
        </div>
      )}
    </div>
  );
}
