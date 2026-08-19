import { IconBook, IconNote, IconResources, IconTerminal, IconVerify } from './Icons';

/* Reference material to sit alongside the topics. Links are intentionally left
   as labels — point them at your team's own docs. */
const GROUPS: Array<{
  title: string;
  items: Array<{ name: string; sub: string; meta?: string; icon: 'book' | 'terminal' | 'verify' | 'note' }>;
}> = [
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
              <button type="button" className="res__item" key={it.name}>
                {it.icon === 'book' && <IconBook size={26} />}
                {it.icon === 'terminal' && <IconTerminal size={26} />}
                {it.icon === 'verify' && <IconVerify size={26} />}
                {it.icon === 'note' && <IconNote size={26} />}
                <span>
                  <h4>{it.name}</h4>
                  <p>{it.sub}</p>
                </span>
                {it.meta && <span className="res__dur">{it.meta}</span>}
              </button>
            ))}
          </div>
        </section>
      ))}

      <h2 className="res__group">Official docs</h2>
      <div className="res__grid">
        <button type="button" className="res__item">
          <IconResources size={26} />
          <span>
            <h4>Claude Code documentation</h4>
            <p>docs.claude.com</p>
          </span>
        </button>
      </div>
    </>
  );
}
