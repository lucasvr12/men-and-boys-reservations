import { NextResponse } from "next/server";
import { getAllCustomers, initDB } from "@/lib/postgres";

export async function GET() {
  try {
    await initDB(); // Ensure table exists
    const customers = await getAllCustomers();

    // Map DB fields to the format expected by the frontend
    const formattedCustomers = customers.map(c => ({
      phone: c.phone,
      name: c.name,
      surname: c.surname || "",
      branch: c.branch || "N/A",
      stylist: c.stylist || "N/A",
      service: c.service || "N/A",
      day: c.day || "0",
      time: c.time || "N/A",
    }));

    return NextResponse.json({ customers: formattedCustomers });
  } catch (error) {
    console.error("Error fetching customers for admin:", error);
    return NextResponse.json({ error: "Error al obtener clientes de la base de datos interna" }, { status: 500 });
  }
}
