import { useState } from 'react';
import { JOURNEY, TOPICS, globalIndexOf } from '../data/curriculum';
import { useApp, type Tab } from '../state/useApp';
import { useViewIndex } from '../state/viewStore';
import { IconBookmark, IconCompass, IconFlame, IconMenu, IconResources } from './Icons';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'learn', label: 'Learn' },
  { id: 'mypath', label: 'My Path' },
  { id: 'resources', label: 'Resources' },
];

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function Sidebar() {
  const { tab, setTab, current, cursor, isCompleted, streak } = useApp();
  const viewIndex = useViewIndex();

  /* Starts closed. The dock animation already does the work of arriving --
     landing with the list sprung open too was one entrance on top of
     another, not a second thing the tap was asking for. */
  const [navOpen, setNavOpen] = useState(false);

  /* Same sum CompletedSteps shows, recomputed here rather than lifted into
     shared state -- it's cheap, and this is the only other place that needs
     it. Used to live behind its own floating hamburger over the stage; folded
     in here instead once the nav grew one of its own, rather than the app
     carrying two different hamburgers with two different jobs at once. */
  const minutesSpent = TOPICS.reduce(
    (sum, t) => sum + t.steps.filter((s) => isCompleted(s.id)).reduce((a, s) => a + s.minutes, 0),
    0,
  );

  /* Describe what is on screen, not where the learner left off. The two are the
     same until you scroll ahead, and when they differ the trail, the caption
     banner and this panel's own colours all follow the view -- so this followed
     the cursor and contradicted all three. Getting back to where you were is the
     "Current step" pill's job, not this panel's.

     Where the learner actually left off is shown too, but only while it differs
     from what is on screen -- see `leftOff` below.

     Falls back to the cursor on screens with no trail, where there is no view. */
  const entry = viewIndex === null ? null : JOURNEY[viewIndex];
  const topic = entry ? entry.topic : current.topic;
  const steps = topic.steps;

  const position = entry
    ? entry.kind === 'quiz'
      ? 'End-of-topic quiz'
      : `Step ${entry.indexInTopic + 1} of ${steps.length}`
    : cursor.step >= steps.length
      ? 'End-of-topic quiz'
      : `Step ${cursor.step + 1} of ${steps.length}`;

  /* Only worth saying when you have scrolled away from it: repeating your position
     back to you while you are standing on it is just noise. */
  const cursorIndex = globalIndexOf(cursor.topic, cursor.step);
  const leftOff =
    viewIndex !== null && viewIndex !== cursorIndex
      ? {
          topic: current.topic.number,
          position:
            cursor.step >= current.steps.length
              ? 'end-of-topic quiz'
              : `step ${cursor.step + 1} of ${current.steps.length}`,
        }
      : null;

  return (
    <aside className={`side${navOpen ? ' side--navopen' : ''}`}>
      <div className="side__brand">
        The Boring Way
        <span>AI practice, one step at a time</span>
      </div>

      {/* Docks the home screen's own hamburger -- see HomeScreen.tsx's matching
          dock math. Starts closed (see the `navOpen` comment above), so this
          is genuinely "reveal the nav" the first time it's pressed. */}
      <button
        type="button"
        className="side__navtoggle"
        onClick={() => setNavOpen((v) => !v)}
        aria-label={navOpen ? 'Hide navigation' : 'Show navigation'}
        aria-expanded={navOpen}
      >
        <IconMenu size={22} />
      </button>

      {/* Always mounted, never just conditionally rendered -- a transition
          needs a start state to leave from, which an unmounted nav never
          gives it on the way back open. A single wrapper inside, not the nav
          and the stats list as two direct children -- the grid row's size
          tracks exactly one child's height, and a second direct child just
          lands in the same cell as the first rather than stacking under it. */}
      <div className="side__navgrow" aria-hidden={!navOpen}>
        <div className="side__navcontent">
          <nav className="side__nav" aria-label="Main">
            {TABS.map(({ id, label }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`navitem${active ? ' navitem--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setTab(id)}
                >
                  {id === 'learn' && <IconCompass size={26} />}
                  {id === 'mypath' && <IconBookmark size={26} filled={active} />}
                  {id === 'resources' && <IconResources size={26} />}
                  {label}
                </button>
              );
            })}
          </nav>

          <dl className="side__stats">
            <dt>Time learning</dt>
            <dd>{minutesSpent === 0 ? 'Not started yet' : formatMinutes(minutesSpent)}</dd>
            <hr />
            <dt>Streak</dt>
            {/* The flame carries "lit or not", the number carries "how many" --
                between the two, "start one today" / "N days" was saying the
                same thing over again in words. */}
            <dd
              className={`side__streak${streak > 0 ? ' side__streak--lit' : ''}`}
              aria-label={streak === 0 ? 'No streak yet' : `${streak} day streak`}
            >
              <IconFlame size={24} lit={streak > 0} />
              <span>{streak}</span>
            </dd>
          </dl>

          {/* Only worth showing alongside the nav it's revealed with -- on its
              own, sitting under the sidebar permanently, it was just more
              chrome to look past to get to Learn/My Path/Resources. Skipped
              entirely rather than rendered empty: with the "where in the
              curriculum" row gone (the numbered course bar over the trail
              already says that, per world, at a glance), there are stretches
              -- reading the trail at exactly your own cursor -- where neither
              row below has anything to say. */}
          {/* Mutually exclusive, not just unlikely to overlap: leftOff only exists
              once viewIndex has scrolled away from the cursor, and entry is only
              null when there is no viewIndex at all. At most one of these two
              ever renders, so there is no second row here to divide from a
              first with an hr. */}
          {entry === null && (
            <dl className="side__foot">
              <dt>Position</dt>
              <dd>{position}</dd>
            </dl>
          )}
          {leftOff && (
            <dl className="side__foot">
              <dt>You left off</dt>
              <dd className="side__away">
                Topic {leftOff.topic}, {leftOff.position}
              </dd>
            </dl>
          )}
        </div>
      </div>
    </aside>
  );
}
