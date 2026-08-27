/* The lightbulb in the corner of a step. It opens a short list of slash commands
   that are useful right where the reader is standing.

   Non-modal on purpose: the step behind it stays readable and scrollable, so the
   reader can keep the list open while they work through the tasks. That is why
   `.hints` is `pointer-events: none` and only the two visible children take
   pointer events back — the wrapper is wider than the panel it holds.

   `StepView` gives this a `key` of the step id, so a fresh step arrives with the
   panel already closed. */
import { useEffect, useRef, useState } from 'react';
import { commandsFor } from '../data/commands';
import { IconBulb, IconClose } from './Icons';

const PANEL_ID = 'cmdhints-panel';

export default function CommandHints({
  topicNumber,
  stepId,
}: {
  topicNumber: number;
  stepId: string;
}) {
  const hints = commandsFor(topicNumber, stepId);
  const [open, setOpen] = useState(false);
  const fab = useRef<HTMLButtonElement>(null);

  /* Escape closes the panel, not the whole step. `StepView` listens on window
     too, so this has to run first and stop the rest — hence the capture phase
     and `stopImmediatePropagation`. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setOpen(false);
      fab.current?.focus();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  if (hints.length === 0) return null;

  /* The button comes first in the DOM so that Tab reaches the trigger before the
     panel it controls. `.hints` is `column-reverse`, which puts it back at the
     bottom on screen. */
  return (
    <div className="hints">
      <button
        type="button"
        ref={fab}
        className={open ? 'hints__fab hints__fab--on' : 'hints__fab'}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        aria-label={open ? 'Hide useful commands' : 'Show useful commands'}
      >
        <IconBulb size={24} />
      </button>

      {open && (
        <div
          className="hints__panel fade-in"
          id={PANEL_ID}
          role="group"
          aria-label="Useful commands"
        >
          <div className="hints__cap">
            <h2 className="hints__h">Useful here</h2>
            <button
              type="button"
              className="hints__close"
              onClick={() => {
                setOpen(false);
                fab.current?.focus();
              }}
              aria-label="Close commands"
            >
              <IconClose size={22} />
            </button>
          </div>

          <ul className="hints__list">
            {hints.map((h) => (
              <li className="hints__row" key={h.cmd}>
                <code className="hints__cmd">{h.cmd}</code>
                <span className="hints__when">{h.when}</span>
              </li>
            ))}
          </ul>

          <p className="hints__foot">Type these into Claude Code. /help lists them all.</p>
        </div>
      )}
    </div>
  );
}
