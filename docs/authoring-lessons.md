# Authoring lesson bodies

How to write the `body: Block[]` teaching content for a step, derived from the 15
steps in topics 6–10 that already have one. Topics 1–5 have tasks and briefs but
no bodies; this is the spec for filling them in.

**The tasks, briefs and `minutes` already in place are the source of truth.** A
body teaches what the tasks require the learner to do and what the topic's quiz
will test. It does not introduce new work.

## House style

126 blocks over 15 steps — mean 8.4 per step, range 3–15. Bodies run 79–363
words, median ~200. A short document, not an article.

Frequency: `p` 59, `term` 18, `do` 14, `why` 11, `warn` 11, `see` 7, `video` 3,
`table`/`calc`/`builder` 1 each.

Rules that hold across all 15 exemplar steps:

- **Open with a `p`.** Never a `term`, `do` or widget.
- **Never close with `p`, `do`, `see`, `term` or `table`.** The closer is `why`,
  `warn`, `video` or a widget.
- **At most one `why` and one `warn` per step.** Load-bearing, not stylistic:
  each renders a fixed `<h2>` ("Why this matters" / "Careful",
  `StepBody.tsx:49,88`), so two of either gives a screen reader duplicate
  headings.
- **`why` before `warn`** when a step has both (6 of 7 steps; topic 9 step 2
  inverts it, which looks incidental).
- **`video` is always the last block** — last in the step, or last inside its
  `track`. `src` is required: `{ t: 'video', title: '...', src: '/demos/x.mp4' }`.
  There is no placeholder state any more, so do not add the block until the clip
  exists — omitting `src` is a build error rather than an empty slot. Titles are short gerund phrases, sentence case,
  no trailing period: "Watching the context fill in one session".
- **A run of 3–4 `term`s defines the topic's vocabulary and sits immediately
  after the opening prose** (`:745-763`, `:825-847`, `:944-959`). A lone `term`
  goes where the word first matters (`:307`).
- **Backticks are rare in prose** — 5 of 106 prose blocks, and only for real
  tokens: `/context`, `/clear`, `CLAUDE.md`, `SKILL.md`, `weekly-summary`.
- **Short declarative sentences, one analogy per topic, no jargon undefined.**
  Topic 7 runs entirely on "Claude works at a desk". The reader is not a
  developer.
- **Offer a no-terminal route** where a step assumes the CLI, as a `warn`
  (`:672`).

### `do` and `see`

"A `do` is always followed by a `see`" is **false** — only 7 of 14 `do`s have
one. The actual rule:

- A `do` whose command produces **visible output** is followed by `see`
  (`:370→373`, `:539→542`, `:647→650`).
- A `do` that is a **path or a file's contents** is followed by an explanatory
  `p` (`:484→490`, `:493→499`, `:401→406`).
- Nothing ever intervenes between a `do` and its follower, and **no `do` is ever
  the last block**.
- One three-block variant exists: two contrasting `do`s (vague, then correct)
  then a single `see` comparing them (`:765-773`).

## Content/quiz coupling

