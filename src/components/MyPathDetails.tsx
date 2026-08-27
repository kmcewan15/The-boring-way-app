import { useEffect, useRef, useState } from 'react';
import { LANDSCAPES } from '../art/landscapes';
import { TOPICS } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { StepKindIcon } from './StepCard';
import { IconCheckCircle, IconChevronDown, IconPause, IconPlay } from './Icons';

/* ---------------------------------------------------------------- Completed

   No longer its own destination -- it used to be a whole modal one tap away
   from "My progress", telling a version of the same story from a colder
   start (a second big page title, "0 of 38" repeated from scratch). Now it's
   the last section on that same progress page: a summary panel matching the
   quiz/next-up panels already there, with the actual log underneath. */

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
      <div className="panel">
        <h3 className="panel__h">Completed steps</h3>
        <p className="panel__p">
          {found.length === 0
            ? `Nothing finished yet — ${totalSteps} steps ahead of you`
            : `${found.length} of ${totalSteps} steps · about ${minutes} minutes of practice`}
        </p>
      </div>

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

/** Formats a note's timestamp the same way in every section. */
function noteDate(at: number): string {
  return new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

export function Notes() {
  const { notes, addNote } = useApp();
  /** Which sections are expanded, by topic id (plus the literal 'unsorted').
      Independent toggles rather than one-open-at-a-time -- comparing notes
      across two topics at once is a reasonable thing to want. */
  const [open, setOpen] = useState<Set<string>>(new Set());
  /** One draft per section, kept outside any single note -- a half-written
      note in topic 3 shouldn't vanish because topic 7 got expanded too. */
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  /* Before topic-level grouping existed, every note saved with stepId: 'free'.
     Those predate any topic.id, so they never match one -- give them their own
     heading instead of letting them quietly vanish from the list. */
  const unsorted = notes.filter((n) => !TOPICS.some((t) => t.id === n.stepId));
  const unsortedOpen = open.has('unsorted');

  return (
    <>
      <h1 className="prog__level">My notes</h1>
      <p className="prog__trail">What you worked out along the way</p>

      <div className="notelist">
        {TOPICS.map((topic) => {
          /* topic.id is already `topic-${topic.number}` -- reusing it as the
             note's stepId means a note's home is looked up the same way its
             topic is, rather than a second copy of that convention living here. */
          const topicNotes = notes.filter((n) => n.stepId === topic.id);
          const isOpen = open.has(topic.id);
          const draft = drafts[topic.id] ?? '';

          return (
            <section className="notesection" key={topic.id}>
              <button
                type="button"
                className="notesection__head"
                aria-expanded={isOpen}
                onClick={() => toggle(topic.id)}
              >
                <span
                  className="notesection__dot"
                  style={{ background: LANDSCAPES[topic.biome].fore }}
                />
                <span className="notesection__title">
                  Topic {topic.number} · {topic.title}
                </span>
                {topicNotes.length > 0 && (
                  <span className="notesection__count">{topicNotes.length}</span>
                )}
                <IconChevronDown
                  size={20}
                  className={`notesection__chev${isOpen ? ' notesection__chev--open' : ''}`}
                />
              </button>

              <div className={`notesection__body${isOpen ? ' notesection__body--open' : ''}`}>
                <div className="notesection__inner">
                  {topicNotes.length === 0 ? (
                    <p className="empty empty--tight">
                      Add a note below and it will appear here.
                    </p>
                  ) : (
                    <div className="list">
                      {topicNotes.map((n) => (
                        <div className="list-card list-card--stack" key={n.id}>
                          <div className="list-card__s">{noteDate(n.at)}</div>
                          <div className="list-card__body">{n.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="panel notesection__compose">
                    <textarea
                      className="field"
                      value={draft}
                      onChange={(e) => setDrafts((d) => ({ ...d, [topic.id]: e.target.value }))}
                      placeholder="Something you learned, or a mistake worth remembering…"
                      rows={3}
                    />
                    <button
                      type="button"
                      className="chip chip--solid"
                      disabled={draft.trim().length === 0}
                      onClick={() => {
                        addNote({ stepId: topic.id, stepTitle: topic.title, text: draft.trim() });
                        setDrafts((d) => ({ ...d, [topic.id]: '' }));
                      }}
                    >
                      Save note
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {unsorted.length > 0 && (
          <section className="notesection">
            <button
              type="button"
              className="notesection__head"
              aria-expanded={unsortedOpen}
              onClick={() => toggle('unsorted')}
            >
              <span className="notesection__title">Unsorted</span>
              <span className="notesection__count">{unsorted.length}</span>
              <IconChevronDown
                size={20}
                className={`notesection__chev${unsortedOpen ? ' notesection__chev--open' : ''}`}
              />
            </button>

            <div className={`notesection__body${unsortedOpen ? ' notesection__body--open' : ''}`}>
              <div className="notesection__inner">
                <div className="list">
                  {unsorted.map((n) => (
                    <div className="list-card list-card--stack" key={n.id}>
                      <div className="list-card__s">
                        {n.stepTitle} · {noteDate(n.at)}
                      </div>
                      <div className="list-card__body">{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
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
        Set some time aside for today's AI practice. When it runs out, log your learnings in
        notes.
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
