"use client";

// Lightweight event bus so inventory panel, profile, and navbar
// can stay in sync when collectibles are equipped/unequipped.
type Listener = () => void;

const listeners = new Set<Listener>();

export function onCollectiblesChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitCollectiblesChange(): void {
  for (const fn of listeners) fn();
}
