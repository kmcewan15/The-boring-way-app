# The Boring Way

An internal learning app for getting people productive with Claude Code. Ten
topics, each broken into hands-on steps, presented as a journey up a trail.

The visual design is closely modelled on the **THE WAY** meditation app from
reference screenshots — the shell, palette and trail metaphor are borrowed; all
of the content is our own. Internal use only.

## Running it

```bash
npm install
npm run dev
```

> **Note on this folder's path:** the `&` in `OneDrive - Flutter UK&I` breaks `npx`
> path resolution, so `npx vite` / `npx tsc` fail with a `MODULE_NOT_FOUND` error.
> The `npm run` scripts work fine. To typecheck directly:
>
> ```bash
> node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
> ```

## The curriculum

All content lives in [curriculum.ts](src/data/curriculum.ts), arranged as
**Path → Topic → Step**. There are 3 paths, 10 topics and 38 steps, plus a
three-question quiz closing out each topic (in [quiz.ts](src/data/quiz.ts)).

| # | Topic | Path |
| --- | --- | --- |
| 1 | Bring Claude to Life | Foundations |
| 2 | Leave the Chatbox | Foundations |
| 3 | Give Claude Something Real | Foundations |
| 4 | Don't Trust the Robot | Foundations |
| 5 | Give Claude a Memory | Making It Yours |
| 6 | Teach Claude a Skill | Making It Yours |
| 7 | Spend Intelligence Wisely | Making It Yours |
| 8 | Tell Claude What Done Means | Shipping With Confidence |
| 9 | Never Trust a Change You Can't See | Shipping With Confidence |
| 10 | Your First Boring Hack | Shipping With Confidence |

### Editing content

Each step is a `Step` object with a `kind`, a `minutes` estimate, a one-or-two
sentence `brief`, a list of `tasks`, and an optional `verify` line:

```ts
{
  title: 'Install it',
  kind: 'exercise',
  minutes: 10,
  brief: 'Install Claude Code and confirm the command exists before going any further.',
  tasks: ["Install Claude Code following your team's instructions", 'Run `claude --version`'],
  verify: "`claude --version` prints a version number rather than 'command not found'.",
}
```

Notes on editing:

- `kind` drives the icon and label: `read`, `exercise`, `verify`, `note`. A `note`
  step shows a text box whose contents are saved to **My notes** on completion.
- **Backticks render as inline code** in `brief`, `tasks` and `verify` — use them
  for commands and filenames.
- Step ids are generated from position, so reordering steps within a topic will
  orphan any saved progress for them. Bump `STORAGE_KEY` in
  [useApp.tsx](src/state/useApp.tsx) if you make a breaking content change.
- Topic count is derived from `TOPIC_META`, so adding an 11th topic just works —
  but there are only 7 island biomes, so some will repeat.

## Screens

| Screen | File | Notes |
| --- | --- | --- |
| **Learn** — the trail | [LearnScreen.tsx](src/components/LearnScreen.tsx) | Step cards recede up the canyon path as you scroll or press ↑/↓. A "Current step" pill appears when you scroll away from where you are. |
| **Step view** | [StepView.tsx](src/components/StepView.tsx) | The brief, a tickable checklist, the verification criteria, and a timebox for the step's estimate. |
| **All topics** | [ExploreTopics.tsx](src/components/ExploreTopics.tsx) | Dark-green world, 10 vertically-paged topics, one island each, with a pin per step (ticked once complete). |
| **My Path** | [MyPathScreen.tsx](src/components/MyPathScreen.tsx) | Timebox / My progress / Completed steps / My notes. |
| **My progress** | [ProgressScreen.tsx](src/components/ProgressScreen.tsx) | Overall completion bar, topic strip, topic + step dots. Click any island to jump to that topic. |
| **Resources** | [ResourcesScreen.tsx](src/components/ResourcesScreen.tsx) | Reference material. **Link targets are placeholders** — point them at your own docs. |
| **End-of-world quiz** | [TopicQuiz.tsx](src/components/TopicQuiz.tsx) | The checkpoint at the end of each topic, reached on the trail. Card is [QuizCard.tsx](src/components/QuizCard.tsx). |

## How the trail works: one continuous journey

The Learn screen is **a single rail across all 48 entries** — 38 steps plus 10
end-of-world quizzes — not one rail per topic. Scrolling past the last step of a
topic hits that topic's quiz, then carries straight on into the first step of the
next, so the ten topics read as one walk rather than ten separate screens.

`JOURNEY` in [curriculum.ts](src/data/curriculum.ts) is the flat sequence that
drives it. It is a discriminated union — `{ kind: 'step' }` or `{ kind: 'quiz' }` —
and `WORLD_BOUNDARIES` marks the global indices where a new world begins. Because
the quiz is the last entry of each topic, a boundary always falls **just after a
quiz**, which is what makes the checkpoint close out the world.

Everything visual is driven off `scrollT` — the *fractional* scroll position in
steps — so the transitions move with the scroll rather than snapping per step:

