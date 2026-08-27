import { useState } from 'react';
import { TOPICS } from '../data/curriculum';
import { useApp, type Tab } from '../state/useApp';
import { IconMenu } from './Icons';
import NavDrawer from './NavDrawer';

/** Only Learn keeps the brand up top -- everywhere else this says where you
    are instead. A drawer tap is what got you to My Path or Resources now
    rather than a single click on an always-visible tab, so landing there and
    still reading "The Boring Way" in the one spot that never changes read as
    "back on the main page" even though the content underneath was right. */
const SECTION_TITLE: Record<Tab, string | null> = {
  learn: null,
  mypath: 'My Path',
  resources: 'Resources',
};

/** The permanent rail: brand (or, off Learn, the section you're in) at the
    top, the one hamburger that opens everything else in the middle, and
    where you actually are at the bottom. Learn/My Path/Resources, the world
    list, time learning and streak all used to live here too; they moved into
    NavDrawer, a full-screen sheet rather than a column that had to be wide
    enough to hold a nav, a stats block and a world list all at once. */
export default function Sidebar() {
  const { tab, current } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sectionTitle = SECTION_TITLE[tab];

  return (
    <aside className="side">
      {/* Same box, same height, whichever text is in it -- the tagline never
          moves, so the hamburger below doesn't shift with it. Only the
          headline swaps, and only it needs to: the tagline describes the app
          as a whole, which is still true on My Path. */}
      <div className="side__brand">
        {sectionTitle ?? 'The Boring Way'}
        <span>AI practice, one step at a time</span>
      </div>

      {/* Docks the home screen's own hamburger -- see HomeScreen.tsx's matching
          dock math. Opens the drawer rather than growing a list in place: this
          rail is too narrow to hold a nav, a stats block and a ten-world list
          all at once, so the one thing it can do is hand off to a screen that
          has room for them. */}
      <button
        type="button"
        className="side__hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        <IconMenu size={22} />
      </button>

      {/* Where you are, always -- the one thing worth saying without having to
          open anything. Everything else about your position (which step,
          which world's finished, how long you've spent) is a drawer tap away
          rather than crammed into this one line too. */}
      <p className="side__stage">
        World {current.topic.number} of {TOPICS.length}
        <span>{current.topic.title}</span>
      </p>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </aside>
  );
}
