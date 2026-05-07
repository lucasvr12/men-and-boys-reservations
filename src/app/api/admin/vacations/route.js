import { getVacations, saveVacation } from "@/lib/googleSheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vacations = await getVacations();
    return NextResponse.json({ vacations });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener vacaciones" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await saveVacation(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar vacaciones" }, { status: 500 });
  }
}