| Effect | How it is driven |
| --- | --- |
| **Palette morph** | `LANDSCAPES` holds one landscape palette per biome; `mixLandscape` blends the outgoing world into the incoming one. The blend is centred on the crossing (`BLEND_FROM` 0.9 steps ahead → `BLEND_TO` 0.4 steps past), so the old world holds while the new island is still on the horizon, then the colour washes over as you step through. |
| **Next world on the horizon** | A `FloatingIsland` in the incoming biome rises at the trail's vanishing point from `LEAD_STEPS` (2.2) out, growing and drifting toward centre, then clearing once you are past the boundary. |
| **Parallax** | Measured from the start of the *current world*, not the start of the journey — otherwise the scene would zoom ever further in across all 38 steps. |
| **Caption sheet** | Follows the step you are *looking at*, so the topic name updates as you cross. The sidebar keeps showing where you actually are. |
| **Card colour** | Each step card is tinted from **its own** topic's palette (`fore`, plus `sky`/`foreDeep` for the CTA) rather than the blended one, so at a crossing you see the outgoing world's card with the next world's card already ahead of it on the trail. White type clears 5.7:1 on every world. |
| **Sheet colour** | Background and ink are set inline from the blended palette (`sky` and `foreDeep`), so the banner belongs to the current world instead of staying pink under a green landscape. Every world clears 6.5:1 contrast. Hover is a `brightness` filter, since an inline background cannot be overridden by a stylesheet hover rule. |

Cards aren't in the scroll flow; each is positioned by its distance from the
focused step using the `TIERS` table, anchored by its bottom edge so cards of
differing height still line up above the caption sheet. Cards drift right as they
recede because the vanishing point is up on the right of the frame. Only a window
of ±4 cards is rendered.

Things worth knowing if you edit this:

- Card bodies must stay `pointer-events: none` (only the buttons opt back in), or
  the card — which covers most of the stage — swallows wheel events and the trail
  stops scrolling.
- The rail uses `scroll-snap-type: y proximity`, **not** `mandatory`. Mandatory
  snapping yanks a whole step per wheel tick, which turns the colour morph into a
  jump.
- The blend is quantised to 5% steps and memoised. Without that, every scroll
  event rebuilds the palette and repaints several hundred SVG paths.
- The palette pair is taken from either side of the boundary, not from
  `floor(scrollT)` — once you are past the crossing the current step is already in
  the new world, so there would be nothing left to blend from.
- The artwork is composed around the bands the card and sheet *don't* cover. Move
  the card and the vegetation placement needs revisiting.

### Worlds

Each topic is assigned a `biome` in `TOPIC_META`, which selects both its island
and its landscape palette. There are 7 biomes for 10 topics, so some repeat — but
never two in a row, which would make a crossing invisible. If you reorder topics,
check that adjacent ones still differ.

## Artwork

Original SVG approximations of the reference art, not the real assets — swap them
for real images if you have them.

- [TrailScape.tsx](src/art/TrailScape.tsx) — the canyon backdrop, composed for
  16:9. Every colour comes from a `palette` prop so the Learn screen can morph it
  between worlds. The trail is a tapering ribbon generated from a centre line
  (`TRAIL`) and painted *over* the canyon walls so it stays the brightest shape.
- [landscapes.ts](src/art/landscapes.ts) — the seven landscape palettes plus
  `mixLandscape` for blending between them.
- [DesertTrailThumb.tsx](src/art/DesertTrailThumb.tsx) — miniature vignette on a
  transparent background. It deliberately has **no grain overlay**: the full-bleed
  multiply rect used in `TrailScape` would darken the card behind it and read as
  a framed square.
- [FloatingIsland.tsx](src/art/FloatingIsland.tsx) — isometric island in seven
  biomes, with `BIOME_PALETTES` exported so the UI can tint itself to match.

## State

Progress lives in [useApp.tsx](src/state/useApp.tsx) and persists to
`localStorage` under `boring-way:v2` — completed step ids, bookmarks, notes, and a
cursor of `{ topic, step }`. There is no backend, so progress is per-browser.

Clear your progress from the browser console:

```js
localStorage.removeItem('boring-way:v2');
```

## End-of-world quizzes

Each topic ends with a three-question checkpoint, reached on the trail as the last
card of that world. Questions live in [quiz.ts](src/data/quiz.ts), keyed by topic
number:

```ts
10: [
  {
    id: 't10q1',
    question: 'What makes the best first thing to automate?',
    options: ['The largest, most valuable process you own', 'A small, dull task you do often...'],
    answer: 1,
    why: 'Ambitious first attempts fail for reasons you cannot diagnose yet.',
  },
  ...
]
```

Notes:

- **Nothing is gated on the result.** `passed` is two out of three and only changes
  the wording — you can always carry on up the trail. Gating internal learning on a
  quiz score creates a reason to guess rather than to go back and practise.
- The result screen lists **only the missed questions**, each with the answer given,
  the correct one, and its `why`. That is the teaching moment, so keep `why`
  genuinely explanatory.
- Results are stored per topic in `topicQuizzes` (see
  [useApp.tsx](src/state/useApp.tsx)) and surface as a score badge on the quiz card
  and a line on **My progress**.
- Card and quiz surface are tinted from the **world palette**, but inverted against
  the step cards — pale fill, dark ink — so a checkpoint does not read as just
  another step.
- A cursor position equal to `topic.steps.length` means "on the quiz"
  (`quizPosition()`). `advance()` steps last-step → quiz → next topic, which is why
  finishing a quiz carries you into the next world. Anything reading
  `steps[cursor.step]` must handle that position being past the end — see the
  guards in `ProgressScreen` and `Sidebar`.

## Design tokens

Palette, type scale and layout constants are in
[tokens.css](src/styles/tokens.css). Colours were sampled from the reference
screenshots; the type scale is tuned for a desktop window.
