import { useState } from 'react';
import { JOURNEY, TOPICS } from '../data/curriculum';
import { useApp, type Tab } from '../state/useApp';
import { useViewIndex } from '../state/viewStore';
import { IconMenu } from './Icons';
import NavDrawer from './NavDrawer';

/** Only Learn keeps the brand centred here -- everywhere else this says where
    you are instead. A drawer tap is what got you to My Path or Resources now
    rather than a single click on an always-visible tab, so landing there and
    still reading "The Boring Way" in the one spot that never changes read as
    "back on the main page" even though the content underneath was right. */
const SECTION_TITLE: Record<Tab, string | null> = {
  learn: null,
  mypath: 'My Path',
  resources: 'Resources',
};

/** The permanent chrome, turned 90° from what it used to be: a hamburger on
    the left that opens everything else, the brand (or, off Learn, the
    section you're in) centred, and where you actually are on the right --
    same three pieces a 264px-wide side rail held, none of which needed a
    whole column's width once the nav/stats/world-list moved into NavDrawer.
    A full-width bar leaves the trail's own generated landscape the entire
    window to work with instead of losing --side-w of it to a column that
    only ever held three lines of text and one button. Learn/My Path/
    Resources, the world list, time learning and streak all still live in
    NavDrawer, opened from the hamburger here exactly as it was from the
    rail's own. */
export default function TopBar() {
  const { tab, current } = useApp();
  const viewIndex = useViewIndex();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sectionTitle = SECTION_TITLE[tab];

  /* Describes what's on screen, not where the learner left off -- see
     viewStore.ts's own comment on why the two aren't the same thing.
     current.topic (the cursor) is only the fallback, for tabs with no trail
     of their own to report a view from. */
  const topic = viewIndex === null ? current.topic : JOURNEY[viewIndex].topic;

  return (
    <header className="topbar">
      {/* Docks the home screen's own hamburger -- see HomeScreen.tsx's matching
          dock math. Opens the drawer rather than growing a list in place: this
          bar is too short to hold a nav, a stats block and a ten-world list
          all at once, so the one thing it can do is hand off to a screen that
          has room for them. */}
      <button
        type="button"
        className="topbar__menu"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        <IconMenu size={20} />
      </button>

      {/* Same box, same content, whichever text is in it -- the tagline never
          moves, so it doesn't matter that the headline swaps. Centred, not
          left-aligned the way it was in the rail, because a full-width bar
          has no "left edge next to nothing" the way a narrow column did. */}
      <div className="topbar__brand">
        {sectionTitle ?? 'The Boring Way'}
        <span>AI practice, one step at a time</span>
      </div>

      {/* Where you are, always -- the one thing worth saying without having to
          open anything. Everything else about your position (which step,
          which world's finished, how long you've spent) is a drawer tap away
          rather than crammed into this one line too. */}
      <p className="topbar__stage">
        World {topic.number} of {TOPICS.length}
        <span>{topic.title}</span>
      </p>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
