import { useEffect, useState } from 'react';
import { TOPICS } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { IconMenu } from './Icons';

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Collapsed to a hamburger by default so it never competes with the trail.
    Opens on click into a short readout of where things stand, and folds
    itself back away the moment a step or quiz is opened -- reading it is a
    between-steps thing, not something to leave hanging over a step.

    Deliberately just the two figures the sidebar never shows -- time spent
    and streak. "Up next" used to be a third row here, but the sidebar's
    Topic/Position pair already says that permanently and for free; repeating
    it behind a click was a second system for the same one idea. */
export default function QuickStats({ collapseOn }: { collapseOn: boolean }) {
  const { isCompleted, streak } = useApp();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (collapseOn) setExpanded(false);
  }, [collapseOn]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  /* Same sum CompletedSteps shows, recomputed here rather than lifted into
     shared state -- it's cheap, and this is the only other place that needs
     it. */
  const minutesSpent = TOPICS.reduce(
    (sum, topic) =>
      sum + topic.steps.filter((s) => isCompleted(s.id)).reduce((a, s) => a + s.minutes, 0),
    0,
  );

  return (
    <div className={`quickstats${expanded ? ' quickstats--open' : ''}`}>
      <button
        type="button"
        className="quickstats__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Hide quick stats' : 'Show quick stats'}
        aria-expanded={expanded}
      >
        <IconMenu size={22} />
      </button>

      {/* Always mounted, never just toggled in and out: growing/shrinking the
          row and fading its content are both transitions, and a transition
          needs a start state to leave from, which a conditional render never
          gives it on the way out. */}
      <div className="quickstats__grow" aria-hidden={!expanded}>
        <dl className="quickstats__panel">
          <dt>Time learning</dt>
          <dd>{minutesSpent === 0 ? 'Not started yet' : formatMinutes(minutesSpent)}</dd>
          <hr />
          <dt>Streak</dt>
          <dd>{streak === 0 ? 'Start one today' : `${streak} day${streak === 1 ? '' : 's'}`}</dd>
        </dl>
      </div>
    </div>
  );
}
