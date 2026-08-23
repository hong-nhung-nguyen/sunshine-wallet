"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import type { CouncilAreaRisk, CouncilAreaSummary } from "@/lib/data/council";

const riskStyles: Record<CouncilAreaRisk, string> = {
  high: "bg-rose-100 text-rose-800",
  medium: "bg-amber-100 text-amber-900",
  low: "bg-emerald-100 text-emerald-800",
};

export function AreaOverview({ areas }: { areas: CouncilAreaSummary[] }) {
  const areaSelectorRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<"all" | CouncilAreaRisk>("all");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    function closeWhenOutside(event: PointerEvent) {
      if (
        areaSelectorRef.current &&
        !areaSelectorRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowResults(false);
    }

    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const filteredAreas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const riskPriority: Record<CouncilAreaRisk, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return areas
      .filter((area) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          `${area.name} ${area.location} ${area.code}`
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesQuery && (risk === "all" || area.risk === risk);
      })
      .sort((left, right) => {
        const riskDifference =
          riskPriority[left.risk] - riskPriority[right.risk];
        if (riskDifference !== 0) return riskDifference;
        return (
          left.availableFlexEnergyKwh / left.requiredFlexEnergyKwh -
          right.availableFlexEnergyKwh / right.requiredFlexEnergyKwh
        );
      });
  }, [areas, query, risk]);

  return (
    <section
      ref={areaSelectorRef}
      aria-label="Choose council area"
      className="relative z-20 mt-6"
    >
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-48 lg:pb-2">
            <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Current demo area
            </p>
            <p className="mt-1 font-semibold text-[var(--council-ink)]">
              Dapto Sunshine Cell
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="area-search" className="sr-only">
              Search council areas
            </label>
            <input
              id="area-search"
              type="search"
              value={query}
              onFocus={() => setShowResults(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowResults(true);
              }}
              placeholder="Search suburb, cell name or code"
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--council-accent-strong,#956000)]"
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor="risk-filter" className="sr-only">
              Filter areas by risk level
            </label>
            <select
              id="risk-filter"
              value={risk}
              onFocus={() => setShowResults(true)}
              onChange={(event) => {
                setRisk(event.target.value as "all" | CouncilAreaRisk);
                setShowResults(true);
              }}
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--council-accent-strong,#956000)]"
            >
              <option value="all">All risk levels</option>
              <option value="high">High risk</option>
              <option value="medium">Medium risk</option>
              <option value="low">Low risk</option>
            </select>
          </div>
        </div>
      </Card>

      {showResults ? (
        <div className="absolute top-[calc(100%+0.5rem)] right-0 left-0 max-h-96 overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-semibold text-[var(--muted)]">
              Simulated areas · ranked by urgency
            </p>
            <button
              type="button"
              onClick={() => setShowResults(false)}
              className="min-h-11 rounded-full px-3 text-sm font-semibold text-[var(--council-ink)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Close
            </button>
          </div>
          {filteredAreas.length > 0 ? (
            <ul className="divide-y divide-[var(--border)]">
              {filteredAreas.map((area) => {
                const coverage = Math.round(
                  (area.availableFlexEnergyKwh / area.requiredFlexEnergyKwh) *
                    100,
                );
                return (
                  <li
                    key={area.id}
                    className="grid gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[var(--council-ink)]">
                          {area.location}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${riskStyles[area.risk]}`}
                        >
                          {area.risk}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {area.code} · {area.requiredFlexEnergyKwh} kWh required
                        · {area.availableFlexEnergyKwh} kWh available
                      </p>
                    </div>
                    <p
                      className={`font-mono text-sm font-semibold ${coverage < 100 ? "text-rose-700" : "text-emerald-700"}`}
                    >
                      {coverage}% covered
                    </p>
                    {area.demoAvailable ? (
                      <Link
                        href="#dapto-demo"
                        onClick={() => setShowResults(false)}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--council-ink)] px-4 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Open demo
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--surface-muted)] px-4 text-xs font-semibold text-[var(--muted)]">
                        Preview only
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-[var(--muted)]">
              No areas match your search and risk filter.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
