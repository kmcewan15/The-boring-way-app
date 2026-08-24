import { useSyncExternalStore } from 'react';

/* Which journey entry is currently on screen.

   The trail writes it as you scroll; the sidebar reads it so it can describe what
   you are looking at rather than where you left off. Deliberately NOT part of
   useApp: that state belongs to the content stream, and this is a purely
   presentational concern that two sibling screens happen to share. A
   module-level store needs no provider, so the app shell stays untouched.

   Changes once per step rather than per frame, so the one component reading it
   re-renders no more often than it already does when the cards change tier. */

let viewIndex: number | null = null;
const listeners = new Set<() => void>();

export function setViewIndex(next: number | null) {
  if (next === viewIndex) return;
  viewIndex = next;
  for (const notify of listeners) notify();
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

const snapshot = () => viewIndex;

export function useViewIndex(): number | null {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
