/**
 * Coordination messages between Council and a switching partner.
 *
 * One thread per partner. Messages are demo content: nothing here is sent to a
 * real retailer, and a thread is a conversation about a switch request, not a
 * channel for customer or household data.
 */

export type MessageAuthor = "council" | "partner";

export interface PartnerMessage {
  id: string;
  /** Thread key — the retailer or battery owner being talked to. */
  partyName: string;
  author: MessageAuthor;
  authorName: string;
  body: string;
  sentAt: string;
  /** The switch request under discussion, when there is one. */
  assignmentId: string | null;
}

export const COUNCIL_AUTHOR_NAME = "Wollongong City Council";

export const seedMessages: readonly PartnerMessage[] = [
  {
    id: "MSG-001",
    partyName: "Acme Energy",
    author: "council",
    authorName: COUNCIL_AUTHOR_NAME,
    body: "Morning — two hot water switches are queued for the midday window today. Both sit inside the usual controlled load hours, so no change on your side is expected.",
    sentAt: "2026-08-22T10:16:00+10:00",
    assignmentId: null,
  },
  {
    id: "MSG-002",
    partyName: "Acme Energy",
    author: "partner",
    authorName: "Acme Energy",
    body: "Both approved. SW-1041 came off early at 12:33 — tank reached target temperature, so the last 2 minutes were not needed.",
    sentAt: "2026-08-22T10:24:00+10:00",
    assignmentId: "SW-1041",
  },
  {
    id: "MSG-003",
    partyName: "Noah Williams",
    author: "council",
    authorName: COUNCIL_AUTHOR_NAME,
    body: "Your battery is the last one we need for today's target. Happy to move the start to 1:30 pm if that suits the household better.",
    sentAt: "2026-08-22T11:03:00+10:00",
    assignmentId: "SW-1044",
  },
  {
    id: "MSG-004",
    partyName: "Coastline Electric",
    author: "partner",
    authorName: "Coastline Electric",
    body: "Declining SW-1045 — there is already a switch scheduled on that meter for the same window. Send it through again after 2 pm and we can take it.",
    sentAt: "2026-08-22T10:29:00+10:00",
    assignmentId: "SW-1045",
  },
];

const sentAtFormatter = new Intl.DateTimeFormat("en-AU", {
  // Pinned so the server and the browser render the same string.
  timeZone: "Australia/Sydney",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatSentAt(iso: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "" : sentAtFormatter.format(parsed);
}
