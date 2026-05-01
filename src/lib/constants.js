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

export const SERVICE_DURATIONS = {
  "15min": 15,
  "30min": 30,
  "60min": 60,
};

export const CALENDAR_IDS = {
  carrizalejo: process.env.CALENDAR_ID_CARRIZALEJO,
  mision: process.env.CALENDAR_ID_MISION,
  nacional: process.env.CALENDAR_ID_NACIONAL,
};
