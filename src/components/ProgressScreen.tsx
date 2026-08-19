import FloatingIsland from '../art/FloatingIsland';
import { TOPICS } from '../data/curriculum';
import { useApp } from '../state/useApp';

export default function ProgressScreen({ onOpenExplore }: { onOpenExplore: () => void }) {
  const { cursor, current, completed, totalSteps, jumpTo, topicQuizzes } = useApp();
  const { topic, steps, path } = current;
  /* The cursor can sit past the last step, which means the end-of-topic quiz. */
  const onQuiz = cursor.step >= steps.length;
  const step = steps[cursor.step];
  const quizResult = topicQuizzes[topic.number];

  const pct = Math.round((completed.length / totalSteps) * 100);

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
            className={`prog__orb${t.number <= cursor.topic ? ' prog__orb--on' : ''}`}
            title={`Topic ${t.number}: ${t.title}`}
            aria-label={`Go to topic ${t.number}, ${t.title}`}
            onClick={() => jumpTo({ topic: t.number, step: 0 })}
          >
            <FloatingIsland biome={t.biome} />
          </button>
        ))}
      </div>

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
    </>
  );
}
