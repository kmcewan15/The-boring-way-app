import { useEffect } from 'react';
import FloatingIsland from '../art/FloatingIsland';
import { PATHS, TOPICS, globalIndexOf } from '../data/curriculum';
import { useApp, type Tab } from '../state/useApp';
import { requestJump } from '../state/viewStore';
import { IconBookmark, IconChevronLeft, IconCompass, IconFlame, IconResources } from './Icons';

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

/** The Google-Drive-style drawer the top bar's hamburger opens: everything
    that used to live in the old sidebar itself, one full-screen sheet at a
    time instead of a permanent rail fighting the trail for width. Always
    mounted -- so the slide has a closed state to leave from and return to
    rather than popping in and out with no transition to animate. */
export default function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tab, setTab, cursor, current, completed, totalSteps, topicQuizzes, isCompleted, streak } =
    useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const minutesSpent = TOPICS.reduce(
    (sum, t) => sum + t.steps.filter((s) => isCompleted(s.id)).reduce((a, s) => a + s.minutes, 0),
    0,
  );

  const worldsPassed = Object.values(topicQuizzes).filter((r) => r.passed).length;

  const goTab = (id: Tab) => {
    setTab(id);
    onClose();
  };

  /* A scrub, not a save -- the same thing the course bar's own world numbers
     already do from inside the trail. Picking a world from here should show
     it to you, not silently move the place you'd come back to if you left
     without finishing it. */
  const goWorld = (topicNumber: number) => {
    requestJump(globalIndexOf(topicNumber, 0));
    setTab('learn');
    onClose();
  };

  const onQuiz = cursor.step >= current.steps.length;

  return (
    <div
      className={`drawer${open ? ' drawer--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      aria-hidden={!open}
    >
      <div className="modal__cap">
        <button type="button" className="modal__back" onClick={onClose}>
          <IconChevronLeft size={26} />
          Close
        </button>
        <span className="modal__title">The Boring Way</span>
      </div>

      <div className="modal__scroll">
        <div className="wrap">
          <nav className="side__nav" aria-label="Main">
            {TABS.map(({ id, label }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`navitem${active ? ' navitem--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => goTab(id)}
                >
                  {id === 'learn' && <IconCompass size={26} />}
                  {id === 'mypath' && <IconBookmark size={26} filled={active} />}
                  {id === 'resources' && <IconResources size={26} />}
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Where you'd land if you tapped Learn right now -- the one thing
              worth saying up front, since everything below it is "somewhere
              else you could go" rather than "where you already are". */}
          <dl className="side__foot">
            <dt>Continue</dt>
            <dd>
              Topic {current.topic.number} · {current.topic.title} —{' '}
              {onQuiz ? 'end-of-topic quiz' : `step ${cursor.step + 1} of ${current.steps.length}`}
            </dd>
          </dl>

          <dl className="side__stats">
            <dt>Time learning</dt>
            <dd>{minutesSpent === 0 ? 'Not started yet' : formatMinutes(minutesSpent)}</dd>
            <hr />
            <dt>Streak</dt>
            <dd
              className={`side__streak${streak > 0 ? ' side__streak--lit' : ''}`}
              aria-label={streak === 0 ? 'No streak yet' : `${streak} day streak`}
            >
              <IconFlame size={24} lit={streak > 0} />
              <span>{streak}</span>
            </dd>
            <hr />
            <dt>Worlds complete</dt>
            <dd>
              {worldsPassed}/{TOPICS.length}
            </dd>
          </dl>

          <h2 className="drawer__worldsh">Your worlds</h2>
          {/* Grouped by path rather than one flat 1-10 -- this is the one place
              left that says which of the three paths a world belongs to, now
              that the trail's own caption dropped the path name as something
              worth a permanent spot on every step (see the comment on .sheet
              in LearnScreen.tsx). A deliberate "how is this structured" moment
              is exactly where that belongs. */}
          {PATHS.map((path) => (
            <div key={path.number}>
              <h3 className="drawer__pathh">{path.name}</h3>
              <div className="drawer__worlds">
                {TOPICS.filter((t) => path.topicNumbers.includes(t.number)).map((t) => {
                  const done = t.steps.filter((s) => isCompleted(s.id)).length;
                  const passed = topicQuizzes[t.number]?.passed ?? false;
                  const status = passed ? 'done' : done > 0 ? 'progress' : 'new';
                  const isCurrent = t.number === cursor.topic;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={[
                        'drawer__world',
                        `drawer__world--${status}`,
                        isCurrent ? 'drawer__world--current' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => goWorld(t.number)}
                    >
                      <span className="drawer__worldart" aria-hidden="true">
                        <FloatingIsland biome={t.biome} />
                      </span>
                      <span className="drawer__worldtext">
                        <strong>
                          {t.number}. {t.title}
                        </strong>
                        <small>
                          {passed
                            ? 'Complete'
                            : done > 0
                              ? `${done}/${t.steps.length} steps`
                              : 'Not started'}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="drawer__totals">
            {completed.length}/{totalSteps} steps overall
          </p>
        </div>
      </div>
    </div>
  );
}
