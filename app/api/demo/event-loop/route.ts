import { NextResponse } from "next/server";
import {
  runSunshineEvent,
  type EventLoopScenario,
} from "@/lib/engine/event-loop";

const scenarios: readonly EventLoopScenario[] = [
  "success",
  "low_confidence",
  "no_event",
];

export function GET(request: Request) {
  const requested =
    new URL(request.url).searchParams.get("scenario") ?? "success";
  if (!scenarios.includes(requested as EventLoopScenario))
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_SCENARIO",
          message: "Scenario must be success, low_confidence or no_event",
        },
      },
      { status: 400 },
    );
  return NextResponse.json({
    success: true,
    data: runSunshineEvent(requested as EventLoopScenario),
  });
}
