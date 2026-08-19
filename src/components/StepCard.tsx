import type { Landscape } from '../art/landscapes';
import { withAlpha } from '../art/landscapes';
import type { Step } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { IconBook, IconBookmark, IconNote, IconTerminal, IconVerify } from './Icons';

export function StepKindIcon({ kind, size = 24 }: { kind: Step['kind']; size?: number }) {
  if (kind === 'read') return <IconBook size={size} />;
  if (kind === 'exercise') return <IconTerminal size={size} />;
  if (kind === 'verify') return <IconVerify size={size} />;
  return <IconNote size={size} />;
}

interface Props {
  step: Step;
  index: number;
  total: number;
  /** The palette of the world this step belongs to, which colours the card. */
  palette: Landscape;
  /** Compact rendering for steps further up the trail. */
  mini?: boolean;
  /** Show the primary call to action (only the step you're on). */
  showCta?: boolean;
  onStart?: () => void;
}

export default function StepCard({
  step,
  index,
  total,
  palette,
  mini = false,
  showCta = false,
  onStart,
}: Props) {
  const { bookmarks, toggleBookmark, isCompleted } = useApp();
  const saved = bookmarks.includes(step.id);
  const done = isCompleted(step.id);

  return (
    <article
      className={`card${mini ? ' card--mini' : ''}`}
      /* `fore` is the darkest landform tone, which keeps white type well clear
         of AA on every world. Minis sit back slightly so the focused card reads
         as nearest. */
      style={{ background: mini ? withAlpha(palette.fore, 0.88) : palette.fore }}
    >
      <div className="card__body">
        <div className="card__meta">
          {/* Icon sizes stay constant: the trail tier transform-scales the card. */}
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

        {showCta && !mini && (
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
