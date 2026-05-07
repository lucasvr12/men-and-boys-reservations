import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch("https://men-and-boys-reservations.vercel.app/api/admin/customers");
    const text = await res.text();
    return NextResponse.json({ status: res.status, body: text });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
