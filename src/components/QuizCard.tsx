import { memo } from 'react';
import type { Landscape } from '../art/landscapes';
import type { Topic } from '../data/curriculum';
import { quizForTopic } from '../data/quiz';
import { useApp } from '../state/useApp';
import { IconCheckCircle, IconVerify } from './Icons';
import type { CardDepth } from './StepCard';

/* The checkpoint that closes out a world. Deliberately inverted against the step
   cards — pale fill, dark ink — so it reads as a different kind of thing on the
   trail rather than just another step. */
function QuizCard({
  topic,
  palette,
  depth = 0,
  showCta = false,
  onStart,
}: {
  topic: Topic;
  palette: Landscape;
  depth?: CardDepth;
  showCta?: boolean;
  onStart?: () => void;
}) {
  const { topicQuizzes } = useApp();
  const result = topicQuizzes[topic.number];
  const count = quizForTopic(topic.number).length;

  /* Furthest tier: a checkpoint marker. Still pale against the dark step cards,
     so you can pick out where a world ends from a long way down the trail. */
  if (depth === 2) {
    return (
      <article
        className="card card--quiz card--d2"
        style={{ background: palette.sky, color: palette.foreDeep }}
        aria-hidden="true"
      >
        <div className="card__body">
          <div className="card__meta">
            <IconVerify size={19} />
            <span className="card__index">Quiz</span>
            {result?.passed && <IconCheckCircle size={17} />}
          </div>
        </div>
      </article>
    );
  }

  if (depth === 1) {
    return (
      <article
        className="card card--quiz card--d1"
        style={{ background: palette.sky, color: palette.foreDeep }}
        aria-hidden="true"
      >
        <div className="card__body">
          <div className="card__meta">
            <IconVerify size={21} />
            <span className="card__duration">Quiz</span>
            {result && (
              <div className="card__actions">
                <span
                  className="card__badge"
                  style={{ background: palette.fore, color: '#fff' }}
                >
                  {result.score}/{result.total}
                </span>
              </div>
            )}
          </div>
          <div className="card__index">End of Topic {topic.number}</div>
          <h2 className="card__title">{topic.title}</h2>
        </div>
      </article>
    );
  }

  return (
    <article
      className="card card--quiz"
      style={{ background: palette.sky, color: palette.foreDeep }}
    >
      <div className="card__body">
        <div className="card__meta">
          <IconVerify size={26} />
          <span className="card__duration">Quiz</span>

          {result && (
            <div className="card__actions">
              <span
                className="card__badge"
                style={{ background: palette.fore, color: '#fff' }}
              >
                {result.score}/{result.total}
              </span>
            </div>
          )}
        </div>

        <div className="card__index">End of Topic {topic.number}</div>
        <h2 className="card__title">{topic.title}</h2>
        <p className="card__note">
          {count} questions on what this topic covered.
          {result
            ? result.passed
              ? ' You passed this one.'
              : ' Worth another go.'
            : ' Nothing is gated on the result.'}
        </p>

        {showCta && (
          <button
            type="button"
            className="card__cta"
            style={{ background: palette.fore, color: '#fff' }}
            onClick={onStart}
          >
            {result ? 'Retake the quiz' : 'Start the quiz'}
            {result?.passed && <IconCheckCircle size={22} />}
          </button>
        )}
      </div>
    </article>
  );
}

/* Same reasoning as StepCard: stable props, so skip the scroll-driven renders. */
export default memo(QuizCard);
