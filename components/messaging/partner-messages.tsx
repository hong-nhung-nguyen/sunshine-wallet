"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { dispatchSites, findSite, formatClock } from "@/lib/data/dispatch";
import {
  COUNCIL_AUTHOR_NAME,
  formatSentAt,
  type MessageAuthor,
} from "@/lib/data/messages";
import { sendMessage, useMessages } from "@/lib/dispatch/messages";
import { useAssignments } from "@/lib/dispatch/store";
import { statusLabels } from "@/lib/dispatch/view";

export const partyNames = Array.from(
  new Set(dispatchSites.map((site) => site.partyName)),
).sort();

interface PartnerMessagesProps {
  /** Who this console speaks as. Council writes from Council, partners reply. */
  as: MessageAuthor;
  party: string;
  onPartyChange: (party: string) => void;
}

/**
 * One thread per partner, so a question about a switch has somewhere to go
 * that is not a phone call. The sender is fixed by whichever console you are
 * in — nobody writes on the other side's behalf.
 */
export function PartnerMessages({
  as,
  party,
  onPartyChange,
}: PartnerMessagesProps) {
  const messages = useMessages();
  const assignments = useAssignments();
  const [about, setAbout] = useState("");
  const [draft, setDraft] = useState("");

  const thread = useMemo(
    () =>
      messages
        .filter((message) => message.partyName === party)
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
    [messages, party],
  );

  const partyRequests = useMemo(
    () =>
      assignments.filter(
        (assignment) => findSite(assignment.resourceId)?.partyName === party,
      ),
    [assignments, party],
  );

  function submit() {
    sendMessage({
      partyName: party,
      author: as,
      body: draft,
      assignmentId: about || null,
    });
    setDraft("");
    setAbout("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Message threads" className="flex flex-col gap-2">
        {partyNames.map((name) => {
          const latest = messages
            .filter((message) => message.partyName === name)
            .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
          const active = name === party;
          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                onPartyChange(name);
                setAbout("");
              }}
              aria-current={active ? "true" : undefined}
              className={`cursor-pointer rounded-2xl border p-3 text-left transition-colors ${active ? "border-[var(--primary)] bg-white shadow-sm" : "border-[var(--border)] bg-white/60 hover:bg-white"}`}
            >
              <p className="text-sm font-semibold">{name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                {latest ? latest.body : "No messages yet"}
              </p>
              {latest && (
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  {latest.author === "council" ? "Council" : name} ·{" "}
                  {formatSentAt(latest.sentAt)}
                </p>
              )}
            </button>
          );
        })}
      </nav>

      <Card className="flex min-h-[28rem] flex-col p-0">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-lg font-semibold">{party}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {partyRequests.length} switch request
            {partyRequests.length === 1 ? "" : "s"} with Council
          </p>
        </div>

        <ol className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {thread.map((message) => {
            const mine = message.author === as;
            return (
              <li
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${mine ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-muted)]"}`}
                >
                  <p
                    className={`text-xs font-semibold ${mine ? "text-emerald-100" : "text-[var(--muted)]"}`}
                  >
                    {message.authorName} · {formatSentAt(message.sentAt)}
                  </p>
                  {message.assignmentId && (
                    <p
                      className={`mt-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${mine ? "bg-white/15 text-white" : "bg-white text-[var(--muted)]"}`}
                    >
                      About {message.assignmentId}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm leading-6">{message.body}</p>
                </div>
              </li>
            );
          })}
          {thread.length === 0 && (
            <li className="grid h-full place-items-center text-sm text-[var(--muted)]">
              No messages with {party} yet.
            </li>
          )}
        </ol>

        <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[var(--muted)]">
              Writing as{" "}
              <b className="font-semibold text-[var(--foreground)]">
                {as === "council" ? COUNCIL_AUTHOR_NAME : party}
              </b>
            </span>
            <label className="ml-auto text-xs font-semibold text-[var(--muted)]">
              About
              <select
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                className="ml-2 rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-xs font-normal text-[var(--foreground)]"
              >
                <option value="">No specific request</option>
                {partyRequests.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.id} · {formatClock(assignment.plannedStart)} ·{" "}
                    {statusLabels[assignment.status]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <label className="flex-1 text-xs font-semibold text-[var(--muted)]">
              <span className="sr-only">Message to {party}</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey) return;
                  event.preventDefault();
                  submit();
                }}
                rows={2}
                placeholder={`Message ${party}…`}
                className="mt-1 block w-full resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-normal text-[var(--foreground)]"
              />
            </label>
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className="min-h-11 cursor-pointer rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            Enter sends · Shift+Enter for a new line. Messages stay in this
            browser and reach no real retailer.
          </p>
        </div>
      </Card>
    </div>
  );
}
