/* Resources is the page you come back to, not the page you read. Learn is
   linear and teaches; this is non-linear and reminds, so the test it has to pass
   is different: a colleague with a real task in front of them finds the one
   thing they need in seconds.

   Search is the spine. With an empty box the page reads as curated sections, in
   the order somebody in trouble needs them. With text in the box every section
   filters to its matches and the empty ones disappear, so one query can surface
   a definition, a prompt line, a command and a fix together.

   Everything is generated from the same data the course runs on, so the two
   cannot drift. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { topicByNumber } from '../data/curriculum';
import { allCommands } from '../data/commands';
import { DISCIPLINES, disciplineById } from '../data/glossary';
import { PRODUCTS } from '../data/products';
import { DATA_RULES, DATA_TEST, SYMPTOMS, TASK_FIT } from '../data/starters';
import { SUPPORT } from '../data/support';
import { useApp } from '../state/useApp';
import CopyButton from './CopyButton';
import {
  IconBook,
  IconChat,
  IconChevronDown,
  IconLink,
  IconSearch,
  IconTerminal,
  IconVerify,
  IconWarn,
} from './Icons';

/** Case-insensitive substring match over whichever fields a row cares about. */
const hit = (q: string, ...fields: string[]) =>
  q === '' || fields.some((f) => f.toLowerCase().includes(q));

/** A tablist that moves selection and focus together, as the role promises. */
function useTabs(ids: string[], initial: string) {
  const [value, setValue] = useState(initial);
  const list = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    /* Alt+Left and Alt+Right are Back and Forward on Windows and Linux, so a
       held modifier means the key is not ours to take. */
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const from = ids.indexOf(value);

    let next = -1;
    if (step !== 0) next = (from + step + ids.length) % ids.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = ids.length - 1;
    if (next < 0) return;

    e.preventDefault();
    setValue(ids[next]);
    list.current?.querySelectorAll('button')[next]?.focus();
  };

  return { value, setValue, list, onKeyDown };
}

