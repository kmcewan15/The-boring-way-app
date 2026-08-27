import { useSyncExternalStore } from 'react';

/* Which journey entry is currently on screen.

   The trail writes it as you scroll; the top bar reads it so it can describe what
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

/* A request to scrub the trail to a given journey entry, made from somewhere
   that isn't the trail -- the world list in the nav drawer, which can be
   opened from any tab, not just Learn. Separate from viewIndex above: that
   one is LearnScreen *reporting* where the rail already sits; this one is
   something else *asking* it to move, and the two would tangle if they
   shared a slot -- a jump request landing in the same variable the scroll
   tracker overwrites every frame would be gone before the rail ever mounted
   to read it.

   Read-and-clear rather than read-only: once LearnScreen has acted on a
   request it must not act on it again on the next re-render, and there is no
   other moment that reliably means "consumed" other than the read itself. */
let jumpTarget: number | null = null;
const jumpListeners = new Set<() => void>();

export function requestJump(index: number) {
  jumpTarget = index;
  for (const notify of jumpListeners) notify();
}

function subscribeJump(notify: () => void) {
  jumpListeners.add(notify);
  return () => {
    jumpListeners.delete(notify);
  };
}

const jumpSnapshot = () => jumpTarget;

/** LearnScreen's own hook: the pending target, or null once nothing (or
    nothing new) is waiting. Pair with `clearJump` the moment it's acted on. */
export function useJumpTarget(): number | null {
  return useSyncExternalStore(subscribeJump, jumpSnapshot, jumpSnapshot);
}

export function clearJump() {
  jumpTarget = null;
}
