"use client";

import { useSyncExternalStore } from "react";
import {
  COUNCIL_AUTHOR_NAME,
  seedMessages,
  type MessageAuthor,
  type PartnerMessage,
} from "@/lib/data/messages";

/**
 * Message threads, stored the same way as the dispatch assignments: browser
 * local, shared between a council tab and a partner tab, seeded so a thread
 * has history before anyone types.
 */

const STORAGE_KEY = "sunshine-wallet.messages.v1";

const serverSnapshot: PartnerMessage[] = [...seedMessages];
let snapshot: PartnerMessage[] = serverSnapshot;
let restored = false;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isMessage(value: unknown): value is PartnerMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PartnerMessage>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.partyName === "string" &&
    typeof candidate.body === "string"
  );
}

function readStored(): PartnerMessage[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isMessage)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function commit(next: PartnerMessage[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // A demo that cannot persist still has to keep running.
  }
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  const stored = readStored();
  if (!stored) return;
  snapshot = stored;
  emit();
}

function subscribe(listener: () => void) {
  if (!restored) {
    restored = true;
    const stored = readStored();
    if (stored) snapshot = stored;
  }
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export interface SendMessageInput {
  partyName: string;
  author: MessageAuthor;
  body: string;
  assignmentId: string | null;
}

export function sendMessage(input: SendMessageInput) {
  const body = input.body.trim();
  if (!body) return;
  const highest = snapshot.reduce((max, message) => {
    const parsed = Number.parseInt(message.id.replace(/\D/g, ""), 10);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 0);
  commit([
    ...snapshot,
    {
      id: `MSG-${String(highest + 1).padStart(3, "0")}`,
      partyName: input.partyName,
      author: input.author,
      authorName:
        input.author === "council" ? COUNCIL_AUTHOR_NAME : input.partyName,
      body,
      sentAt: new Date().toISOString(),
      assignmentId: input.assignmentId,
    },
  ]);
}

/** Back to the seeded conversation. */
export function resetMessages() {
  commit([...seedMessages]);
}

export function useMessages(): PartnerMessage[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );
}
