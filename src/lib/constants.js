export const branches = [
  { id: "carrizalejo", name: "Carrizalejo", address: "Avenida Manuel Gómez Morín 100, San Pedro Garza García, México, 66290" },
  { id: "mision", name: "Misión del Valle", address: "Alfonso Reyes 400 Local 30, San Pedro Garza García, México, 66230" },
  { id: "nacional", name: "Carretera Nacional", address: "Carretera Nacional 900 Plaza Palmares Sur Local 12, Monterrey, México, 64987" },
];

export const stylists = [
  { id: "any", name: "Sin preferencia", branch: "all", img: "https://ui-avatars.com/api/?name=Cualquier+Estilista&background=333&color=fff", canTakeAppointments: false },
  // Misión del Valle
  { id: "m-laura", name: "Laura", branch: "mision", img: "https://ui-avatars.com/api/?name=Laura&background=111&color=cc0000", canTakeAppointments: true },
  { id: "m-edith", name: "Edith", branch: "mision", img: "https://ui-avatars.com/api/?name=Edith&background=111&color=cc0000", canTakeAppointments: true },
  { id: "m-alicia", name: "Alicia", branch: "mision", img: "https://ui-avatars.com/api/?name=Alicia&background=111&color=cc0000", canTakeAppointments: true },
  // Carrizalejo
  { id: "c-severa", name: "Severa (Vera)", branch: "carrizalejo", img: "https://ui-avatars.com/api/?name=Severa&background=111&color=cc0000", canTakeAppointments: true },
  { id: "c-elizabeth", name: "Elizabeth", branch: "carrizalejo", img: "https://ui-avatars.com/api/?name=Elizabeth&background=111&color=cc0000", canTakeAppointments: true },
  { id: "c-sandy", name: "Sandy", branch: "carrizalejo", img: "https://ui-avatars.com/api/?name=Sandy&background=111&color=cc0000", canTakeAppointments: true },
  { id: "c-carmen", name: "Carmen", branch: "carrizalejo", img: "https://ui-avatars.com/api/?name=Carmen&background=111&color=cc0000", canTakeAppointments: true },
  // Carretera Nacional
  { id: "n-cristina", name: "Cristina", branch: "nacional", img: "https://ui-avatars.com/api/?name=Cristina&background=111&color=cc0000", canTakeAppointments: true },
  { id: "n-laura", name: "Laura", branch: "nacional", img: "https://ui-avatars.com/api/?name=Laura&background=111&color=cc0000", canTakeAppointments: true },
  { id: "n-monse", name: "Monse", branch: "nacional", img: "https://ui-avatars.com/api/?name=Monse&background=111&color=cc0000", canTakeAppointments: true },
  { id: "n-vanesa-e", name: "Vanesa estilista", branch: "nacional", img: "https://ui-avatars.com/api/?name=Vanesa&background=111&color=cc0000", canTakeAppointments: true },
  { id: "n-vanesa-r", name: "Vanesa Recepcionista", branch: "nacional", img: "https://ui-avatars.com/api/?name=Vanesa&background=111&color=cc0000", canTakeAppointments: false },
];

