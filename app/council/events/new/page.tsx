import Link from "next/link";
import { EventCreationForm } from "@/components/council/event-creation-form";
import { councilEventCreationFixture, councilPolicy } from "@/lib/data/council";

export default function NewCouncilEventPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/council/events"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-800"
      >
        ← All events
      </Link>
      <header className="mt-3">
        <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
          Event management
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
          Create a Sunshine event
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Set a reviewable event window and flexibility target from seeded
          forecast data. Council policy {councilPolicy.version} applies from{" "}
          {councilPolicy.effectiveDate}.
        </p>
      </header>
      <EventCreationForm fixture={councilEventCreationFixture} />
    </div>
  );
}