export default function ResourcesScreen() {
  const { setTab, jumpTo } = useApp();
  const [q, setQ] = useState('');
  const [cmdsOpen, setCmdsOpen] = useState(false);
  const jobs = useTabs(
    DISCIPLINES.map((d) => d.id),
    DISCIPLINES[0].id,
  );
  const job = disciplineById(jobs.value);
  const query = q.trim().toLowerCase();
  const searching = query !== '';

  const openTopic = (topicNumber: number) => {
    jumpTo({ topic: topicNumber, step: 0 });
    setTab('learn');
  };

  /* A search should surface the long list; clearing it should put the list away
     again. Between those two moments the reader owns the toggle, so this fires
     only when `searching` flips, not on every keystroke. */
  useEffect(() => {
    setCmdsOpen(searching);
  }, [searching]);

  const found = useMemo(() => {
    const rules = DATA_RULES.filter((r) => hit(query, r.what, r.level));
    const fit = TASK_FIT.filter((f) => hit(query, f.task, f.why));
    const symptoms = SYMPTOMS.filter((s) => hit(query, s.symptom, s.cause, s.fix));
    const prompts = job.prompts.filter((p) => hit(query, p.task, p.add));
    const jobCmds = job.commands.filter((c) => hit(query, c));
    const testMatches = hit(query, DATA_TEST);
    const jobTerms = job.terms.filter((t) => hit(query, t.word, t.means));
    /* The product name and blurb are on screen, so they have to be searchable —
       a match on either shows the whole product rather than nothing. */
    const words = PRODUCTS.map((p) => {
      const whole = hit(query, p.name, p.blurb);
      return { product: p, terms: whole ? p.terms : p.terms.filter((t) => hit(query, t.word, t.means)) };
    }).filter((g) => g.terms.length > 0);
    const commands = allCommands().filter((c) =>
      hit(query, c.cmd, ...c.uses.map((u) => u.when)),
    );
    const support = SUPPORT.filter((s) => hit(query, s.handle, s.title, s.detail));

    const total =
      rules.length +
      (testMatches ? 1 : 0) +
      fit.length +
      symptoms.length +
      prompts.length +
      jobCmds.length +
      jobTerms.length +
      words.reduce((n, g) => n + g.terms.length, 0) +
      commands.length +
      support.length;

    return {
      rules,
      testMatches,
      fit,
      symptoms,
      prompts,
      jobCmds,
      jobTerms,
      words,
      commands,
      support,
      total,
    };
  }, [query, job]);

  return (
    <>
      <h1 className="res__h">Resources</h1>
      <p className="prog__trail">
        The rules, the fixes and the words — for when you have a real task and no time to reread a
        topic
      </p>

      {/* Sticky, so it stays reachable down a long page. It has to be a direct
          child here: inside a <section> it would unstick when that section
          scrolled past. */}
      <div className="res__searchbar">
        <label className="res__search">
          <IconSearch size={22} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search everything on this page"
            aria-label="Search resources"
          />
          {searching && (
            <button type="button" className="res__clear" onClick={() => setQ('')}>
              Clear
            </button>
          )}
        </label>
        <p className="res__count" role="status">
          {!searching
            ? ''
            : found.total === 0
              ? 'Nothing matches that word'
              : `${found.total} ${found.total === 1 ? 'match' : 'matches'}`}
        </p>
      </div>

      {searching && found.total === 0 && (
        <p className="empty">
          Try a shorter word, or ask in <code className="gloss__cmd">#uki-claude-support</code>.
        </p>
      )}

      {/* -------- Start here -------- */}
      {(found.rules.length > 0 || found.testMatches || found.fit.length > 0) && (
        <section>
          <h2 className="res__group">Start here</h2>

          {(found.rules.length > 0 || found.testMatches) && (
            <div className="panelcard">
              <h3 className="gloss__h">
                <IconWarn size={22} />
                What you may put in
              </h3>
              <ul className="rules">
                {found.rules.map((r) => (
                  <li className={`rules__row rules__row--${r.level}`} key={r.what}>
                    <span className="rules__tag">
                      {r.level === 'never' ? 'Never' : r.level === 'ask' ? 'Ask first' : 'Fine'}
                    </span>
                    <span>{r.what}</span>
                  </li>
                ))}
              </ul>
              {(!searching || found.testMatches) && <p className="rules__test">{DATA_TEST}</p>}
            </div>
          )}

          {found.fit.length > 0 && (
            <div className="panelcard">
              <h3 className="gloss__h">
                <IconVerify size={22} />
                Is this a good task for Claude?
              </h3>
              <div className="fit">
                {(['good', 'poor'] as const).map((side) => {
                  const rows = found.fit.filter((f) => f.fit === side);
                  if (rows.length === 0) return null;
                  return (
                    <div className={`fit__col fit__col--${side}`} key={side}>
                      <h4 className="fit__h">{side === 'good' ? 'Worth handing over' : 'Keep it yourself'}</h4>
                      {rows.map((f) => (
                        <div className="fit__row" key={f.task}>
                          <strong>{f.task}</strong>
                          <span>{f.why}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* -------- When it goes wrong -------- */}
      {found.symptoms.length > 0 && (
        <section>
          <h2 className="res__group">When it goes wrong</h2>
          <ul className="fixlist">
            {found.symptoms.map((s) => (
              <li className="fixlist__row" key={s.symptom}>
                <h3 className="fixlist__sym">{s.symptom}</h3>
                <p className="fixlist__cause">{s.cause}</p>
                <p className="fixlist__fix">{s.fix}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------- The prompt kit -------- */}
      {(found.prompts.length > 0 || found.jobTerms.length > 0 || found.jobCmds.length > 0) && (
        <section>
          <h2 className="res__group">The prompt kit</h2>
          <p className="gloss__lead">
            Pick the work you do. Every line is written to be pasted straight into Claude.
          </p>

          <div
            className="gloss__switch"
            role="tablist"
            aria-label="Choose your discipline"
            ref={jobs.list}
            onKeyDown={jobs.onKeyDown}
          >
            {DISCIPLINES.map((d) => {
              const on = d.id === jobs.value;
              return (
                <button
                  type="button"
                  role="tab"
                  id={`job-tab-${d.id}`}
                  aria-selected={on}
                  aria-controls="job-panel"
                  tabIndex={on ? 0 : -1}
                  className={on ? 'pill pill--pick pill--pick-on' : 'pill pill--pick'}
                  key={d.id}
                  onClick={() => jobs.setValue(d.id)}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          <div
            className="gloss"
            id="job-panel"
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`job-tab-${job.id}`}
          >
            <p className="gloss__blurb">{job.blurb}</p>

            {found.prompts.length > 0 && (
              <>
                <h3 className="gloss__h">
                  <IconVerify size={22} />
                  Add this to your prompt
                </h3>
                <ul className="gloss__prompts">
                  {found.prompts.map((p) => (
                    <li className="gloss__prompt" key={p.task}>
                      <span className="gloss__task">{p.task}</span>
                      <span className="gloss__add">{p.add}</span>
                      <CopyButton text={p.add} label={`the line for ${p.task}`} />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {found.jobTerms.length > 0 && (
              <>
                <h3 className="gloss__h">
                  <IconBook size={22} />
                  Words that come up
                </h3>
                <dl className="gloss__terms">
                  {found.jobTerms.map((t) => (
                    <div className="gloss__term" key={t.word}>
                      <dt>{t.word}</dt>
                      <dd>{t.means}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {found.jobCmds.length > 0 && (
              <>
                <h3 className="gloss__h">
                  <IconTerminal size={22} />
                  Commands worth your time
                </h3>
                <div className="gloss__cmds">
                  {found.jobCmds.map((c) => (
                    <code className="gloss__cmd" key={c}>
                      {c}
                    </code>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* -------- The words -------- */}
      {found.words.length > 0 && (
        <section>
          <h2 className="res__group">The words</h2>
          <p className="gloss__lead">
            The two share a vocabulary but not a behaviour. Knowing which one you are in is what
            keeps you the right side of the rules above.
          </p>
          {found.words.map((g) => (
            <div className="panelcard" key={g.product.id}>
              <h3 className="gloss__h">
                <IconBook size={22} />
                {g.product.name}
              </h3>
              <p className="gloss__blurb">{g.product.blurb}</p>
              <dl className="gloss__terms">
                {g.terms.map((t) => (
                  <div className="gloss__term" key={t.word}>
                    <dt>{t.word}</dt>
                    <dd>{t.means}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      )}

      {/* -------- Every command -------- */}
      {found.commands.length > 0 && (
        <section>
          {/* Native <details>, the same disclosure the course uses, so it is
              keyboard-reachable for free. Shut by default: it is a long list and
              nobody arrives here wanting all of it. Search forces it open. */}
          <details
            className="track track--onLight"
            open={cmdsOpen}
            onToggle={(e) => setCmdsOpen(e.currentTarget.open)}
          >
            <summary className="track__sum">
              <span className="track__label">
                Every command · {found.commands.length}
              </span>
              <IconChevronDown size={20} className="track__chev" />
            </summary>
            <div className="track__body">
              <ul className="sheetlist">
                {found.commands.map((c) => (
                  <li className="sheetlist__row" key={c.cmd}>
                    <code className="gloss__cmd">{c.cmd}</code>
                    <span className="sheetlist__uses">
                      {c.uses.map((u) => (
                        <span className="sheetlist__use" key={u.when}>
                          <span className="sheetlist__when">{u.when}</span>
                          <span className="sheetlist__topics">
                            {u.topics.map((n) => (
                              <button
                                type="button"
                                className="sheetlist__topic"
                                key={n}
                                onClick={() => openTopic(n)}
                                aria-label={`Open topic ${n}, ${topicByNumber(n).title}`}
                              >
                                {n}
                              </button>
                            ))}
                          </span>
                        </span>
                      ))}
                    </span>
                    <CopyButton text={c.cmd} label={c.cmd} />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </section>
      )}

      {/* -------- Where to ask -------- */}
      {found.support.length > 0 && (
        <section>
          <h2 className="res__group">Where to get help</h2>
          <div className="res__grid">
            {found.support.map((s) => {
              const body = (
                <>
                  {s.kind === 'slack' && <IconChat size={26} />}
                  {s.kind === 'command' && <IconTerminal size={26} />}
                  {s.kind === 'link' && <IconLink size={26} />}
                  <span>
                    {/* h3, not h4: the section heading above is an h2, and a
                        skipped level is a real problem for a screen reader. */}
                    <h3>{s.title}</h3>
                    <p>{s.detail}</p>
                    <code className="gloss__cmd">{s.handle}</code>
                  </span>
                </>
              );
              return s.href ? (
                <a
                  className="res__item"
                  key={s.handle}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {body}
                </a>
              ) : (
                <div className="res__item res__item--static" key={s.handle}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
