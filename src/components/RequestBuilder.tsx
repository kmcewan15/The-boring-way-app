import { useState } from 'react';
import { IconCircleCheck, IconTerminal } from './Icons';

/* The four parts, in the order they belong in a request. `prefix` is what the
   composed request says; `label` is what the reader fills in. */
const PARTS = [
  {
    key: 'result',
    label: 'Result',
    prefix: 'Result:',
    hint: 'What you want to end up with',
    placeholder: 'one row per expense, with a category on each',
  },
  {
    key: 'done',
    label: 'Done',
    prefix: 'Done when:',
    hint: 'How you will know it worked',
    placeholder: 'every row has a category and the total still matches',
  },
  {
    key: 'tools',
    label: 'Tools',
    prefix: 'You may use:',
    hint: 'What it may use and touch',
    placeholder: 'the expenses sheet in this folder',
  },
  {
    key: 'limits',
    label: 'Limits',
    prefix: 'Do not touch:',
    hint: 'What it must leave alone',
    placeholder: 'the original file — work on a copy',
  },
] as const;

type Key = (typeof PARTS)[number]['key'];

/** Fill in the four parts, get a request back. Writing it out is the lesson —
    the empty box for "Done" is the one people notice they cannot fill. */
export default function RequestBuilder() {
  const [vals, setVals] = useState<Record<Key, string>>({
    result: '',
    done: '',
    tools: '',
    limits: '',
  });
  const [copied, setCopied] = useState(false);

  const lines = PARTS.filter((p) => vals[p.key].trim()).map(
    (p) => `${p.prefix} ${vals[p.key].trim()}`,
  );
  const request = lines.join('\n');
  const missing = PARTS.filter((p) => !vals[p.key].trim());

  const copy = () => {
    void navigator.clipboard.writeText(request);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rb">
      {PARTS.map((p) => (
        <div className="rb__field" key={p.key}>
          <label className="rb__label" htmlFor={`rb-${p.key}`}>
            {p.label}
            <span className="rb__hint">{p.hint}</span>
          </label>
          <input
            id={`rb-${p.key}`}
            className="rb__in"
            type="text"
            value={vals[p.key]}
            placeholder={p.placeholder}
            onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))}
          />
        </div>
      ))}

      {request && (
        <div className="rb__out">
          <span className="rb__outLabel">
            <IconTerminal size={20} />
            Your request
          </span>
          <pre className="rb__cmd">{request}</pre>
          <div className="rb__foot">
            <p className="rb__status">
              {missing.length === 0
                ? 'All four parts in. This one is hard to get wrong.'
                : `Still missing: ${missing.map((p) => p.label).join(', ')}.`}
            </p>
            <button type="button" className="rb__copy" onClick={copy}>
              {copied ? <IconCircleCheck size={20} /> : null}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
