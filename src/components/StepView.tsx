import { useEffect, useState, type CSSProperties } from 'react';
import type { IslandBiome } from '../art/FloatingIsland';
import TrailScape from '../art/TrailScape';
import type { Landscape } from '../art/landscapes';
import { LANDSCAPES, withAlpha } from '../art/landscapes';
import type { Step } from '../data/curriculum';
import { topicByNumber } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { StepKindIcon } from './StepCard';
import Rich from './Rich';
import StepBody from './StepBody';
import CommandHints from './CommandHints';
import { IconCircle, IconCircleCheck, IconClose, IconPause, IconPlay } from './Icons';

const KIND_LABEL: Record<Step['kind'], string> = {
  read: 'Read',
  exercise: 'Exercise',
  verify: 'Verify',
  note: 'Write it down',
};

function clock(total: number) {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.floor(Math.max(0, total) % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Compact timebox for the step's suggested duration. */
function Timebox({ minutes, palette }: { minutes: number; palette: Landscape }) {
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(minutes * 60);
    setRunning(false);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((v) => (v <= 0 ? 0 : v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left === 0) setRunning(false);
  }, [left]);

  const pct = 100 - (left / (minutes * 60)) * 100;

  return (
    <div className="timebox">
      <button
        type="button"
        className="timebox__btn"
        style={{ background: palette.sky, color: palette.foreDeep }}
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? 'Pause timebox' : 'Start timebox'}
      >
        {running ? <IconPause size={22} /> : <IconPlay size={22} />}
      </button>
      <div className="timebox__meter" aria-hidden="true">
        <i style={{ width: `${pct}%`, background: palette.sky }} />
      </div>
      <span className="timebox__time">{clock(left)}</span>
    </div>
  );
}

export default function StepView({
  step,
  index,
  total,
  topicNumber,
  biome,
  onClose,
  onComplete,
}: {
  step: Step;
  index: number;
  total: number;
  topicNumber: number;
  biome: IslandBiome;
  onClose: () => void;
  onComplete: (noteText?: string) => void;
}) {
  const { isCompleted } = useApp();
  const done = isCompleted(step.id);

  const palette = LANDSCAPES[biome];
  const photo = topicByNumber(topicNumber).photo;

  /* Show the same stretch of path this step occupies on the trail, so opening a
     step feels like stopping where you were standing rather than cutting to a
     different view of the world. 0 at the first step, 1 at the last. */
  const pan = 1 - index / Math.max(1, total);
  /* The page's colour actually comes from the scrim over the artwork, so hand it
     this world's tones as custom properties -- see .step::before. */
  const wash = {
    '--step-wash-a': withAlpha(palette.foreDeep, 0.5),
    '--step-wash-b': withAlpha(palette.fore, 0.32),
    '--step-wash-c': withAlpha(palette.foreDeep, 0.6),
    '--step-base': palette.fore,
  } as CSSProperties;

  const [ticked, setTicked] = useState<boolean[]>(() => step.tasks.map(() => false));
  const [note, setNote] = useState('');

  useEffect(() => {
    setTicked(step.tasks.map(() => false));
    setNote('');
  }, [step.id, step.tasks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`step${photo ? ' step--photo' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      style={wash}
    >
      <div className={`step__art${photo ? ' step__art--photo' : ''}`} aria-hidden="true">
        <TrailScape palette={palette} />
        {photo && (
          <div
            className="trail__photo trail__photo--soft"
          >
            <i style={{ backgroundImage: `url(${photo})`, '--pan': pan } as CSSProperties} />
          </div>
        )}
      </div>

      <div className="grade grade--step" aria-hidden="true" />

      <header className="step__top">
        <button
          type="button"
          className="card__action"
          onClick={onClose}
          aria-label="Close step"
        >
          <IconClose size={30} />
        </button>
        <span className="step__eyebrow">
          Topic {topicNumber} · Step {index + 1} of {total}
        </span>
        <Timebox minutes={step.minutes} palette={palette} />
      </header>

      <div className="step__scroll">
        <div className={`step__inner${photo ? ' photopanel' : ''}`}>
          <div className="step__kind">
            <StepKindIcon kind={step.kind} size={22} />
            {KIND_LABEL[step.kind]}
            <span className="step__mins">{step.minutes} min</span>
          </div>

          <h1 className="step__title">{step.title}</h1>
          <p className="step__brief">
            <Rich text={step.brief} />
          </p>

          {step.body && step.body.length > 0 && <StepBody blocks={step.body} />}

          {/* A step can be pure reading, with nothing to tick off. */}
          {step.tasks.length > 0 && (
            <>
              <h2 className="step__h">What you'll do</h2>
              <ul className="tasks">
                {step.tasks.map((t, i) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={`task${ticked[i] ? ' task--done' : ''}`}
                      aria-pressed={ticked[i]}
                      onClick={() =>
                        setTicked((prev) => prev.map((v, j) => (j === i ? !v : v)))
                      }
                    >
                      {ticked[i] ? <IconCircleCheck size={24} /> : <IconCircle size={24} />}
                      <span>
                        <Rich text={t} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step.verify && (
            <div className="verify">
              <h3 className="verify__h">How you'll know it worked</h3>
              <p className="verify__p">
                <Rich text={step.verify} />
              </p>
            </div>
          )}

          {step.kind === 'note' && (
            <div className="verify">
              <h3 className="verify__h">Your note</h3>
              <textarea
                className="field field--onDark"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did you work out?"
              />
              <p className="verify__hint">Saved to My notes when you complete this step.</p>
            </div>
          )}
        </div>
      </div>

      <CommandHints key={step.id} topicNumber={topicNumber} stepId={step.id} />

      {/* The footer colour is set inline so it tracks the current world, which a
          stylesheet rule cannot do -- see the fixed fallback in global.css. */}
      <footer className="step__foot" style={{ background: withAlpha(palette.foreDeep, 0.62) }}>
        {/* Omitted entirely, not left empty: an empty flex item still takes the
            footer gap and pushes the button off centre. */}
        {step.tasks.length > 0 && (
          <span className="step__progress">
            {ticked.filter(Boolean).length} of {step.tasks.length} done
          </span>
        )}
        <button
          type="button"
          className="step__done"
          style={{ background: palette.sky, color: palette.foreDeep }}
          onClick={() => onComplete(note.trim() || undefined)}
        >
          {done ? 'Next step' : 'Mark complete and continue'}
        </button>
      </footer>
    </div>
  );
}
