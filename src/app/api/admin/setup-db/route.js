import { NextResponse } from "next/server";
import { initDB } from "@/lib/postgres";

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
