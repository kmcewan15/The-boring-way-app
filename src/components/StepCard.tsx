import { memo } from 'react';
import type { Landscape } from '../art/landscapes';
import { withAlpha } from '../art/landscapes';
import type { Step } from '../data/curriculum';
import { useApp } from '../state/useApp';
import {
  IconBook,
  IconBookmark,
  IconCheckCircle,
  IconNote,
  IconTerminal,
  IconVerify,
} from './Icons';

export function StepKindIcon({ kind, size = 24 }: { kind: Step['kind']; size?: number }) {
  if (kind === 'read') return <IconBook size={size} />;
  if (kind === 'exercise') return <IconTerminal size={size} />;
  if (kind === 'verify') return <IconVerify size={size} />;
  return <IconNote size={size} />;
}

/* How far up the trail this card sits. Each depth is a *different card*, not the
   same one shrunk: a 27px title rendered at 34% is 9px of unreadable texture, so
   the further ones drop detail instead and keep what is left at a real size. */
export type CardDepth = 0 | 1 | 2;

interface Props {
  step: Step;
  index: number;
  total: number;
  /** The palette of the world this step belongs to, which colours the card. */
  palette: Landscape;
  depth?: CardDepth;
  /** Show the primary call to action (only the step you're on). */
  showCta?: boolean;
  onStart?: () => void;
}

function StepCard({
  step,
  index,
  total,
  palette,
  depth = 0,
  showCta = false,
  onStart,
}: Props) {
  const { bookmarks, toggleBookmark, isCompleted } = useApp();
  const saved = bookmarks.includes(step.id);
  const done = isCompleted(step.id);

  /* Furthest tier: a waypoint, not a card. Just enough to say "another step, and
     what kind of work it is". */
  if (depth === 2) {
    return (
      <article
        className="card card--d2"
        style={{ background: withAlpha(palette.fore, 0.9) }}
        aria-hidden="true"
      >
        <div className="card__body">
          <div className="card__meta">
            <StepKindIcon kind={step.kind} size={19} />
            <span className="card__index">
              {index + 1}/{total}
            </span>
            {done && <IconCheckCircle size={17} />}
          </div>
        </div>
      </article>
    );
  }

  /* Middle tier: keeps the title, because knowing what is coming next is the
     whole point of seeing up the trail. Drops the controls, which are unusable
     at this size anyway. */
  if (depth === 1) {
    return (
      <article
        className="card card--d1"
        style={{ background: withAlpha(palette.fore, 0.94) }}
        aria-hidden="true"
      >
        <div className="card__body">
          <div className="card__meta">
            <StepKindIcon kind={step.kind} size={21} />
            <span className="card__duration">{step.minutes} min</span>
            {done && (
              <div className="card__actions">
                <IconCheckCircle size={19} />
              </div>
            )}
          </div>

          <div className="card__index">
            Step {index + 1}/{total}
          </div>
          <h2 className="card__title">{step.title}</h2>
        </div>
      </article>
    );
  }

  return (
    <article
      className="card"
      /* `fore` is the darkest landform tone, which keeps white type well clear
         of AA on every world. */
      style={{ background: palette.fore }}
    >
      <div className="card__body">
        <div className="card__meta">
          <StepKindIcon kind={step.kind} size={26} />
          <span className="card__duration">{step.minutes} min</span>

          <div className="card__actions">
            {done && <span className="card__badge">Done</span>}
            <button
              type="button"
              className={`card__action${saved ? ' card__action--on' : ''}`}
              aria-label={saved ? 'Remove bookmark' : 'Bookmark step'}
              aria-pressed={saved}
              onClick={() => toggleBookmark(step.id)}
            >
              <IconBookmark size={28} filled={saved} />
            </button>
          </div>
        </div>

        <div className="card__index">
          Step {index + 1}/{total}
        </div>
        <h2 className="card__title">{step.title}</h2>

        {showCta && (
          <button
            type="button"
            className="card__cta"
            style={{ background: palette.sky, color: palette.foreDeep }}
            onClick={onStart}
          >
            {done ? 'Revisit step' : 'Start step'}
          </button>
        )}
      </div>
    </article>
  );
}

/* Nine cards are mounted at once and all of them re-render whenever the trail
   moves. Only the few whose tier actually changed need to. */
export default memo(StepCard);
