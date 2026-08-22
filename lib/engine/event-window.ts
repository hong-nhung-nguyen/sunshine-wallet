import type { TimeWindow } from "@/lib/types";

export function isValidTimeWindow(window: TimeWindow): boolean {
  return Date.parse(window.start) < Date.parse(window.end);
}
