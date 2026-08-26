import { useState } from 'react';
import FloatingIsland from '../art/FloatingIsland';
import { TOPICS } from '../data/curriculum';
import { CompletedSteps } from './MyPathDetails';
import { useApp } from '../state/useApp';

export default function ProgressScreen({ onOpenExplore }: { onOpenExplore: () => void }) {
  const { cursor, current, completed, totalSteps, jumpTo, setTab, topicQuizzes } = useApp();
  const { topic, steps, path } = current;
  /* The cursor can sit past the last step, which means the end-of-topic quiz. */
  const onQuiz = cursor.step >= steps.length;
  const step = steps[cursor.step];
  const quizResult = topicQuizzes[topic.number];

  const pct = Math.round((completed.length / totalSteps) * 100);

  /* A tap on an orb used to jump the cursor silently and leave you sitting in
     this modal -- nothing on screen said anything had happened, let alone
     "taken you" anywhere. Now it opens a choice instead of acting on the
     first tap, and confirming is what actually leaves: the cursor moves and
     the Learn tab takes over, which is the one thing that can make a jump
     feel like arriving somewhere rather than a number changing behind you. */
  const [pendingTopic, setPendingTopic] = useState<number | null>(null);
  const pending = pendingTopic === null ? null : TOPICS.find((t) => t.number === pendingTopic);

  const confirmGo = (n: number) => {
    jumpTo({ topic: n, step: 0 });
    setTab('learn');
    setPendingTopic(null);
  };

  return (
    <>
      <h1 className="prog__level">The {path.name} Path</h1>
      <p className="prog__trail">
        Topic {topic.number} of {TOPICS.length} · {topic.title}
      </p>

      <div className="prog__bar" role="img" aria-label={`${pct}% complete`}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="prog__barlabel">
        {completed.length} of {totalSteps} steps complete
      </p>

      <div className="prog__strip">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={[
              'prog__orb',
              t.number <= cursor.topic ? ' prog__orb--on' : '',
              t.number === pendingTopic ? ' prog__orb--picked' : '',
            ].join('')}
            title={`Topic ${t.number}: ${t.title}`}
            aria-label={`Topic ${t.number}, ${t.title}`}
            aria-pressed={t.number === pendingTopic}
            onClick={() => setPendingTopic((p) => (p === t.number ? null : t.number))}
          >
            <FloatingIsland biome={t.biome} />
          </button>
        ))}
      </div>

      {/* The choice a tap opens rather than acts on -- see the comment above
          confirmGo. Below the strip rather than pinned under the picked orb:
          the strip scrolls horizontally, and anything anchored to one orb's
          own position would be clipped by that scroll container the moment
          it needed to sit taller than the row itself. */}
      {pending && (
        <div className="orbconfirm">
          <div className="orbconfirm__art" aria-hidden="true">
            <FloatingIsland biome={pending.biome} />
          </div>
          <div className="orbconfirm__text">
            <span className="orbconfirm__label">Topic {pending.number}</span>
            <strong className="orbconfirm__title">{pending.title}</strong>
          </div>
          <button type="button" className="chip" onClick={() => setPendingTopic(null)}>
            Cancel
          </button>
          <button
            type="button"
            className="chip chip--solid"
            onClick={() => confirmGo(pending.number)}
          >
            Take me to this world
          </button>
        </div>
      )}

      <div className="prog__cols">
        <div>
          <h2 className="prog__h">Topic {topic.number}</h2>
          <p className="prog__sub">{topic.title}</p>
          <div
            className="dots"
            role="img"
            aria-label={`Topic ${topic.number} of ${TOPICS.length}`}
          >
            {TOPICS.map((t) => (
              <span key={t.id} className={`dot${t.number <= cursor.topic ? ' dot--on' : ''}`} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="prog__h">{onQuiz ? 'Quiz' : `Step ${cursor.step + 1}`}</h2>
          <p className="prog__sub">
            {onQuiz ? 'End-of-topic checkpoint' : step.title}
          </p>
          <div
            className="dots"
            role="img"
            aria-label={`Step ${cursor.step + 1} of ${steps.length}`}
          >
            {steps.map((s) => (
              <span
                key={s.id}
                className={`dot${completed.includes(s.id) ? ' dot--on' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel__h">End-of-topic quiz</h3>
        <p className="panel__p">
          {quizResult
            ? `${quizResult.score}/${quizResult.total}${quizResult.passed ? ' — passed' : ' — worth another go'}`
            : 'Not attempted yet. It sits at the end of this world, just before the next one.'}
        </p>
      </div>

      <div className="panel">
        <h3 className="panel__h">Next up</h3>
        <p className="panel__p">
          {onQuiz
            ? `End-of-topic quiz · Topic ${topic.number}, ${topic.title}`
            : `Step ${cursor.step + 1}/${steps.length} · ${step.title} · Topic ${topic.number}, ${topic.title}`}
        </p>
      </div>

      <button type="button" className="panel panel--tap" onClick={onOpenExplore}>
        <h3 className="panel__h">All topics</h3>
        <p className="panel__p">See the whole journey, topic by topic</p>
        <span className="panel__orbs" aria-hidden="true">
          {TOPICS.slice(0, 8).map((t) => (
            <span key={t.id}>
              <FloatingIsland biome={t.biome} />
            </span>
          ))}
        </span>
      </button>

      {/* The step-by-step log used to be its own destination one tap away --
          "My progress" and "Completed steps" telling the same overall story
          from two separate screens. It reads as one continuous section now:
          the summary above, the detail here. */}
      <CompletedSteps />
    </>
  );
}
