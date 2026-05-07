"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, User, Calendar as CalendarIcon, CheckCircle, ChevronRight, ArrowLeft, Phone, Search } from "lucide-react";
import { branches, stylists, servicesCatalog } from "@/lib/constants";

export default function Home() {
  const [step, setStep] = useState(0); // 0: Welcome, 0.1: Identify, 1-4: Regular flow
  const [isRegisteredFlow, setIsRegisteredFlow] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("HAIRSTUDIO");
  
  const [formData, setFormData] = useState({
    branch: "",
    service: "",
    stylist: "",
    name: "",
    surname: "",
    phone: "",
    date: "",
    time: "",
    sendReminders: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");

  const nextStep = () => setStep((s) => (s < 1 ? 1 : s + 1));
  const prevStep = () => {
    if (step === 0.1) setStep(0);
    else if (step === 1 && isRegisteredFlow) setStep(0);
    else if (step === 1) setStep(0);
    else if (step === 4 && isRegisteredFlow) setStep(0.1);
    else setStep((s) => s - 1);
  };

  const updateData = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    if (field === "date" || field === "branch" || field === "service" || field === "stylist") {
      fetchAvailability(newFormData.date, newFormData.branch, newFormData.service, newFormData.stylist);
    }
  };

  const fetchAvailability = async (selectedDate, branch, service, stylist) => {
    if (!selectedDate || !branch || !service || !stylist) return;
    
    setFormData((prev) => ({ ...prev, time: "" })); // Reset time
    setIsLoadingTimes(true);
    setClosedMessage("");
    try {
      const res = await fetch(`/api/availability?date=${selectedDate}&branch=${branch}&duration=${service}&stylist=${stylist}`);
      const data = await res.json();
      
      if (data.status === "vacation") {
        setClosedMessage(data.message);
        setAvailableTimes([]);
      } else if (data.message) {
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

  const handleIdentify = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError("");
    
    try {
      const res = await fetch(`/api/customers?phone=${lookupPhone}`);
      const data = await res.json();
      
      if (data.found) {
        const customer = data.customer;
        setFormData({
          ...formData,
          phone: customer.phone,
          name: customer.name,
          surname: customer.surname,
          branch: customer.branch || "",
          service: customer.service || "",
          stylist: customer.stylist || "",
        });
        setIsRegisteredFlow(true);
        setStep(4); // Jump to data/date selection
      } else {
        setSearchError("No encontramos un cliente con ese número. Por favor regístrate.");
        setTimeout(() => {
          setStep(1);
          setIsRegisteredFlow(false);
        }, 2000);
      }
    } catch (error) {
      setSearchError("Error al buscar cliente. Intenta de nuevo.");
    } finally {
      setIsSearching(false);
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
          serviceName: servicesCatalog.find(s => s.id === formData.service)?.name,
          stylistName: stylists.find(s => s.id === formData.stylist)?.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la cita");
      }
      
      setStep(5);
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al registrar la cita: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-12 animate-fade-in relative">
      {/* Progress Bar (Only for registration or booking flow) */}
      {step >= 1 && step < 5 && (
        <div className="mb-8">
          <div className="text-center text-sm font-bold text-mbRed mb-2 font-['Oswald'] tracking-widest uppercase">
            {step === 1 && "SUCURSAL"}
            {step === 2 && "SERVICIO"}
            {step === 3 && "ESTILISTA"}
            {step === 4 && "DATOS"}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-mbRed transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 0: WELCOME */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center py-10 space-y-12 animate-step-in">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-mbRed to-red-900 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="/logo.jpg" 
              alt="Men & Boys Logo" 
              className="relative w-64 md:w-80 h-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-['Oswald'] font-bold uppercase tracking-tighter">Bienvenido a Men & Boys</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">Reserva tu espacio con los expertos en estilo masculino.</p>
          </div>

          <div className="flex flex-col w-full max-w-sm gap-4">
            <button
              onClick={() => setStep(0.1)}
              className="group relative flex items-center justify-center gap-3 bg-white text-black font-bold py-5 rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest font-['Oswald'] shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <User className="w-5 h-5" />
              Soy cliente registrado
            </button>
            <button
              onClick={() => {
                setIsRegisteredFlow(false);
                setFormData({ ...formData, name: "", surname: "", phone: "", branch: "", service: "", stylist: "" });
                setStep(1);
              }}
              className="group relative flex items-center justify-center gap-3 bg-mbRed text-white font-bold py-5 rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest font-['Oswald'] shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-mbRed/20"
            >
              <ChevronRight className="w-5 h-5" />
              No estoy registrado
            </button>
          </div>
        </div>
      )}

      {/* STEP 0.1: IDENTIFY */}
      {step === 0.1 && (
        <div className="max-w-md mx-auto space-y-8 animate-step-in py-10">
          <button onClick={prevStep} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <div className="text-center">
            <h2 className="text-4xl font-['Oswald'] font-bold mb-4 uppercase">Identifícate</h2>
            <p className="text-gray-400">Ingresa tu número de teléfono para cargar tus preferencias.</p>
          </div>

          <form onSubmit={handleIdentify} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="tel"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-xl focus:outline-none focus:border-mbRed transition-all"
                placeholder="81 1234 5678"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                autoFocus
              />
            </div>

            {searchError && (
              <div className="bg-red-500/10 text-mbRed p-4 rounded-lg text-center font-semibold text-sm animate-shake">
                {searchError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching || lookupPhone.length < 8}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest font-['Oswald'] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></span> : <Search className="w-5 h-5" />}
              {isSearching ? "Buscando..." : "Buscar mi cuenta"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 1: SUCURSAL */}
      {step === 1 && (
        <div key="step1" className="space-y-6 animate-step-in">
          <button onClick={prevStep} className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </button>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">Elige tu sucursal</h1>
            <p className="text-gray-400">Selecciona la ubicación más cercana a ti en Nuevo León.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {branches.map((branch) => {
              const branchImages = {
                carrizalejo: "/branches/carrizalejo.jpg",
                mision: "/branches/mision.jpg",
                nacional: "/branches/nacional.jpg",
              };
              const imgSrc = branchImages[branch.id];
              return (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch.id)}
                className={`relative overflow-hidden flex flex-col items-start justify-end p-5 border rounded-2xl transition-all duration-300 h-36 ${
                  formData.branch === branch.id
                    ? "border-mbRed shadow-lg shadow-mbRed/30"
                    : "border-white/10 hover:border-white/40"
                }`}
                style={imgSrc ? { backgroundImage: `url(${imgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {/* Overlay */}
                <div className={`absolute inset-0 transition-all duration-300 ${
                  formData.branch === branch.id 
                    ? "bg-gradient-to-t from-black/90 via-black/50 to-transparent" 
                    : "bg-gradient-to-t from-black/80 via-black/40 to-black/10"
                }`} />
                {/* Content */}
                <div className="relative z-10 flex items-end justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className={`w-4 h-4 ${formData.branch === branch.id ? "text-mbRed" : "text-white/70"}`} />
                      <h3 className="text-base font-bold font-['Oswald'] uppercase text-white">{branch.name}</h3>
                    </div>
                  </div>
                  {formData.branch === branch.id && (
                    <div className="bg-mbRed rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
            })}
          </div>

          {formData.branch && (
            <div className="mt-8 animate-fade-in space-y-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <p className="text-xs text-mbRed font-bold uppercase tracking-widest mb-2">Sucursal Seleccionada</p>
                <h3 className="text-2xl font-['Oswald'] font-bold uppercase mb-2">
                  {branches.find(b => b.id === formData.branch)?.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {branches.find(b => b.id === formData.branch)?.address}
                </p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branches.find(b => b.id === formData.branch)?.address || "")}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <MapPin className="w-3 h-3" /> Ver ubicación en Google Maps (Opcional)
                </a>
              </div>
              
              <button
                onClick={nextStep}
                className="w-full bg-mbRed text-white font-bold py-5 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-[0.2em] font-['Oswald'] shadow-xl shadow-mbRed/20"
              >
                Continuar reserva
              </button>
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
            <p className="text-gray-400">Despliega la categoría para ver las opciones disponibles.</p>
          </div>
          
          <div className="space-y-4">
            {Array.from(new Set(servicesCatalog.filter(s => s.branches.includes(formData.branch)).map(s => s.category))).map(category => {
              const catServices = servicesCatalog.filter(s => s.branches.includes(formData.branch) && s.category === category);
              const isExpanded = expandedCategory === category;
              
              return (
                <div key={category} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                    className={`w-full p-6 flex justify-between items-center transition-colors ${isExpanded ? "bg-mbRed/10 border-b border-mbRed/20" : "hover:bg-white/10"}`}
                  >
                    <h3 className={`text-2xl font-['Oswald'] font-bold uppercase tracking-wide ${isExpanded ? "text-mbRed" : "text-white"}`}>{category}</h3>
                    <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-90 text-mbRed" : ""}`} />
                  </button>
                  
                  <div 
                    className="transition-all duration-500 ease-in-out overflow-hidden"
                    style={{ maxHeight: isExpanded ? `${catServices.length * 150}px` : "0px", opacity: isExpanded ? 1 : 0 }}
                  >
                    <div className="p-4 grid gap-3">
                      {catServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          className={`flex flex-col text-left p-5 border rounded-xl transition-all duration-300 hover:-translate-y-1 ${
                            formData.service === service.id
                              ? "border-mbRed bg-mbRed/10 shadow-lg shadow-mbRed/20"
                              : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-start w-full mb-2">
                            <h4 className="text-lg font-bold font-['Oswald'] uppercase text-white pr-4 leading-tight">{service.name}</h4>
                            <span className="font-bold text-mbRed whitespace-nowrap bg-mbRed/10 px-3 py-1 rounded-full text-sm">{service.price}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4 text-gray-500" /> {service.durationStr}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="grid grid-cols-2 gap-4">
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

      {/* STEP 4: DATOS & CITA */}
      {step === 4 && (
        <div key="step4" className="max-w-md mx-auto space-y-6 animate-step-in">
          <button 
            onClick={() => {
              if (isRegisteredFlow) setStep(0);
              else prevStep();
            }} 
            className="flex items-center text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {isRegisteredFlow ? "Cerrar sesión" : "Volver"}
          </button>
          
          <div className="text-center mb-8">
            {isRegisteredFlow ? (
              <>
                <h2 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">¡Hola de nuevo, {formData.name}!</h2>
                <p className="text-gray-400">Hemos cargado tus preferencias. Confirma tu próxima cita.</p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-['Oswald'] font-bold mb-2 uppercase">Confirma tu cita</h2>
                <p className="text-gray-400">Ingresa tus datos para completar la reservación.</p>
              </>
            )}
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-['Oswald'] uppercase text-gray-400 text-sm">Resumen de tu selección</h4>
              {isRegisteredFlow && (
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegisteredFlow(false);
                    setStep(1);
                  }}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded uppercase tracking-tighter transition-all"
                >
                  Cambiar preferencias
                </button>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sucursal:</span>
                <span className="font-bold">{branches.find(b => b.id === formData.branch)?.name || "No seleccionada"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Servicio:</span>
                <span className="font-bold">{servicesCatalog.find(s => s.id === formData.service)?.name || "No seleccionado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estilista:</span>
                <span className="font-bold">{stylists.find(s => s.id === formData.stylist)?.name || "No seleccionado"}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isRegisteredFlow && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-mbRed transition-colors"
                    placeholder="Juan"
                    value={formData.name}
                    onChange={(e) => updateData("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-mbRed transition-colors"
                    placeholder="Pérez"
                    value={formData.surname}
                    onChange={(e) => updateData("surname", e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {!isRegisteredFlow && (
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono (Para SMS)</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-mbRed transition-colors"
                  placeholder="81 1234 5678"
                  value={formData.phone}
                  onChange={(e) => updateData("phone", e.target.value)}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fecha de tu cita</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-black/50 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-mbRed transition-colors [color-scheme:dark]"
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
                    Buscando horarios...
                  </div>
                ) : closedMessage ? (
                  <div className="bg-red-500/10 text-mbRed p-4 rounded-lg text-center font-bold">
                    {closedMessage}
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center text-gray-400">
                    No hay horarios disponibles. Intenta con otro día.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableTimes.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available || slot.past}
                        onClick={() => updateData("time", slot.time)}
                        className={`py-2 px-1 rounded-lg font-bold text-xs transition-all flex flex-col items-center justify-center ${
                          formData.time === slot.time
                            ? "bg-mbRed text-white"
                            : !slot.available || slot.past
                            ? "bg-white/5 border border-white/5 text-gray-600 cursor-not-allowed"
                            : "bg-white/5 border border-white/10 hover:border-mbRed/50 hover:bg-mbRed/10 text-gray-300"
                        }`}
                      >
                        <span>{slot.time}</span>
                        {!slot.available && !slot.past && <span className="text-[8px] uppercase opacity-60">Ocupado</span>}
                        {slot.past && <span className="text-[8px] uppercase opacity-60">Pasado</span>}
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" required value={formData.time} />
              </div>
            )}

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-lg">
              <input 
                type="checkbox" 
                id="sendReminders"
                className="w-5 h-5 accent-mbRed"
                checked={formData.sendReminders}
                onChange={(e) => updateData("sendReminders", e.target.checked)}
              />
              <label htmlFor="sendReminders" className="text-sm text-gray-300">
                Enviarme recordatorios por SMS
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.time || !formData.branch || !formData.service || !formData.stylist}
              className="w-full bg-mbRed hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-6 transition-all font-['Oswald'] uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-mbRed/20"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Procesando...</span>
              ) : (
                <>Confirmar Reservación <ChevronRight className="ml-2 w-5 h-5" /></>
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
              setStep(0);
              setFormData({ branch: "", service: "", stylist: "", name: "", surname: "", phone: "", date: "", time: "", sendReminders: true });
              setIsRegisteredFlow(false);
              setLookupPhone("");
            }}
            className="text-mbRed hover:text-red-400 font-bold transition-colors font-['Oswald'] uppercase tracking-wider"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}
