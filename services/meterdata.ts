import {
  INTERVALS_PER_DAY,
  chance,
  numberBetween,
  intervalLabel,
} from "./contracts";

/**
 * adapter:meterdata — interval data for the verification engine.
 *
 * Production would be a retailer feed in pilot and CDR at scale. Either way it
 * is **next-day, not live**, which is why the pipeline has an `awaiting_data`
 * state. Anything that claims to verify a load shift in real time is not
 * verifying it.
 */

export interface IntervalSeries {
  meterId: string;
  date: string;
  /** 48 half-hour readings, kWh. The switchable circuit. */
  controlledLoad: number[];
  /** 48 half-hour readings, kWh. Everything else in the home. */
  general: number[];
  labels: string[];
}

export type MeterDataGap = "NO_READ" | "ESTIMATED" | "COMMS_FAULT";

export interface IntervalFetchResult {
  date: string;
  series: Record<string, IntervalSeries>;
  /** Meters whose data did not arrive. They cannot be verified this cycle. */
  missing: { meterId: string; reason: MeterDataGap }[];
}

const GAPS: MeterDataGap[] = ["NO_READ", "ESTIMATED", "COMMS_FAULT"];

/**
 * A household whose tank was switched into the surplus window shows a midday
 * bump on the controlled-load circuit and a flat overnight trace. One that was
 * not shows the reverse.
 */
function controlledLoadTrace(
  meterId: string,
  date: string,
  shifted: boolean,
): number[] {
  return Array.from({ length: INTERVALS_PER_DAY }, (_, index) => {
    const hour = index / 2;
    const midday = hour >= 11 && hour < 14;
    const overnight = hour >= 23 || hour < 5;
    if (shifted && midday)
      return numberBetween(1.1, 1.9, 3, meterId, date, "cl-mid", index);
    if (!shifted && overnight)
      return numberBetween(0.9, 1.7, 3, meterId, date, "cl-night", index);
    return numberBetween(0, 0.08, 3, meterId, date, "cl-idle", index);
  });
}

function generalTrace(meterId: string, date: string): number[] {
  return Array.from({ length: INTERVALS_PER_DAY }, (_, index) => {
    const hour = index / 2;
    // Morning and evening peaks, quiet in the middle of the day.
    const base =
      hour >= 6 && hour < 9
        ? 0.55
        : hour >= 17 && hour < 21
          ? 0.75
          : hour >= 9 && hour < 16
            ? 0.25
            : 0.15;
    return (
      Math.round(
        (base + numberBetween(-0.06, 0.1, 3, meterId, date, "gen", index)) *
          1000,
      ) / 1000
    );
  });
}

export function fetchIntervals(
  meterIds: readonly string[],
  date: string,
  /** Meters the planner actually switched. Others get an unshifted trace. */
  switchedMeterIds: readonly string[] = meterIds,
): IntervalFetchResult {
  const switched = new Set(switchedMeterIds);
  const series: Record<string, IntervalSeries> = {};
  const missing: { meterId: string; reason: MeterDataGap }[] = [];
  const labels = Array.from({ length: INTERVALS_PER_DAY }, (_, index) =>
    intervalLabel(index),
  );

  for (const meterId of meterIds) {
    // Roughly one meter in twenty-five has no usable read next day.
    if (chance(0.04, "gap", meterId, date)) {
      missing.push({
        meterId,
        reason: GAPS[Math.abs(meterId.length + date.length) % GAPS.length],
      });
      continue;
    }
    series[meterId] = {
      meterId,
      date,
      controlledLoad: controlledLoadTrace(meterId, date, switched.has(meterId)),
      general: generalTrace(meterId, date),
      labels,
    };
  }

  return { date, series, missing };
}

export function dailyTotalKwh(series: IntervalSeries): number {
  const sum = [...series.controlledLoad, ...series.general].reduce(
    (total, value) => total + value,
    0,
  );
  return Math.round(sum * 1000) / 1000;
}

export function windowTotalKwh(
  readings: readonly number[],
  startHour: number,
  endHour: number,
): number {
  const from = Math.round(startHour * 2);
  const to = Math.round(endHour * 2);
  const sum = readings
    .slice(from, to)
    .reduce((total, value) => total + value, 0);
  return Math.round(sum * 1000) / 1000;
}
