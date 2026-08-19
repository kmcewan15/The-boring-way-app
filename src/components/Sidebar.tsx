import { useApp, type Tab } from '../state/useApp';
import { IconBookmark, IconCompass, IconResources } from './Icons';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'learn', label: 'Learn' },
  { id: 'mypath', label: 'My Path' },
  { id: 'resources', label: 'Resources' },
];

export default function Sidebar() {
  const { tab, setTab, current, cursor, completed, totalSteps } = useApp();
  const { topic, steps, path } = current;
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
        <dt>Current path</dt>
        <dd>{path.name}</dd>
        <hr />
        <dt>Topic {topic.number} of 10</dt>
        <dd>{topic.title}</dd>
        <hr />
        <dt>Next up</dt>
        <dd>
          {cursor.step >= steps.length
            ? 'End-of-topic quiz'
            : `Step ${cursor.step + 1} of ${steps.length}`}
        </dd>
        <hr />
        <dt>Progress</dt>
        <dd>
          {completed.length}/{totalSteps} steps · {pct}%
        </dd>
      </dl>
    </aside>
  );
}
