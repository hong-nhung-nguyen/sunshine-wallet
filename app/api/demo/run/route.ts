import { NextResponse } from "next/server";
import { runSunshineEvent } from "@/lib/engine/run-sunshine-event";

export function GET() {
  return NextResponse.json({ success: true, data: runSunshineEvent() });
}