All 15 exemplar quiz questions are answerable from their topic's content, and 12
are fully grounded — several near-verbatim (`t8q2`'s answer paraphrases the `do`
at `:769`; `t9q2`'s `why` copies the `warn` at `:884`).

The reverse is much weaker: ~10 of 18 `term`s are tested by nothing, both
widgets are untested, and topic 6 step 4 has no question at all.

Three questions are only partly supported, and each is a failure mode to avoid:

| Question | Problem |
| --- | --- |
| `t8q3` | The answer's reasoning exists only in the quiz `why`, never in the body. |
| `t7q1` | A distractor is **contradicted** by the topic's own content, so a careful reader is punished. |
| `t6q1` | A distractor is refuted only in the quiz `why`. |

**The rule for topics 1–5:** the three questions are the mandatory spine, not a
summary. Make each correct answer unmissable in the body, **refute every
distractor explicitly**, and treat anything beyond that as optional enrichment.

## Tracks: the terminal / VS Code split

`{ t: 'track'; label: string; blocks: Block[] }` renders a labelled, collapsible
`<details>` panel holding nested blocks. It exists so a reader follows only the
half of an instruction that applies to their setup.

- **Only topic 1 needs them.** Install, sign-in and opening a folder genuinely
  differ between the terminal and the extension. From topic 2 on, everything is
  a prompt typed at Claude, which is identical either way — a track there would
  be noise.
- **Labels are `In the terminal` and `In VS Code`**, terminal first.
- **Keep `why` and `warn` outside a track.** Both emit a fixed `<h2>`, so one in
  each branch reads as a duplicate heading to a screen reader.
- **A track is never the step's closer.** Put the `warn` after the tracks, so
  the step ends the same way whichever branch you read.
- Open by default. Hiding content behind a click in a learning app loses people;
  the collapse is there to fold away the half that is not yours.

## The running mini project

Topics 2–5 progress one small artefact rather than each inventing its own
example. The learner has the agent build a `handover/` folder in topic 2 —
`week-1.md` to `week-3.md` plus a `costs.csv` — and then:

| Topic | What it does to the pack |
| --- | --- |
| 2 | The agent creates it, which is itself the chat-versus-agent demo. Then the same question is asked in both places. |
| 3 | Claude reads `week-2.md`, changes one date in it, and the change is undone. |
| 4 | Claude is asked for the total in `costs.csv`, and is caught out on it. |
| 5 | A `CLAUDE.md` of formatting rules for the pack, proved from a fresh session. |

Keep this thread. A step that invents a fresh example breaks the continuity that
makes the tasks feel like work rather than exercises.

**Video budget.** Topics 1 and 2 carry the base knowledge, so most substeps get
a demo (5 and 2). Topics 3–5 get exactly one each, on the substep where watching
beats reading: the edit-and-diff, the caught error, the fresh-session proof.

## Templates

`read` — the concept step. No commands.

```
p          open on the reader's own experience, not a definition
p          the reframe
term ×3-4  the topic's vocabulary
p          consequence
why        why this matters to them
warn       the likely misconception          <- closer
```

`exercise` — the hands-on step.

```
p          what they are about to do
do  + see  the command, and what appears
p          what that told them
why        what the exercise proves that reading cannot
warn       the likely mistake, or the no-terminal route
```

`verify` — same as `exercise`, but the closer names what a pass and a fail look
like.

`note` — prose and at most one `term`, closing on a `why`. The reflection is the
note box, so do not ask for it twice.

## Constraints checklist

- **`table` cells go through `Rich`** (`StepBody.tsx:118,121,124`), so backticks
  render as code there. The `Block` doc comment (`curriculum.ts:13-17`) and
  `CLAUDE.md` both omit the table fields from their list — the doc is wrong.
- Backticks print **literally** in `do.label`, `do.cmd`, `term.word`,
  `video.title`. `Rich.tsx:8` requires `length > 2`, so an empty pair or a stray
  single backtick prints raw.
- **`TopicQuiz.tsx:165,224,227` renders options, questions and `why` as raw
  text — no `Rich`.** `quiz.ts:34` already has a backticked option, so topic 1's
  quiz currently shows visible backticks. Pre-existing defect.
- **`<li key={t}>` at `StepView.tsx:143` keys on task text** — two identical
  task strings in one step collide. Same for `<tr key={r.dimension}>`
  (`StepBody.tsx:116`): `dimension` values must be unique per table.
- The task list is gated on **`tasks.length`, not `kind`** (`StepView.tsx:138,
  191`). Topic 6 step 1 is a `read` step with tasks; topics 7–10 use
  `tasks: []`.
- **Latent heading skip:** a step with `tasks: []`, a `verify` or
  `kind: 'note'`, and no `why`/`warn` jumps h1 → h3. Every current empty-task
  step happens to carry one, so it never fires today. Keep it that way.
- **Adding a `body` to an existing step does not change step ids**, so no
  `STORAGE_KEY` bump. Only adding or reordering steps does
  (`useApp.tsx:73-78`, currently `v4`).
- `do.cmd` is a `<pre>` with `white-space: pre-wrap` (`global.css:1316`): `\n` is
  a real break. The exemplar hand-wraps at ~50 chars with a two-space
  continuation indent (`:769`).
- A run of consecutive `term`s emits a separate `<dl>` each
  (`StepBody.tsx:58`) — established behaviour.
- Adding a block type without handling it in `StepBody` is a compile error (the
  `never` assignment in `BlockView`).
- `BlockView` in `StepBody.tsx` renders one block and recurses for `track`, so a
  new container block only has to map over its children.
- `tsc` is the only check. Strings containing apostrophes use double quotes.

## Known weaknesses in the exemplar

1. **Topic 8 is half-built** — 1 of 4 steps has a body, and it is the only
   remaining gap in the course (33 of 36 steps have one). Do not copy it.
2. **Topic 9 step 2 puts `warn` before `why`**, the only house-style violation
   in the codebase. Leave it or fix it, but do not copy it.
3. **`minutes` is not calibrated to body length** — topic 7 step 1 is 363 words
   at `minutes: 3`; topic 6 step 5 is 127 words at `minutes: 9`. Topics 1–5 have
   `minutes` set already, so size bodies to fit (~170 wpm), not the reverse.
4. **Topic 3's git assumption is now resolved.** `799dc24` had stripped git out
   of topics 9 and 10 but left topic 3 assuming it. The way back is now "copy the
   folder", with `git checkout` offered as the equivalent for anyone using
   version control, and step 4's `verify` no longer names `git diff`. Keep it
   route-neutral if you touch it.
5. **`t3q2` has a factually shaky distractor** — "the tool refuses to edit
   unread files" is arguably true of real Claude Code. Teach the *reason* (edits
   built on assumptions break things) without asserting the tool imposes no such
   rule.

## Per-topic deltas for 1–5

- **Topic 1** — never mentions PATH, which is the whole basis of `t1q2`'s `why`,
  for an audience that has not met the concept. Nothing refutes "requires a git
  repository" or "on a server you upload files to".
- **Topic 2** — no worked good-fit vs. poor-fit examples, which is all `t2q2`
  asks. Never states the misconception `t2q3` turns on: the model is no *more*
  likely to be wrong, only the consequences moved. A `table` is the natural fit,
  its second use after `:432`.
- **Topic 3** — closest to complete. Nothing refutes "ask it to explain its plan
  first" (`t3q1`'s strongest distractor).
- **Topic 4 — the worst gap.** `t4q2` (Claude says the tests passed — read the
  output yourself) and `t4q3` (the same wrong answer twice tells you nothing) are
  taught nowhere. Two of three questions are currently unanswerable. Step 2's
  task "If it was right, ask something harder and repeat" is a different loop and
  could be misread as endorsing the ask-twice fallacy.
- **Topic 5** — best covered. Needs a `table` for `t5q2` and an explicit `warn`
  that Claude confirming it read the file is not evidence (`t5q3`'s distractor,
  and a natural tie back to topic 4).
