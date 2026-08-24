import { JOURNEY, TOPICS, globalIndexOf, pathForTopic } from '../data/curriculum';
import { useApp, type Tab } from '../state/useApp';
import { useViewIndex } from '../state/viewStore';
import { IconBookmark, IconCompass, IconResources } from './Icons';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'learn', label: 'Learn' },
  { id: 'mypath', label: 'My Path' },
  { id: 'resources', label: 'Resources' },
];

export default function Sidebar() {
  const { tab, setTab, current, cursor, completed, totalSteps, topicQuizzes } = useApp();
  const viewIndex = useViewIndex();

  /* Derived here rather than added to the shared app state: the quiz results are
     already the source of truth and this is the only screen that needs the tally. */
  const topicsPassed = Object.values(topicQuizzes).filter((r) => r.passed).length;

  /* Describe what is on screen, not where the learner left off. The two are the
     same until you scroll ahead, and when they differ the trail, the caption
     banner and this panel's own colours all follow the view -- so this followed
     the cursor and contradicted all three. Getting back to where you were is the
     "Current step" pill's job, not this panel's.

     Where the learner actually left off is shown too, but only while it differs
     from what is on screen -- see `leftOff` below.

     Falls back to the cursor on screens with no trail, where there is no view. */
  const entry = viewIndex === null ? null : JOURNEY[viewIndex];
  const topic = entry ? entry.topic : current.topic;
  const path = pathForTopic(topic.number);
  const steps = topic.steps;

  const position = entry
    ? entry.kind === 'quiz'
      ? 'End-of-topic quiz'
      : `Step ${entry.indexInTopic + 1} of ${steps.length}`
    : cursor.step >= steps.length
      ? 'End-of-topic quiz'
      : `Step ${cursor.step + 1} of ${steps.length}`;

  /* Only worth saying when you have scrolled away from it: repeating your position
     back to you while you are standing on it is just noise. */
  const cursorIndex = globalIndexOf(cursor.topic, cursor.step);
  const leftOff =
    viewIndex !== null && viewIndex !== cursorIndex
      ? {
          topic: current.topic.number,
          position:
            cursor.step >= current.steps.length
              ? 'end-of-topic quiz'
              : `step ${cursor.step + 1} of ${current.steps.length}`,
        }
      : null;

  const pct = Math.round((completed.length / totalSteps) * 100);

  return (
    <aside className="side">
      <div className="side__brand">
        The Boring Way
        <span>AI practice, one step at a time</span>
      </div>

      <nav className="side__nav" aria-label="Main">
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              className={`navitem${active ? ' navitem--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              {id === 'learn' && <IconCompass size={26} />}
              {id === 'mypath' && <IconBookmark size={26} filled={active} />}
              {id === 'resources' && <IconResources size={26} />}
              {label}
            </button>
          );
        })}
      </nav>

      <dl className="side__foot">
        <dt>Path</dt>
        <dd>{path.name}</dd>
        <hr />
        <dt>
          Topic {topic.number} of {TOPICS.length}
        </dt>
        <dd>{topic.title}</dd>
        <hr />
        <dt>Position</dt>
        <dd>{position}</dd>
        <hr />
        {leftOff && (
          <>
            <dt>You left off</dt>
            <dd className="side__away">
              Topic {leftOff.topic}, {leftOff.position}
            </dd>
            <hr />
          </>
        )}
        <dt>Progress</dt>
        <dd>
          {completed.length}/{totalSteps} steps · {pct}%
        </dd>
        <hr />
        {/* Steps and worlds are counted separately on purpose. Passing a quiz is
            not a 39th step, and folding it into the step percentage would make the
            one number mean two things. */}
        <dt>Worlds complete</dt>
        <dd>
          {topicsPassed} of {TOPICS.length}
        </dd>
      </dl>
    </aside>
  );
}