export const servicesCatalog = [
  // HAIRSTUDIO
  { id: "ninos", name: "Niños", durationStr: "30 min", durationMins: 30, price: "$220", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "joven", name: "Joven", durationStr: "30 min", durationMins: 30, price: "$260", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "adulto", name: "Adulto", durationStr: "30 min", durationMins: 30, price: "$280", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "corte_maquina", name: "Corte Máquina", durationStr: "20 min", durationMins: 20, price: "$220", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "corte_express", name: "Corte Express", durationStr: "20 min", durationMins: 20, price: "$220", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "corte_mb", name: "Corte MB Experience", durationStr: "1 hora", durationMins: 60, price: "$450", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "camuflaje_canas", name: "Camuflaje de Canas", durationStr: "30 min", durationMins: 30, price: "$390", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "camuflaje_barba", name: "Camuflaje Barba", durationStr: "30 min", durationMins: 30, price: "$240", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "medio_camuflaje_barba", name: "Medio Camuflaje de Barba", durationStr: "30 min", durationMins: 30, price: "$240", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "combo_camuflaje", name: "Combo Camuflaje Barba y Cabellera", durationStr: "30 min", durationMins: 30, price: "$530", category: "HAIRSTUDIO", branches: ["mision", "nacional", "carrizalejo"] },

  // GROOMING
  { id: "limpieza_entre_cortes", name: "Limpieza entre cortes", durationStr: "15 min", durationMins: 15, price: "$130", category: "GROOMING", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "depilacion_espalda", name: "Depilación de Espalda", durationStr: "30 min", durationMins: 30, price: "Cotizar", category: "GROOMING", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "depilacion_rostro", name: "Depilación por área de rostro", durationStr: "30 min", durationMins: 30, price: "$130", category: "GROOMING", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "recorte_vellos_espalda", name: "Recorte vellos espalda", durationStr: "45 min", durationMins: 45, price: "Cotizar", category: "GROOMING", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "peinado", name: "Peinado", durationStr: "15 min", durationMins: 15, price: "$130", category: "GROOMING", branches: ["mision", "nacional", "carrizalejo"] },

  // AFEITADO
  { id: "traditional_shave", name: "Traditional Shave", durationStr: "30 min", durationMins: 30, price: "$260", category: "AFEITADO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "rasurado_candado", name: "Rasurado Candado", durationStr: "30 min", durationMins: 30, price: "$260", category: "AFEITADO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "rasurado_royal", name: "Rasurado Royal", durationStr: "1 hora", durationMins: 60, price: "$440", category: "AFEITADO", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "limpieza_barba", name: "Limpieza de Barba", durationStr: "10 min", durationMins: 10, price: "$130", category: "AFEITADO", branches: ["mision", "nacional", "carrizalejo"] },

  // SPA
  { id: "mascarilla_facial", name: "Mascarilla Facial", durationStr: "30 min", durationMins: 30, price: "$240", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "facial_anti_fatiga", name: "Facial Anti Fatiga", durationStr: "1 hora", durationMins: 60, price: "$400", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "facial_royal", name: "Facial Royal", durationStr: "1 hora", durationMins: 60, price: "$560", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "facial_juvenil", name: "Facial Juvenil", durationStr: "1 hora", durationMins: 60, price: "$320", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "shampoo_vigorizante", name: "Shampoo Vigorizante", durationStr: "30 min", durationMins: 30, price: "$280", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "manicure", name: "Manicure", durationStr: "30 min", durationMins: 30, price: "$290", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "pedicure", name: "Pedicure", durationStr: "1 hora", durationMins: 60, price: "$420", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "pedicure_royal", name: "Pedicure Royal", durationStr: "1 hora", durationMins: 60, price: "$570", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "masaje_pies", name: "Masaje de Pies", durationStr: "30 min", durationMins: 30, price: "$320", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "masaje_cabeza", name: "Masaje Cabeza, Cuello y Hombros", durationStr: "30 min", durationMins: 30, price: "$420", category: "SPA", branches: ["mision", "nacional", "carrizalejo"] },
  { id: "masaje_relajante", name: "Masaje Relajante", durationStr: "50 min", durationMins: 50, price: "$950", category: "SPA", branches: ["nacional", "carrizalejo"] },
  { id: "medio_masaje", name: "Medio Masaje", durationStr: "30 min", durationMins: 30, price: "$480", category: "SPA", branches: ["nacional", "carrizalejo"] },
];

export const SERVICE_DURATIONS = servicesCatalog.reduce((acc, curr) => {
  acc[curr.id] = curr.durationMins;
  return acc;
}, { "15min": 15, "30min": 30, "60min": 60 });

export const CALENDAR_IDS = {
  carrizalejo: process.env.CALENDAR_ID_CARRIZALEJO,
  mision: process.env.CALENDAR_ID_MISION,
  nacional: process.env.CALENDAR_ID_NACIONAL,
};
