# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server on :5173, opens a browser
npm run build    # tsc -b && vite build
npm run preview  # serve the built dist/
```

Typecheck without building: `npx tsc --noEmit -p tsconfig.json`.

There are no tests, no linter and no formatter. `tsc` is the only automated
check, and `tsconfig.json` is strict with `noUnusedLocals` and
`noUnusedParameters` on — an unused import fails the build.

> The README warns that `npx` breaks because of the `&` in a OneDrive path. The
> repo has since moved to `~/Projects/The-boring-way-app`, so `npx` works and
> that note is stale.

## What this is

A React 18 + TypeScript + Vite single-page app. No router, no backend, no state
library, no CSS framework — one React context for state, two hand-written
stylesheets, and hand-drawn SVG artwork. It is a learning app: ten topics of
hands-on Claude Code practice, presented as a walk up a trail.

**Read the [README](README.md) before changing the Learn screen or the artwork.**
It documents the scroll-driven palette morph, the `TIERS` card placement table,
and a list of things that break if you touch them (wheel events, scroll snapping,
blend memoisation). That detail is not repeated here.

Where the README and the code disagree, the code is right. The README is stale on:
the topic 9/10 titles, the third path's name (`Using It Well`), the step count
(36 steps + 10 quizzes = 46 journey entries, not 38/48), and the `localStorage`
key (`boring-way:v4`).

## Architecture

`main.tsx` → `AppProvider` → `App.tsx`. `App.tsx` is the whole router: a `tab`
from context picks one of three screens, and local `useState` drives the
overlays (`explore`, `detail`, `openIndex`) that sit on top of the stage.

Three data structures do most of the work:

- **`src/data/curriculum.ts`** — all content, as `Path → Topic → Step`. Steps are
  authored as a nested `STEPS: RawStep[][]` array; `TOPICS` zips that with
  `TOPIC_META` (title, goal, biome, accent colours). Everything downstream is
  derived, so adding a topic means appending to both arrays and nothing else.
- **`JOURNEY`** — the flat sequence of all steps and quizzes, in trail order,
  built from `TOPICS`. A discriminated union of `{ kind: 'step' }` and
  `{ kind: 'quiz' }`. This is what the Learn screen scrolls through and what
  `openIndex` indexes into. `WORLD_BOUNDARIES` are the indices where a topic
  changes.
- **`src/state/useApp.tsx`** — the single context. Holds the `{ topic, step }`
  cursor, completed step ids, bookmarks, notes and quiz results, and persists the
  lot to `localStorage`.

The cursor and `JOURNEY` are two views of the same position; `globalIndexOf()`
and `quizPosition()` convert between them. Screens that show "where you are" read
the cursor; the trail reads `JOURNEY`.

## Invariants worth knowing

**A cursor `step` equal to `topic.steps.length` means "on the quiz", not
out of bounds.** `jumpTo` deliberately clamps to `steps.length` rather than
`length - 1`, and `advance()` walks last-step → quiz → next topic. Any code
reading `steps[cursor.step]` must handle `undefined` — see the existing guards in
`ProgressScreen` and `Sidebar`, which both branch on `cursor.step >= steps.length`
before using the step.

**Step ids are positional** (`t3s2` = topic 3, step 2), so inserting or
reordering a step re-points every id after it and orphans saved progress. Bump
`STORAGE_KEY` in `useApp.tsx` and add a line to the comment above it explaining
what changed.

**Biomes must differ between adjacent topics.** `TOPIC_META.biome` picks both the
island and the landscape palette, and there are 7 biomes for 10 topics. Two in a
row with the same biome makes the world crossing invisible.

## Authoring content

Step teaching content is a `Block[]` (see the `Block` union and its doc comments
in `curriculum.ts`), rendered by `StepBody.tsx`. The union's `default` case
assigns to `never`, so adding a block type without handling it is a compile error
rather than content that silently fails to render.

Two blocks are interactive widgets with no content of their own: `{ t: 'calc' }`
(`TokenCalc.tsx`) and `{ t: 'builder' }` (`RequestBuilder.tsx`).

`{ t: 'track' }` is a container: a labelled collapsible holding nested `Block[]`,
used only in topic 1 for the terminal-versus-VS-Code split. `BlockView` in
`StepBody.tsx` recurses into it. Keep `why` and `warn` out of tracks — both emit
a fixed `<h2>`, so one per branch duplicates a heading.

**`docs/authoring-lessons.md` is the content style guide** — block ordering
rules, per-`kind` templates, the `handover/` mini project that topics 2–5 share,
and the video budget per topic. Read it before writing step content. 33 of 36
steps have a `body`; topic 8 (3 steps) is the only gap.

Backticks render as inline code via `Rich.tsx`, but **only in prose fields** —
`p.text`, `why.text`, `term.means`, `see.text`, `warn.text`, all three `table`
cell fields, and a step's own `brief`, `tasks` and `verify`. In `do.label`,
`do.cmd`, `term.word`, `track.label` and `video.title` the backticks appear
literally on screen. The `Block` union's own doc comment omits the `table`
fields — it is wrong, the code is right.

Quizzes live in `src/data/quiz.ts`, keyed by topic number, three questions each.
Nothing is gated on the score — a wrong answer only changes the wording and
surfaces the question's `why`, so keep `why` genuinely explanatory.

## Styling

Plain CSS, two files, no preprocessor and no CSS modules. `tokens.css` holds the
custom properties (palette sampled from the reference app, type scale, radii,
motion); `global.css` is a single 2,300-line sheet in BEM-ish blocks
(`.side__brand`, `.navitem--active`) with section-banner comments.

Colours that change per world are set **inline** from the blended palette, not in
the stylesheet — a stylesheet `:hover` rule cannot override an inline background,
which is why hover states on those surfaces use a `brightness` filter instead.

Contrast targets are documented per surface in the README and are load-bearing;
if you retune a palette, recheck them.

## assets/

Reference screenshots and working PNGs. Nothing in `src/` imports from it — all
artwork in the app is inline SVG in `src/art/`.
