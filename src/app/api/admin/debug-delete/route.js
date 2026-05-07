import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // We will query the appointments list first to grab a valid ID
    const resList = await fetch("https://men-and-boys-reservations.vercel.app/api/admin/appointments");
    const dataList = await resList.json();
    const app = dataList.appointments?.[0]; // Get the first appointment

    if (!app) {
      return NextResponse.json({ error: "No appointments found to test delete" });
    }

    const queryParams = new URLSearchParams({
      branch: app.branch || "",
      phone: app.phone || "",
      date: app.date || "",
      time: app.time || "",
      status: "Cancelada"
    }).toString();

    // Now issue a DELETE request to it
    const resDelete = await fetch(`https://men-and-boys-reservations.vercel.app/api/admin/appointments/${app.id}?${queryParams}`, {
      method: "DELETE"
    });

    const status = resDelete.status;
    const text = await resDelete.text();

    return NextResponse.json({ deletedApp: app, status, body: text });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
