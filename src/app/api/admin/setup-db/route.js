import { NextResponse } from "next/server";
import { initDB } from "@/lib/postgres";
import { sql } from "@vercel/postgres";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'customers';`;
    return NextResponse.json({ success: true, message: "Database initialized", columns: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
