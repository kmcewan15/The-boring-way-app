import { useMemo } from 'react';

/* The prose a `read` step points at.

   Written as a small subset of Markdown rather than an array of tagged block
   objects, because of where the copy comes from: the ten `read` steps all say
   "Read the one-page overview" and that overview does not exist yet -- it will
   arrive as written prose. Prose pastes straight into a template literal; it does
   not paste into `[{ kind: 'para', text: ... }]` without someone retyping it.
   This file is the entire cost of accepting the easier format.

   What is supported, and deliberately nothing else:

     ## Heading        a subheading inside the reading
     - item            consecutive lines collapse into one bulleted list
     1. item           consecutive lines collapse into one numbered list
     > text            an aside, pulled out of the flow
     anything else     a paragraph; a blank line ends it

   Inline, anywhere above: `code` and **bold**. */

export type ReadingBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'aside'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'steps'; items: string[] };

/** Removes the indentation a template literal inherits from the source file, so
    the copy in curriculum.ts can sit at its natural nesting depth. */
function dedent(src: string): string {
  const lines = src.replace(/\t/g, '  ').split('\n');
  let min = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    min = Math.min(min, line.length - line.trimStart().length);
  }
  if (!Number.isFinite(min) || min === 0) return src;
  return lines.map((l) => (l.trim() ? l.slice(min) : '')).join('\n');
}

/** Copy is written with a plain `--` because that is what people type; prose
    should show a real em dash. Code spans are left alone: `--` in one is almost
    always a command-line flag. */
function typographic(text: string): string {
  return text
    .split(/(`[^`]+`)/g)
    .map((part) => (part.startsWith('`') ? part : part.replace(/ -- /g, ' — ')))
    .join('');
}

export function parseReading(src: string): ReadingBlock[] {
  const blocks: ReadingBlock[] = [];

  /* Every block type here can wrap across source lines, so each accumulates until
     something closes it -- a blank line, a different block type, or the end. */
  let para: string[] = [];
  let aside: string[] = [];
  let listKind: 'bullets' | 'steps' | null = null;
  let items: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push({ kind: 'para', text: typographic(para.join(' ')) });
    para = [];
  };
  const flushAside = () => {
    if (aside.length === 0) return;
    blocks.push({ kind: 'aside', text: typographic(aside.join(' ')) });
    aside = [];
  };
  const flushList = () => {
    if (listKind === null) return;
    blocks.push({ kind: listKind, items: items.map(typographic) });
    listKind = null;
    items = [];
  };
  const flush = () => {
    flushPara();
    flushAside();
    flushList();
  };

  for (const raw of dedent(src).split('\n')) {
    const line = raw.trim();

    if (line === '') {
      flush();
      continue;
    }

    const heading = /^#{1,3}\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: 'heading', text: typographic(heading[1]) });
      continue;
    }

    const quoted = /^>\s*(.*)$/.exec(line);
    if (quoted) {
      flushPara();
      flushList();
      aside.push(quoted[1]);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'bullets' : 'steps';
      flushPara();
      flushAside();
      if (listKind !== null && listKind !== kind) flushList();
      listKind = kind;
      items.push((bullet ?? numbered)![1]);
      continue;
    }

    /* A bare line continues a paragraph. It cannot continue a list: wrapped list
       items would be indistinguishable from the paragraph that follows one. */
    flushAside();
    flushList();
    para.push(line);
  }

  flush();
  return blocks;
}

/** Renders `backticked` spans as inline code and **starred** spans as bold. The
    curriculum is full of commands and filenames, so they need to look like
    commands rather than prose. Shared with the step's brief, tasks and verify
    text, which use the same conventions. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
          return (
            <code className="code" key={i}>
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}

export default function Reading({ body }: { body: string }) {
  const blocks = useMemo(() => parseReading(body), [body]);

  /* Indices are stable keys here: the copy is static per step and never reorders. */
  return (
    <div className="reading">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'heading':
            return (
              <h3 className="reading__h" key={i}>
                {block.text}
              </h3>
            );
          case 'aside':
            return (
              <p className="reading__aside" key={i}>
                <Rich text={block.text} />
              </p>
            );
          case 'bullets':
            return (
              <ul className="reading__list" key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>
            );
          case 'steps':
            return (
              <ol className="reading__list" key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Rich text={item} />
                  </li>
                ))}
              </ol>
            );
          case 'para':
            return (
              <p key={i}>
                <Rich text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
