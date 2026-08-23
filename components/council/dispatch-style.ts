import type { DispatchStatus } from "@/lib/data/dispatch";

/** One palette for the pin, the log dot and the tab strip, so they agree. */
export const statusStyles: Record<
  DispatchStatus,
  { pin: string; ring: string; dot: string; chip: string; text: string }
> = {
  ongoing: {
    pin: "fill-[#f2b84b] stroke-[#112f35]",
    ring: "stroke-[#f2b84b]",
    dot: "bg-[#f2b84b] ring-[#f2b84b]/30",
    chip: "bg-amber-100 text-amber-900",
    text: "text-amber-900",
  },
  completed: {
    pin: "fill-[#0f766e] stroke-white",
    ring: "stroke-[#0f766e]",
    dot: "bg-[#0f766e] ring-[#0f766e]/25",
    chip: "bg-emerald-100 text-emerald-900",
    text: "text-emerald-900",
  },
  waiting: {
    pin: "fill-white stroke-[#b45309]",
    ring: "stroke-[#b45309]",
    dot: "bg-white ring-[#b45309]/50",
    chip: "bg-orange-100 text-orange-900",
    text: "text-orange-900",
  },
  cancelled: {
    pin: "fill-[#94a3b8] stroke-white",
    ring: "stroke-[#94a3b8]",
    dot: "bg-slate-400 ring-slate-300",
    chip: "bg-slate-200 text-slate-700",
    text: "text-slate-600",
  },
};

export function pinLabelClass(status: DispatchStatus): string {
  return status === "waiting"
    ? "fill-[#b45309]"
    : status === "ongoing"
      ? "fill-[#112f35]"
      : "fill-white";
}
