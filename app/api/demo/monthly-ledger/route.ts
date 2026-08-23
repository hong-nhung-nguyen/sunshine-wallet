import { NextResponse } from "next/server";
import { augustMonthlyLedger } from "@/lib/data/monthly-ledger";

export function GET() {
  return NextResponse.json({ success: true, data: augustMonthlyLedger });
}
