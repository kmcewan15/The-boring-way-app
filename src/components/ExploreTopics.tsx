import { useCallback, useEffect, useRef, useState } from 'react';
import FloatingIsland from '../art/FloatingIsland';
import { TOPICS, TOTAL_TOPICS } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { IconChevronDown, IconClose, IconUpDown } from './Icons';

/** Step pins zigzag up the island's trail, first step lowest. The y range is
    tuned to where the landmass sits after the framing transform in
    `.explore__island > svg`. */
function pinPosition(index: number, count: number) {
  const span = 30;
  const y = count <= 1 ? 44 : 60 - (index * span) / (count - 1);
  return { left: `${index % 2 === 0 ? 39 : 61}%`, top: `${y}%` };
}

export default function ExploreTopics({ onClose }: { onClose: () => void }) {
  const { cursor, jumpTo, isCompleted } = useApp();
  const railRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(cursor.topic - 1);

  /* Open on the topic the learner is currently working through. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTop = (cursor.topic - 1) * rail.clientHeight;
  }, [cursor.topic]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail || rail.clientHeight === 0) return;
    const next = Math.round(rail.scrollTop / rail.clientHeight);
    setPage((prev) => (prev === next ? prev : next));
  }, []);

  const backToCurrent = () => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ top: (cursor.topic - 1) * rail.clientHeight, behavior: 'smooth' });
  };

  const active = TOPICS[Math.min(Math.max(page, 0), TOTAL_TOPICS - 1)];

  return (
    <div className="explore" role="dialog" aria-modal="true" aria-label="All topics">
      <div className="explore__head">
        <span
          className="pill pill--solid"
          style={{ background: active.accent, color: active.accentInk }}
        >
          All topics
        </span>
        <button
          type="button"
          className="explore__close"
          style={{ color: active.accent }}
          onClick={onClose}
          aria-label="Close topic overview"
        >
          <IconClose size={34} />
        </button>
      </div>

      <div className="explore__counter" style={{ color: active.accent }}>
        <span>
          <b>{page + 1}</b> / {TOTAL_TOPICS}
        </span>
        <IconUpDown size={26} />
      </div>

      <div className="explore__rail" ref={railRef} onScroll={onScroll}>
        {TOPICS.map((topic) => (
          <section className="explore__page" key={topic.id}>
            <div className="explore__island">
              <FloatingIsland biome={topic.biome} />
              <div className="explore__pins">
                {topic.steps.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`steppin${isCompleted(s.id) ? ' steppin--done' : ''}`}
                    style={{
                      ...pinPosition(i, topic.steps.length),
                      background: topic.accent,
                      color: topic.accentInk,
                      animationDelay: `${i * 80}ms`,
                    }}
                    title={s.title}
                    onClick={() => {
                      jumpTo({ topic: topic.number, step: i });
                      onClose();
                    }}
                  >
                    Step {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="explore__foot"
              style={{ background: topic.accent, color: topic.accentInk }}
            >
              <button
                type="button"
                className="pill pill--solid explore__currentbtn"
                onClick={backToCurrent}
              >
                <IconChevronDown size={22} />
                Current topic
              </button>
              <p className="explore__trailno">
                <b>Topic {topic.number}</b> {topic.title}
              </p>
              <p className="explore__blurb">{topic.goal}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
