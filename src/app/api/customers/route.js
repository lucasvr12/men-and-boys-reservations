import { NextResponse } from "next/server";
import { getCustomerByPhone, saveCustomer } from "@/lib/googleSheets";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Teléfono requerido" }, { status: 400 });
  }

  const customer = await getCustomerByPhone(phone);
  
  if (!customer) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, customer });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, name, surname, branch, stylist, service, day, time } = body;

    if (!phone || !name) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    await saveCustomer({ phone, name, surname, branch, stylist, service, day, time });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in customers API:", error);
    return NextResponse.json({ error: "Error al procesar el cliente" }, { status: 500 });
  }
}
