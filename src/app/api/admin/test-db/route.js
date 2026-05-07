import { NextResponse } from "next/server";
import { saveCustomer, getAllCustomers } from "@/lib/postgres";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const isSaved = await saveCustomer({
      phone: "9999999999",
      name: "Test Name",
      surname: "Test Surname",
      branch: "Test Branch",
      stylist: "Test Stylist",
      service: "Test Service",
      day: "Test Day",
      time: "Test Time",
    });

    const all = await getAllCustomers();

    return NextResponse.json({ success: true, saved: isSaved, count: all.length, all });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
