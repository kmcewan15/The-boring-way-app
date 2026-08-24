import { useEffect, useState, type CSSProperties } from 'react';
import FloatingIsland from '../art/FloatingIsland';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES, withAlpha } from '../art/landscapes';
import { TOPICS, type Topic } from '../data/curriculum';
import { quizForTopic, scoreTopicQuiz, type TopicQuizOutcome } from '../data/quiz';
import { useApp } from '../state/useApp';
import { IconCircle, IconCircleCheck, IconClose, IconVerify } from './Icons';

/* The end-of-world checkpoint. Uses the same full-stage shell as a step so that
   opening it from the trail feels the same, but the surface is the world's own
   colour rather than the step terracotta. */
export default function TopicQuiz({
  topic,
  onClose,
  onFinish,
}: {
  topic: Topic;
  onClose: () => void;
  /** Called once with the result when the learner finishes. */
  onFinish: (r: { score: number; total: number; passed: boolean }) => void;
}) {
  const { topicQuizzes } = useApp();
  const previous = topicQuizzes[topic.number];
  /* Counted from the results rather than passed in, so the number is right the
     moment this render happens -- saveTopicQuiz and setOutcome land in the same
     batch, so by the time the result screen paints this topic is already in. */
  const worldsDone = Object.values(topicQuizzes).filter((r) => r.passed).length;
  const nextTopic = TOPICS.find((t) => t.number === topic.number + 1) ?? null;
  const questions = quizForTopic(topic.number);
  const palette = LANDSCAPES[topic.biome];
  /* The page's colour actually comes from the scrim over the artwork, so hand it
     this world's tones as custom properties -- see .step::before. */
  const wash = {
    '--step-wash-a': withAlpha(palette.foreDeep, 0.5),
    '--step-wash-b': withAlpha(palette.fore, 0.32),
    '--step-wash-c': withAlpha(palette.foreDeep, 0.6),
    '--step-base': palette.fore,
  } as CSSProperties;


  const [started, setStarted] = useState(false);
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() =>
    questions.map(() => null),
  );
  const [outcome, setOutcome] = useState<TopicQuizOutcome | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const begin = () => {
    setAnswers(questions.map(() => null));
    setAt(0);
    setOutcome(null);
    setStarted(true);
  };

  const finish = () => {
    const result = scoreTopicQuiz(topic.number, answers);
    setOutcome(result);
    onFinish({ score: result.score, total: result.total, passed: result.passed });
  };

  const question = questions[at];
  const picked = answers[at];

  return (
    <div
      className={`step${topic.photo ? ' step--photo' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Topic ${topic.number} quiz`}
      style={wash}
    >
      <div className={`step__art${topic.photo ? ' step__art--photo' : ''}`} aria-hidden="true">
        <TrailScape palette={palette} />
        {/* Same photo as its world on the trail, so arriving at the checkpoint
            does not change scenery. */}
        {topic.photo && (
          <div
            className="trail__photo trail__photo--soft"
          >
            {/* Top of the picture: the quiz is the world's last entry, so it stands
                where the trail's pan has already arrived -- at the waterfall. */}
            <i style={{ backgroundImage: `url(${topic.photo})`, '--pan': 0 } as CSSProperties} />
          </div>
        )}
      </div>
      <div
        className="step__wash"
        aria-hidden="true"
        style={{ background: palette.foreDeep }}
      />

      <div className="grade grade--step" aria-hidden="true" />

      <header className="step__top">
        <button type="button" className="card__action" onClick={onClose} aria-label="Close quiz">
          <IconClose size={30} />
        </button>
        <span className="step__eyebrow">
          End of Topic {topic.number} · {topic.title}
        </span>
      </header>

      <div className="step__scroll">
        <div className={`step__inner${topic.photo ? ' photopanel' : ''}`}>
          {/* ------------------------------------------------------- intro */}
          {!started && !outcome && (
            <>
              <div className="step__kind">
                <IconVerify size={22} />
                Quiz
                <span className="step__mins">{questions.length} questions</span>
              </div>
              <h1 className="step__title">Before you move on</h1>
              <p className="step__brief">
                {questions.length} questions on what this topic covered. Nothing is gated on the
                result — if something is shaky, you get pointed back at it.
              </p>

              {previous && (
                <div className="verify">
                  <h3 className="verify__h">Last attempt</h3>
                  <p className="verify__p">
                    {previous.score} out of {previous.total}
                    {previous.passed ? ' — passed' : ' — worth another go'}
                  </p>
                </div>
              )}

              <div className="quiz__nav">
                <button
                  type="button"
                  className="step__done"
                  style={{ background: palette.sky, color: palette.foreDeep }}
                  onClick={begin}
                >
                  {previous ? 'Retake the quiz' : 'Start the quiz'}
                </button>
              </div>
            </>
          )}

          {/* ---------------------------------------------------- asking */}
          {started && !outcome && (
            <>
              <div className="quiz__head">
                <span className="quiz__count quiz__count--onDark">
                  Question {at + 1} of {questions.length}
                </span>
              </div>
              <div className="quiz__meter quiz__meter--onDark">
                <i
                  style={{
                    width: `${((at + 1) / questions.length) * 100}%`,
                    background: palette.sky,
                  }}
                />
              </div>

              <h1 className="quiz__q quiz__q--onDark">{question.question}</h1>

              <ul className="quiz__opts">
                {question.options.map((opt, i) => {
                  const isPicked = picked === i;
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        className={`qopt${isPicked ? ' qopt--picked' : ''}`}
                        aria-pressed={isPicked}
                        style={
                          isPicked
                            ? { background: palette.sky, color: palette.foreDeep }
                            : undefined
                        }
                        onClick={() =>
                          setAnswers((prev) => prev.map((v, j) => (j === at ? i : v)))
                        }
                      >
                        {isPicked ? <IconCircleCheck size={26} /> : <IconCircle size={26} />}
                        <span>{opt}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="quiz__nav">
                <button
                  type="button"
                  className="step__done step__done--ghost"
                  disabled={at === 0}
                  onClick={() => setAt(at - 1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="step__done"
                  style={{ background: palette.sky, color: palette.foreDeep }}
                  disabled={picked === null}
                  onClick={() => (at + 1 < questions.length ? setAt(at + 1) : finish())}
                >
                  {at + 1 === questions.length ? 'See result' : 'Next'}
                </button>
              </div>
            </>
          )}

          {/* ------------------------------------------- result: passed */}
          {outcome && outcome.passed && (
            <>
              <div className="step__kind">
                <IconVerify size={22} />
                Topic {topic.number} complete
              </div>
              <h1 className="step__title">{topic.title}</h1>
              <p className="step__brief">
                {outcome.score} out of {outcome.total}
                {outcome.missed.length === 0 ? '. ' : ', with one to look at again. '}
                {worldsDone === TOPICS.length
                  ? 'That is the whole trail walked.'
                  : `${worldsDone} of ${TOPICS.length} worlds behind you.`}
              </p>

              {/* The payoff for closing a world: the next one, named and drawn.
                  Ten of these are what give a five-hour curriculum chapters. */}
              {nextTopic ? (
                <div className="sealed">
                  <div className="sealed__art" aria-hidden="true">
                    <FloatingIsland biome={nextTopic.biome} />
                  </div>
                  <div className="sealed__text">
                    <span className="sealed__label">Next</span>
                    <strong className="sealed__title">
                      Topic {nextTopic.number} · {nextTopic.title}
                    </strong>
                    <p className="sealed__goal">{nextTopic.goal}</p>
                  </div>
                </div>
              ) : (
                <div className="verify">
                  <h3 className="verify__h">The end of the trail</h3>
                  <p className="verify__p">
                    Every world walked and every checkpoint passed. Nothing left but the
                    doing.
                  </p>
                </div>
              )}

              {outcome.missed.map(({ q, given }) => (
                <div className="verify" key={q.id}>
                  <h3 className="verify__h">{q.question}</h3>
                  {given !== null && (
                    <p className="qreview__given">You chose: {q.options[given]}</p>
                  )}
                  <p className="verify__p">Correct: {q.options[q.answer]}</p>
                  <p className="verify__hint">{q.why}</p>
                </div>
              ))}

              <div className="quiz__nav">
                <button type="button" className="step__done step__done--ghost" onClick={begin}>
                  Take it again
                </button>
                <button
                  type="button"
                  className="step__done"
                  style={{ background: palette.sky, color: palette.foreDeep }}
                  onClick={onClose}
                >
                  {nextTopic ? `On to Topic ${nextTopic.number}` : 'Back to the trail'}
                </button>
              </div>
            </>
          )}

          {/* ------------------------------------------- result: not yet */}
          {outcome && !outcome.passed && (
            <>
              <div className="step__kind">
                <IconVerify size={22} />
                Worth another look
              </div>
              <h1 className="step__title">
                {outcome.score} out of {outcome.total}
              </h1>
              <p className="step__brief">
                {`${outcome.missed.length} to look at again. The steps for this topic are still there if you want another pass.`}
              </p>

              {outcome.missed.map(({ q, given }) => (
                <div className="verify" key={q.id}>
                  <h3 className="verify__h">{q.question}</h3>
                  {given !== null && <p className="qreview__given">You chose: {q.options[given]}</p>}
                  <p className="verify__p">Correct: {q.options[q.answer]}</p>
                  <p className="verify__hint">{q.why}</p>
                </div>
              ))}

              <div className="quiz__nav">
                <button type="button" className="step__done step__done--ghost" onClick={begin}>
                  Take it again
                </button>
                <button
                  type="button"
                  className="step__done"
                  style={{ background: palette.sky, color: palette.foreDeep }}
                  onClick={onClose}
                >
                  Back to the trail
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
