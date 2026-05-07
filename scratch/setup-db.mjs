import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
dotenv.config({ path: envPath });

async function createDatabase() {
  const client_email = process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!client_email || !private_key) {
    console.error("Faltan credenciales de Google en .env.local");
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  try {
    console.log("Creando nuevo Google Sheet...");
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: "Base de Datos Men & Boys - Sistema Reservas" },
        sheets: [
          { properties: { title: "Clientes" } },
          { properties: { title: "Citas" } },
          { properties: { title: "Vacaciones" } },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log("Sheet creado con ID:", spreadsheetId);

    // Initialize Headers
    console.log("Inicializando encabezados...");
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          {
            range: "Clientes!A1:H1",
            values: [["Teléfono", "Nombre", "Apellido", "Sucursal", "Estilista", "Service", "Day", "Time"]],
          },
          {
            range: "Citas!A1:I1",
            values: [["Timestamp", "Fecha", "Hora", "Teléfono", "Nombre", "Sucursal", "Estilista", "Servicio", "Status"]],
          },
          {
            range: "Vacaciones!A1:E1",
            values: [["StylistId", "StylistName", "StartDate", "EndDate", "Reason"]],
          },
        ],
      },
    });

    // Share with anyone with link (for the user to see it)
    console.log("Configurando permisos de acceso...");
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: "writer",
        type: "anyone",
      },
    });

    console.log("URL del documento:", spreadsheet.data.spreadsheetUrl);

    // Update .env.local
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("GOOGLE_SHEET_ID=")) {
      envContent = envContent.replace(/GOOGLE_SHEET_ID=.*/, `GOOGLE_SHEET_ID=${spreadsheetId}`);
    } else {
      envContent += `\nGOOGLE_SHEET_ID=${spreadsheetId}\n`;
    }
    fs.writeFileSync(envPath, envContent);

    console.log("¡Listo! .env.local actualizado.");
    console.log("\nIMPORTANTE: Guarda este link para acceder a tu base de datos:");
    console.log(spreadsheet.data.spreadsheetUrl);

  } catch (error) {
    console.error("Error creando la base de datos:", error.message);
  }
}

createDatabase();
