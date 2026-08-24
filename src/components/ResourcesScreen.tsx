import type { ReactNode } from 'react';
import { IconBook, IconNote, IconResources, IconTerminal, IconVerify } from './Icons';

/* Reference material to sit alongside the topics.

   Every item carries an optional `href`. Filling one in is the whole job of
   publishing a resource -- an item with a link renders as a real anchor that
   opens in a new tab, and an item without one is drawn as visibly not-yet-live
   rather than as a button that silently does nothing when clicked. */
type Item = {
  name: string;
  sub: string;
  meta?: string;
  icon: 'book' | 'terminal' | 'verify' | 'note';
  /** Point this at your team's own doc. Absolute URL, or an app-relative path. */
  href?: string;
};

const GROUPS: Array<{ title: string; items: Item[] }> = [
  {
    title: 'Getting set up',
    items: [
      { name: 'Install & authenticate', sub: 'Step-by-step for macOS and Windows', meta: '5 min', icon: 'terminal' },
      { name: 'Which model, and when', sub: 'Picking sensibly for the task', meta: '6 min', icon: 'book' },
      { name: 'Working in your IDE', sub: 'VS Code and JetBrains extensions', meta: '4 min', icon: 'terminal' },
    ],
  },
  {
    title: 'Cheatsheets',
    items: [
      { name: 'Slash commands', sub: 'The ones worth remembering', meta: '2 min', icon: 'terminal' },
      { name: 'Prompt patterns', sub: 'Result, done, tools, limits', meta: '3 min', icon: 'book' },
      { name: 'The verify loop', sub: 'Baseline → diff → verify → commit', meta: '2 min', icon: 'verify' },
    ],
  },
  {
    title: 'Going further',
    items: [
      { name: 'Writing a good CLAUDE.md', sub: 'Worked examples from our repos', meta: '8 min', icon: 'book' },
      { name: 'Anatomy of a skill', sub: 'Structure, naming, description', meta: '9 min', icon: 'terminal' },
      { name: 'Tokens, context and cost', sub: 'What actually drives the bill', meta: '7 min', icon: 'book' },
    ],
  },
  {
    title: 'Guardrails',
    items: [
      { name: 'What not to paste', sub: 'Data handling rules', meta: 'Required', icon: 'verify' },
      { name: 'Reviewing AI-written changes', sub: 'What to look for', meta: '6 min', icon: 'verify' },
      { name: 'Where to ask for help', sub: 'Channels and office hours', icon: 'note' },
    ],
  },
];

const DOCS: Item = {
  name: 'Claude Code documentation',
  sub: 'docs.claude.com',
  icon: 'book',
  href: 'https://docs.claude.com/en/docs/claude-code/overview',
};

function ItemIcon({ icon }: { icon: Item['icon'] }) {
  if (icon === 'terminal') return <IconTerminal size={26} />;
  if (icon === 'verify') return <IconVerify size={26} />;
  if (icon === 'note') return <IconNote size={26} />;
  return <IconBook size={26} />;
}

function ItemBody({ item, children }: { item: Item; children?: ReactNode }) {
  return (
    <>
      {children ?? <ItemIcon icon={item.icon} />}
      <span>
        <h4>{item.name}</h4>
        <p>{item.sub}</p>
        {!item.href && <p className="res__soon">Link not set yet</p>}
      </span>
      {item.meta && <span className="res__dur">{item.meta}</span>}
    </>
  );
}

function ResourceItem({ item, icon }: { item: Item; icon?: ReactNode }) {
  const external = /^https?:/.test(item.href ?? '');

  if (!item.href) {
    /* Not a button: there is nothing to press. Announced as disabled so it is not
       offered to a screen reader as an action either. */
    return (
      <div className="res__item res__item--soon" aria-disabled="true">
        <ItemBody item={item}>{icon}</ItemBody>
      </div>
    );
  }

  return (
    <a
      className="res__item"
      href={item.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer noopener' : undefined}
    >
      <ItemBody item={item}>{icon}</ItemBody>
    </a>
  );
}

export default function ResourcesScreen() {
  return (
    <>
      <h1 className="res__h">Resources</h1>
      <p className="prog__trail">Reference material to sit alongside the ten topics</p>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <h2 className="res__group">{g.title}</h2>
          <div className="res__grid">
            {g.items.map((it) => (
              <ResourceItem item={it} key={it.name} />
            ))}
          </div>
        </section>
      ))}

      <h2 className="res__group">Official docs</h2>
      <div className="res__grid">
        <ResourceItem item={DOCS} icon={<IconResources size={26} />} />
      </div>
    </>
  );
}
