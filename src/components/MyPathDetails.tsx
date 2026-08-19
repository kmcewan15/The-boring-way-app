import { useEffect, useRef, useState } from 'react';
import { TOPICS } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { StepKindIcon } from './StepCard';
import { IconCheckCircle, IconPause, IconPlay } from './Icons';

/* ---------------------------------------------------------------- Completed */

export function CompletedSteps() {
  const { completed, totalSteps } = useApp();

  /* Flatten the ladder so completed ids can be resolved back to their place. */
  const found = TOPICS.flatMap((topic) =>
    topic.steps
      .filter((s) => completed.includes(s.id))
      .map((step) => ({ step, topic })),
  );

  const minutes = found.reduce((sum, f) => sum + f.step.minutes, 0);

  return (
    <>
      <h1 className="prog__level">Completed steps</h1>
      <p className="prog__trail">
        {found.length === 0
          ? `Nothing finished yet — ${totalSteps} steps ahead of you`
          : `${found.length} of ${totalSteps} steps · about ${minutes} minutes of practice`}
      </p>

      {found.length === 0 ? (
        <p className="empty">Finish a step and it will appear here.</p>
      ) : (
        <div className="list">
          {found.map(({ step, topic }) => (
            <div className="list-card" key={step.id}>
              <StepKindIcon kind={step.kind} size={26} />
              <div>
                <div className="list-card__t">{step.title}</div>
                <div className="list-card__s">
                  Topic {topic.number} · {topic.title}
                </div>
              </div>
              <span className="list-card__check">
                <IconCheckCircle size={32} />
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------- Notes */

export function Notes() {
  const { notes, addNote } = useApp();
  const [text, setText] = useState('');

  return (
    <>
      <h1 className="prog__level">My notes</h1>
      <p className="prog__trail">What you worked out along the way</p>

      <div className="panel">
        <textarea
          className="field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Something you learned, or a mistake worth remembering…"
          rows={4}
        />
        <button
          type="button"
          className="chip chip--solid"
          disabled={text.trim().length === 0}
          onClick={() => {
            addNote({ stepId: 'free', stepTitle: 'General note', text: text.trim() });
            setText('');
          }}
        >
          Save note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="empty">Your notes will collect here.</p>
      ) : (
        <div className="list">
          {notes.map((n) => (
            <div className="list-card list-card--stack" key={n.id}>
              <div className="list-card__s">
                {n.stepTitle} ·{' '}
                {new Date(n.at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                })}
              </div>
              <div className="list-card__body">{n.text}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ Timebox */

const PRESETS = [5, 10, 15, 25, 45];

export function Timebox() {
  const [minutes, setMinutes] = useState(15);
  const [left, setLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    if (!running || left === null) return;
    const id = window.setInterval(() => setLeft((v) => (v === null ? v : v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, left]);

  useEffect(() => {
    if (left !== null && left <= 0 && !finished.current) {
      finished.current = true;
      setRunning(false);
    }
  }, [left]);

  const display = left ?? minutes * 60;
  const mm = Math.floor(Math.max(0, display) / 60);
  const ss = Math.max(0, display) % 60;

  return (
    <>
      <h1 className="prog__level">Timebox</h1>
      <p className="prog__trail">
        Give a hands-on step a fixed budget. When it runs out, stop and take stock rather than
        pushing on.
      </p>

      <div className="chiprow">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            className={`chip${m === minutes ? ' chip--solid' : ''}`}
            onClick={() => {
              setMinutes(m);
              setLeft(null);
              setRunning(false);
              finished.current = false;
            }}
          >
            {m} min
          </button>
        ))}
      </div>

      <div className="dial">
        <div className={`dial__ring${running ? '' : ' dial__ring--paused'}`}>
          <span className="dial__time">
            {mm}:{String(ss).padStart(2, '0')}
          </span>
        </div>

        <button
          type="button"
          className="dial__play dial__btn"
          onClick={() => {
            if (left === null) setLeft(minutes * 60);
            finished.current = false;
            setRunning((r) => !r);
          }}
          aria-label={running ? 'Pause timebox' : 'Start timebox'}
        >
          {running ? <IconPause size={38} /> : <IconPlay size={38} />}
        </button>
      </div>
    </>
  );
}
