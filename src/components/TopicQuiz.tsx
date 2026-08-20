import { useEffect, useState } from 'react';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES } from '../art/landscapes';
import { TOTAL_TOPICS, type Topic } from '../data/curriculum';
import { quizForTopic, scoreTopicQuiz, type TopicQuizOutcome } from '../data/quiz';
import { useApp } from '../state/useApp';
import Confetti from './Confetti';
import { IconCircle, IconCircleCheck, IconClose, IconSparkles, IconVerify } from './Icons';

/* The end-of-world checkpoint. Uses the same full-stage shell as a step so that
   opening it from the trail feels the same, but the surface is the world's own
   colour rather than the step terracotta. */
export default function TopicQuiz({
  topic,
  onClose,
  onFinish,
  onNext,
}: {
  topic: Topic;
  onClose: () => void;
  /** Called once with the result when the learner finishes. */
  onFinish: (r: { score: number; total: number; passed: boolean }) => void;
  /** Opens the first step of the next topic. Absent on the last topic, where
      there is nowhere further to go. */
  onNext?: () => void;
}) {
  const { topicQuizzes } = useApp();
  const previous = topicQuizzes[topic.number];
  const questions = quizForTopic(topic.number);
  const palette = LANDSCAPES[topic.biome];

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
  /* The last quiz in the journey closes the whole course, so it gets a finish
     line rather than just a score. */
  const finished = outcome !== null && topic.number === TOTAL_TOPICS;

  return (
    <div className="step" role="dialog" aria-modal="true" aria-label={`Topic ${topic.number} quiz`}>
      <div className="step__art" aria-hidden="true">
        <TrailScape palette={palette} />
      </div>
      <div
        className="step__wash"
        aria-hidden="true"
        style={{ background: palette.foreDeep }}
      />

      {finished && <Confetti />}

      <header className="step__top">
        <button type="button" className="card__action" onClick={onClose} aria-label="Close quiz">
          <IconClose size={30} />
        </button>
        <span className="step__eyebrow">
          End of Topic {topic.number} · {topic.title}
        </span>
      </header>

      <div className="step__scroll">
        <div className="step__inner">
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

          {/* ---------------------------------------------------- result */}
          {outcome && (
            <>
              {finished && (
                <div className="finale">
                  <span className="finale__badge" aria-hidden="true">
                    <IconSparkles size={44} />
                  </span>
                  {/* Not a heading: the score below is this view's h1, and a
                      heading here would put an h2 above it. */}
                  <p className="finale__h">Congratulations</p>
                  <p className="finale__p">You are AI ready.</p>
                </div>
              )}

              <div className="step__kind">
                <IconVerify size={22} />
                {outcome.passed ? 'Passed' : 'Worth another look'}
              </div>
              <h1 className="step__title">
                {outcome.score} out of {outcome.total}
              </h1>
              <p className="step__brief">
                {outcome.missed.length === 0
                  ? 'All correct. Carry on up the trail.'
                  : `${outcome.missed.length} to look at again. The steps for this topic are still there if you want another pass.`}
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
                  onClick={onNext ?? onClose}
                >
                  {onNext ? 'Start the next topic' : 'Back to the trail'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
