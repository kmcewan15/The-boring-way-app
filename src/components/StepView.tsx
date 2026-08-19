import { useEffect, useState } from 'react';
import type { IslandBiome } from '../art/FloatingIsland';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES } from '../art/landscapes';
import type { Step } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { StepKindIcon } from './StepCard';
import { IconCircle, IconCircleCheck, IconClose, IconPause, IconPlay } from './Icons';

const KIND_LABEL: Record<Step['kind'], string> = {
  read: 'Read',
  exercise: 'Exercise',
  verify: 'Verify',
  note: 'Write it down',
};

/** Renders `backticked` spans as inline code. The curriculum is full of commands
    and filenames, so they need to look like commands rather than prose. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
          <code className="code" key={i}>
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function clock(total: number) {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.floor(Math.max(0, total) % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Compact timebox for the step's suggested duration. */
function Timebox({ minutes }: { minutes: number }) {
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
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? 'Pause timebox' : 'Start timebox'}
      >
        {running ? <IconPause size={22} /> : <IconPlay size={22} />}
      </button>
      <div className="timebox__meter" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
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
    <div className="step" role="dialog" aria-modal="true" aria-label={step.title}>
      <div className="step__art" aria-hidden="true">
        <TrailScape palette={LANDSCAPES[biome]} />
      </div>

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
        <Timebox minutes={step.minutes} />
      </header>

      <div className="step__scroll">
        <div className="step__inner">
          <div className="step__kind">
            <StepKindIcon kind={step.kind} size={22} />
            {KIND_LABEL[step.kind]}
            <span className="step__mins">{step.minutes} min</span>
          </div>

          <h1 className="step__title">{step.title}</h1>
          <p className="step__brief">
            <Rich text={step.brief} />
          </p>

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

      <footer className="step__foot">
        <span className="step__progress">
          {ticked.filter(Boolean).length} of {step.tasks.length} done
        </span>
        <button
          type="button"
          className="step__done"
          onClick={() => onComplete(note.trim() || undefined)}
        >
          {done ? 'Done — close' : 'Mark step complete'}
        </button>
      </footer>
    </div>
  );
}
