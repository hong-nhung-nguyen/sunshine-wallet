"use client";

import { useState } from "react";
import {
  dispatchAreas,
  dispatchHomebase,
  formatClock,
  formatDuration,
} from "@/lib/data/dispatch";
import {
  describeNote,
  statusLabels,
  type DispatchRow,
} from "@/lib/dispatch/view";
import { pinLabelClass, statusStyles } from "./dispatch-style";

const VIEW_W = 1000;
const VIEW_H = 620;

interface DispatchMapProps {
  rows: readonly DispatchRow[];
  now: number;
  activeId: string | null;
  onActivate: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/**
 * A stylised schematic of the Dapto Sunshine Cell. The outlines are drawn for
 * orientation only: suburb shapes are illustrative and prove nothing about
 * electrical topology. Hovering a pin shows what is switching, where and when.
 */
export function DispatchMap({
  rows,
  now,
  activeId,
  onActivate,
  onSelect,
}: DispatchMapProps) {
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const activeRow = rows.find((row) => row.assignment.id === activeId) ?? null;
  const areaRow = activeArea
    ? (dispatchAreas.find((area) => area.id === activeArea) ?? null)
    : null;
  const areaRows = areaRow
    ? rows.filter((row) => row.area.id === areaRow.id)
    : [];

  return (
    <div className="relative h-full min-h-[22rem] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#eef2ea]">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Dapto Sunshine Cell switching map, ${rows.filter((row) => row.switching).length} devices switching at ${formatClock(now)}`}
      >
        <rect width={VIEW_W} height={VIEW_H} fill="#eef2ea" />

        <g aria-hidden="true">
          <path
            d="M60,80 q90,-40 150,10 q40,60 -30,90 q-110,20 -120,-40 Z"
            fill="#d8e7cf"
          />
          <path
            d="M560,430 q120,-40 180,20 q30,70 -70,90 q-130,10 -110,-110 Z"
            fill="#d8e7cf"
          />
          <path
            d="M835,120 L1000,90 L1000,600 L720,600 q60,-150 65,-215 q20,-160 50,-265 Z"
            fill="#cfe1ef"
          />
          <text
            x={880}
            y={330}
            className="fill-[#5c7f9c] text-[15px] font-semibold tracking-[0.14em]"
            transform="rotate(-8 880 330)"
          >
            LAKE
          </text>
        </g>

        <g aria-hidden="true" strokeLinecap="round" fill="none">
          <path
            d="M40,250 C260,232 520,222 830,206"
            stroke="#ffffff"
            strokeWidth="16"
          />
          <path
            d="M120,440 C330,428 560,412 800,396"
            stroke="#ffffff"
            strokeWidth="12"
          />
          <path
            d="M470,20 C492,200 500,420 486,600"
            stroke="#ffffff"
            strokeWidth="12"
          />
          <path
            d="M296,16 C318,180 336,400 352,604"
            stroke="#f7d774"
            strokeWidth="14"
          />
          <path
            d="M296,16 C318,180 336,400 352,604"
            stroke="#e9c25a"
            strokeWidth="1.5"
          />
          <path
            d="M180,120 C300,150 420,120 560,150"
            stroke="#ffffff"
            strokeWidth="7"
          />
          <path
            d="M240,540 C380,500 520,520 660,470"
            stroke="#ffffff"
            strokeWidth="7"
          />
        </g>

        {dispatchAreas.map((area) => {
          const switching = rows.filter(
            (row) => row.area.id === area.id && row.switching,
          ).length;
          const highlighted = activeArea === area.id;
          return (
            <g
              key={area.id}
              onMouseEnter={() => setActiveArea(area.id)}
              onMouseLeave={() => setActiveArea(null)}
            >
              <polygon
                points={area.points}
                className={
                  highlighted
                    ? "fill-[#0f766e]/12 stroke-[#0f766e]"
                    : switching > 0
                      ? "fill-[#f2b84b]/14 stroke-[#d9a441]"
                      : "fill-[#112f35]/4 stroke-[#b8c6bd]"
                }
                strokeWidth={highlighted ? 2.5 : 1.5}
                strokeDasharray="7 6"
              />
              <text
                x={area.labelX}
                y={area.labelY}
                className="pointer-events-none fill-[#6b7a72] text-[14px] font-bold tracking-[0.16em]"
              >
                {area.name.toUpperCase()}
              </text>
              {switching > 0 && (
                <text
                  x={area.labelX}
                  y={area.labelY + 20}
                  className="pointer-events-none fill-[#8a6413] text-[13px] font-semibold"
                >
                  {switching} switching
                </text>
              )}
            </g>
          );
        })}

        <g aria-hidden="true">
          <rect
            x={dispatchHomebase.x - 16}
            y={dispatchHomebase.y - 16}
            width={32}
            height={32}
            rx={9}
            className="fill-[#112f35]"
          />
          <path
            d={`M${dispatchHomebase.x - 8},${dispatchHomebase.y + 1} L${dispatchHomebase.x},${dispatchHomebase.y - 8} L${dispatchHomebase.x + 8},${dispatchHomebase.y + 1} L${dispatchHomebase.x + 8},${dispatchHomebase.y + 8} L${dispatchHomebase.x - 8},${dispatchHomebase.y + 8} Z`}
            className="fill-[#f2b84b]"
          />
        </g>

        {rows.map((row) => {
          const { assignment, site, stop, switching } = row;
          const style = statusStyles[assignment.status];
          const active = assignment.id === activeId;
          return (
            <g
              key={assignment.id}
              role="button"
              tabIndex={0}
              aria-label={`Stop ${stop}, ${site.name} in ${row.area.name}, ${statusLabels[assignment.status]}`}
              className="cursor-pointer outline-none"
              onMouseEnter={() => onActivate(assignment.id)}
              onMouseLeave={() => onActivate(null)}
              onFocus={() => onActivate(assignment.id)}
              onBlur={() => onActivate(null)}
              onClick={() => onSelect(assignment.id)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect(assignment.id);
              }}
            >
              {switching && (
                <circle
                  cx={site.x}
                  cy={site.y}
                  r={26}
                  fill="none"
                  strokeWidth={3}
                  className={`pin-pulse ${style.ring}`}
                />
              )}
              <circle
                cx={site.x}
                cy={site.y}
                r={active ? 20 : 16}
                strokeWidth={active ? 4 : 3}
                className={style.pin}
              />
              <text
                x={site.x}
                y={site.y + 5}
                textAnchor="middle"
                className={`pointer-events-none text-[15px] font-bold ${pinLabelClass(assignment.status)}`}
              >
                {stop}
              </text>
            </g>
          );
        })}
      </svg>

      {activeRow && <PinTooltip row={activeRow} now={now} />}
      {!activeRow && areaRow && areaRows.length > 0 && (
        <div
          className="pointer-events-none absolute w-56 -translate-x-1/2 -translate-y-full rounded-xl bg-[#112f35] p-3 text-white shadow-xl"
          style={{
            left: `${(areaRow.labelX / VIEW_W) * 100}%`,
            top: `${(areaRow.labelY / VIEW_H) * 100}%`,
          }}
        >
          <p className="text-sm font-semibold">{areaRow.name}</p>
          <p className="mt-1 text-xs text-slate-300">
            {areaRows.filter((row) => row.switching).length} switching now ·{" "}
            {areaRows.length} assigned
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-[var(--muted)] shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#f2b84b]" /> Switching
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#0f766e]" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-[#b45309] bg-white" />{" "}
          Waiting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-slate-400" /> Declined
        </span>
      </div>
      <p className="pointer-events-none absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[var(--muted)] shadow-sm">
        Schematic · not a GIS layer
      </p>
    </div>
  );
}

function PinTooltip({ row, now }: Readonly<{ row: DispatchRow; now: number }>) {
  const { assignment, site, area, stop, switching } = row;
  const start = assignment.actualStart ?? assignment.plannedStart;
  const end = assignment.actualEnd ?? assignment.plannedEnd;
  const flipDown = site.y < 190;
  const flipLeft = site.x > 640;
  const note = describeNote(assignment.note);

  return (
    <div
      className="pointer-events-none absolute z-10 w-64 rounded-xl bg-[#112f35] p-3.5 text-white shadow-xl"
      style={{
        left: `${(site.x / VIEW_W) * 100}%`,
        top: `${(site.y / VIEW_H) * 100}%`,
        transform: `translate(${flipLeft ? "-92%" : "-8%"}, ${flipDown ? "24px" : "calc(-100% - 24px)"})`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {stop}. {site.name}
        </p>
        <span className="font-mono text-[11px] text-slate-400">
          {assignment.id}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-300">
        {site.deviceType} · {site.partyName}
      </p>
      {switching ? (
        <p className="mt-2.5 rounded-lg bg-[#f2b84b] px-2.5 py-1.5 text-xs font-bold text-[#112f35]">
          Switching now · {formatDuration(now - start)} elapsed
        </p>
      ) : (
        <p
          className={`mt-2.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${statusStyles[assignment.status].chip}`}
        >
          {statusLabels[assignment.status]}
          {note ? ` · ${note}` : ""}
        </p>
      )}
      <dl className="mt-3 space-y-1.5 border-t border-white/10 pt-2.5 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-400">Area</dt>
          <dd className="font-semibold">{area.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-400">Window</dt>
          <dd className="font-mono font-semibold">
            {formatClock(start)} – {formatClock(end)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-400">Shifted</dt>
          <dd className="font-mono font-semibold">
            {assignment.energyKwh} kWh
          </dd>
        </div>
      </dl>
      <p className="mt-2.5 text-[11px] leading-4 text-slate-400">
        {site.address}
      </p>
    </div>
  );
}
