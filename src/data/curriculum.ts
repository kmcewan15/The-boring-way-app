import type { IslandBiome } from '../art/FloatingIsland';

/* Internal AI-learning curriculum, arranged as a journey:
   Path  ->  Topic  ->  Step
   Progress is a single cursor into that ladder. */

export type StepKind = 'read' | 'exercise' | 'verify' | 'note';

export interface Step {
  id: string;
  title: string;
  kind: StepKind;
  minutes: number;
  /** One or two sentences framing why the step matters. */
  brief: string;
  /** What the learner actually does, in order. */
  tasks: string[];
  /** How they know it worked. Omitted for reading and note steps. */
  verify?: string;
}

export interface Topic {
  id: string;
  number: number;
  title: string;
  goal: string;
  biome: IslandBiome;
  /** Bottom-panel + pin colour on the Explore topics screen. */
  accent: string;
  accentInk: string;
  steps: Step[];
}

export interface LearningPath {
  number: number;
  name: string;
  topicNumbers: number[];
}

/* -------------------------------------------------------------------------- */
/* Step content                                                               */
/* -------------------------------------------------------------------------- */

type RawStep = Omit<Step, 'id'>;

const STEPS: RawStep[][] = [
  /* 1 — Bring Claude to Life ---------------------------------------------- */
  [
    {
      title: 'What Claude Code actually is',
      kind: 'read',
      minutes: 5,
      brief:
        'Claude Code is a terminal agent, not a website. It runs on your machine, in a folder you choose, and it can read and change the files in it.',
      tasks: [
        'Read the one-page overview',
        'Note the difference between Claude in a browser and Claude in your terminal',
      ],
    },
    {
      title: 'Install it',
      kind: 'exercise',
      minutes: 10,
      brief: 'Install Claude Code and confirm the command exists before going any further.',
      tasks: ["Install Claude Code following your team's instructions", 'Run `claude --version`'],
      verify: "`claude --version` prints a version number rather than 'command not found'.",
    },
    {
      title: 'Authenticate',
      kind: 'exercise',
      minutes: 6,
      brief: 'Sign in once so Claude can reach the API. Until this works, nothing else will.',
      tasks: [
        'Run `claude` and follow the sign-in prompt',
        'Complete the browser login and return to the terminal',
      ],
      verify: "Claude answers a plain 'hello' without an authentication error.",
    },
    {
      title: 'Open a real project',
      kind: 'exercise',
      minutes: 8,
      brief:
        'Point Claude at an actual folder of yours, not a scratch directory. The whole point is that it works on real material.',
      tasks: [
        '`cd` into a project folder you know well',
        'Start `claude`',
        "Ask: 'What is in this folder?'",
      ],
      verify: 'Claude lists files that genuinely exist in that folder.',
    },
  ],

  /* 2 — Leave the Chatbox ------------------------------------------------- */
  [
    {
      title: 'Chat advises, an agent acts',
      kind: 'read',
      minutes: 6,
      brief:
        'In a chat window you copy and paste. An agent reads your files, runs commands and changes things. The failure modes are different too.',
      tasks: [
        'Read the comparison',
        'List two things you currently copy-paste that an agent could just do',
      ],
    },
    {
      title: 'Ask the same question both ways',
      kind: 'exercise',
      minutes: 12,
      brief:
        'Ask a real question about your project in a browser chat, then ask Claude Code the same thing.',
      tasks: [
        "Pick a question about your own code, e.g. 'where is X configured?'",
        'Ask it in a browser chat with no files attached',
        'Ask Claude Code the same thing inside the project folder',
        'Note which answer you could actually act on',
      ],
      verify: 'You can point at a concrete difference between the two answers, not just a feeling.',
    },
    {
      title: 'What this changes for you',
      kind: 'note',
      minutes: 5,
      brief: "Write down what you'd now use an agent for that you would not have used chat for.",
      tasks: ["Note one task you'll move across this week"],
    },
  ],

  /* 3 — Give Claude Something Real ---------------------------------------- */
  [
    {
      title: 'Read before write',
      kind: 'read',
      minutes: 5,
      brief:
        "Claude should look at a file before changing it, and so should you. Most bad edits come from acting on an assumption about what's in the file.",
      tasks: ['Read the guidance on reading before editing'],
    },
    {
      title: 'Have Claude read something real',
      kind: 'exercise',
      minutes: 8,
      brief:
        "Ask Claude to explain a file you already understand. You're testing its comprehension, not learning the file.",
      tasks: [
        'Pick a file you know well',
        'Ask Claude to summarise what it does',
        'Note anything it got wrong',
      ],
      verify: 'You have compared its summary against your own understanding.',
    },
    {
      title: 'Make one small edit',
      kind: 'exercise',
      minutes: 12,
      brief:
        'One small, obviously-correct change. Resist asking for a big refactor on your first go.',
      tasks: [
        'Make sure your work is committed or backed up first',
        'Ask for one specific, small change',
        'Read the change before you accept it',
      ],
      verify: 'The change is what you asked for, and nothing else changed.',
    },
    {
      title: 'Undo it cleanly',
      kind: 'exercise',
      minutes: 6,
      brief: 'Knowing how to get back is what makes everything else safe to try.',
      tasks: ['Revert the edit', 'Confirm the file is back exactly where it started'],
      verify: '`git diff` (or your editor) shows no remaining changes.',
    },
  ],

  /* 4 — Don't Trust the Robot --------------------------------------------- */
  [
    {
      title: 'Confident and wrong',
      kind: 'read',
      minutes: 5,
      brief:
        'Claude will state things fluently that are not true. The tone is identical whether it is right or wrong, so tone tells you nothing.',
      tasks: ['Read the note on plausible-sounding errors'],
    },
    {
      title: 'Go and find one',
      kind: 'exercise',
      minutes: 15,
      brief:
        'Deliberately ask about something obscure in your project, or about a version number you can check yourself.',
      tasks: [
        'Ask about a detail you can independently verify',
        'Verify it',
        'If it was right, ask something harder and repeat',
      ],
      verify: 'You have one concrete example of Claude being confidently wrong, written down.',
    },
    {
      title: "Where you'll check from now on",
      kind: 'note',
      minutes: 6,
      brief: 'Decide in advance which kinds of claim you will always verify.',
      tasks: [
        "Write down two categories you'll never take on trust — e.g. version numbers, whether a test passed",
      ],
    },
  ],

  /* 5 — Give Claude a Memory ---------------------------------------------- */
  [
    {
      title: 'Why it forgets',
      kind: 'read',
      minutes: 5,
      brief:
        'Every session starts fresh. CLAUDE.md is the file Claude reads each time, so it is where durable project rules belong.',
      tasks: ["Read what belongs in CLAUDE.md and what doesn't"],
    },
    {
      title: 'Write your first one',
      kind: 'exercise',
      minutes: 12,
      brief:
        'Start small: three or four rules that are true about your project and would otherwise need repeating every session.',
      tasks: [
        'Create CLAUDE.md in your project root',
        'Write 3–4 concrete rules, e.g. how to run the tests',
        'Leave out anything Claude can already read from the code',
      ],
    },
    {
      title: "Prove it's being used",
      kind: 'verify',
      minutes: 8,
      brief: "A rule you can't prove is being read is a rule you can't rely on.",
      tasks: [
        'Start a completely fresh session',
        'Ask Claude to do something the rule applies to',
        'Check it followed the rule without being reminded',
      ],
      verify: 'Claude followed a CLAUDE.md rule that you never mentioned in the prompt.',
    },
    {
      title: 'Keep it small',
      kind: 'note',
      minutes: 5,
      brief: 'A bloated CLAUDE.md gets ignored — by Claude and by you.',
      tasks: ["Delete anything you added that isn't doing real work"],
    },
  ],

  /* 6 — Teach Claude a Skill ---------------------------------------------- */
  [
    {
      title: 'When a prompt should become a skill',
      kind: 'read',
      minutes: 6,
      brief:
        "If you've written roughly the same prompt three times, it should be a skill: a named, reusable set of instructions.",
      tasks: ['Read what a skill is and where it lives'],
    },
    {
      title: 'Spot your repeated task',
      kind: 'exercise',
      minutes: 8,
      brief: 'The best first skill is boring and frequent.',
      tasks: [
        'Look back over your recent prompts',
        "Pick the one you've repeated most",
        "Write down what 'done' looks like for it",
      ],
    },
    {
      title: 'Write the skill',
      kind: 'exercise',
      minutes: 15,
      brief: "Write the instructions you'd give a competent colleague who has never done it before.",
      tasks: [
        'Create the skill with a clear name and description',
        'Spell out the steps and the output format',
      ],
    },
    {
      title: 'Run it and fix the gaps',
      kind: 'verify',
      minutes: 12,
      brief: 'The first run always reveals what you left in your head instead of in the file.',
      tasks: [
        'Invoke the skill by name',
        'Note anything it got wrong',
        'Fix the instructions and run it again',
      ],
      verify:
        'The skill produces the right output twice in a row without you adding extra instructions.',
    },
  ],

  /* 7 — Spend Intelligence Wisely ----------------------------------------- */
  [
    {
      title: 'Tokens, context, cost',
      kind: 'read',
      minutes: 8,
      brief:
        'Everything Claude reads and writes costs tokens, and the context window is finite. Both cost and quality follow from what you put in it.',
      tasks: ['Read the explanation of tokens and the context window'],
    },
    {
      title: 'Watch the context fill',
      kind: 'exercise',
      minutes: 10,
      brief: 'See it happen in a real session rather than taking it on faith.',
      tasks: [
        'Start a session and do some real work',
        'Notice what happens as the context fills up',
        'Note what filled it fastest',
      ],
      verify: 'You can name the single biggest consumer of context in your session.',
    },
    {
      title: 'Three cheaper habits',
      kind: 'note',
      minutes: 6,
      brief: 'Small habits beat clever optimisations.',
      tasks: [
        "Write down three things you'll do differently — e.g. name the files, start a fresh session per task",
      ],
    },
  ],

  /* 8 — Tell Claude What Done Means --------------------------------------- */
  [
    {
      title: 'Result, done, tools, limits',
      kind: 'read',
      minutes: 7,
      brief:
        'Four things make a request work: the result you want, how you will know it is done, what Claude may use, and what it must not touch.',
      tasks: ['Read the four-part structure'],
    },
    {
      title: 'Rewrite a vague request',
      kind: 'exercise',
      minutes: 10,
      brief: 'Take something you asked badly and ask it properly.',
      tasks: [
        'Find a prompt of yours that produced the wrong thing',
        'Rewrite it with all four parts stated explicitly',
      ],
    },
    {
      title: 'Run the rewritten version',
      kind: 'exercise',
      minutes: 12,
      brief: 'Compare the output against what you actually specified, not against what you hoped.',
      tasks: ['Run the rewritten request', "Check the result against your own 'done' criteria"],
      verify: 'You can tick off each part of your definition of done against the result.',
    },
    {
      title: 'What was missing',
      kind: 'note',
      minutes: 5,
      brief: 'Which of the four parts do you habitually leave out?',
      tasks: ['Write down the one you keep forgetting'],
    },
  ],

  /* 9 — Never Trust a Change You Can't See -------------------------------- */
  [
    {
      title: 'The loop',
      kind: 'read',
      minutes: 6,
      brief:
        'Know the state before. See exactly what changed. Prove it still works. Then commit. Skipping a stage is where the bad afternoons come from.',
      tasks: ['Read the four stages'],
    },
    {
      title: 'Baseline, then change',
      kind: 'exercise',
      minutes: 10,
      brief: 'Start from a known-clean state so that the diff actually means something.',
      tasks: ['Get your working tree clean and committed', 'Ask Claude for a change'],
      verify: 'You started from a clean tree, so everything in the diff came from this task.',
    },
    {
      title: 'Diff and verify',
      kind: 'exercise',
      minutes: 14,
      brief: 'Read every line of the diff. Then run the thing.',
      tasks: [
        'Read the full diff, not the summary of it',
        'Run the tests, or run the app',
        "Question anything you didn't ask for",
      ],
      verify: 'You have read every changed line, and the thing actually runs.',
    },
    {
      title: 'Commit it',
      kind: 'exercise',
      minutes: 6,
      brief: 'A commit is the checkpoint that makes the next change safe to attempt.',
      tasks: ['Write a message that says why, not just what', 'Commit'],
      verify: 'Your tree is clean again and you could revert this change with one command.',
    },
  ],

  /* 10 — Your First Boring Hack ------------------------------------------- */
  [
    {
      title: 'Why boring is the point',
      kind: 'read',
      minutes: 5,
      brief:
        'The best first automation is a small, dull task you do often. Boring tasks have clear definitions of done, which is exactly what makes them work.',
      tasks: ['Read the brief on choosing well'],
    },
    {
      title: 'Pick something boring',
      kind: 'exercise',
      minutes: 10,
      brief:
        "Something you do weekly, that takes under an hour, and that you'd notice if it went wrong.",
      tasks: ['List three candidates', 'Pick the dullest one'],
    },
    {
      title: 'Spec it properly',
      kind: 'exercise',
      minutes: 12,
      brief: 'Use the four parts: result, done, tools, limits.',
      tasks: ['Write the spec before you open Claude', 'State what must not change'],
    },
    {
      title: 'Build it with the loop',
      kind: 'exercise',
      minutes: 25,
      brief: 'Baseline, diff, verify, commit. Use your CLAUDE.md. Use a skill if one fits.',
      tasks: ['Work in small steps', 'Read every diff', 'Commit at each working point'],
      verify: 'The thing works, and every change has been reviewed and committed.',
    },
    {
      title: 'Write it up',
      kind: 'note',
      minutes: 10,
      brief: 'Share what you learned so the next person starts further along than you did.',
      tasks: [
        'Write a short note: what you built, what surprised you, what you would do differently',
        'Share it with your team',
      ],
    },
  ],
];

/* -------------------------------------------------------------------------- */
/* Topics                                                                     */
/* -------------------------------------------------------------------------- */

const TOPIC_META: Array<{
  title: string;
  goal: string;
  biome: IslandBiome;
  accent: string;
  accentInk: string;
}> = [
  {
    title: 'Bring Claude to Life',
    goal: 'Install, authenticate and launch Claude Code in a real project folder on your own machine',
    biome: 'desert',
    accent: '#FBE0DA',
    accentInk: '#8A4527',
  },
  {
    title: 'Leave the Chatbox',
    goal: 'Understand what actually changes when you move from a chat window to an agent inside your project',
    biome: 'savanna',
    accent: '#DCEF9C',
    accentInk: '#2C4A16',
  },
  {
    title: 'Give Claude Something Real',
    goal: 'Let Claude read and edit real files, safely, with a way back if it goes wrong',
    biome: 'jungle',
    accent: '#FBE0DA',
    accentInk: '#14453B',
  },
  {
    title: "Don't Trust the Robot",
    goal: 'Catch Claude making a confident, plausible mistake first-hand, so you never forget it can',
    biome: 'tundra',
    accent: '#C9E4E7',
    accentInk: '#2A4B50',
  },
  {
    title: 'Give Claude a Memory',
    goal: 'Write a CLAUDE.md that genuinely changes how Claude behaves, and prove that it works',
    biome: 'forest',
    accent: '#C6E0BE',
    accentInk: '#22402A',
  },
  {
    title: 'Teach Claude a Skill',
    goal: 'Turn a task you repeat into something reusable that you can invoke by name',
    biome: 'glacier',
    accent: '#E4F6FA',
    accentInk: '#215260',
  },
  {
    title: 'Spend Intelligence Wisely',
    goal: 'Understand tokens, context and cost well enough to make cheaper choices without thinking about it',
    biome: 'savanna',
    accent: '#DCEF9C',
    accentInk: '#2C4A16',
  },
  {
    title: 'Tell Claude What Done Means',
    goal: 'Write a request that states the result, the definition of done, the tools allowed and the limits',
    biome: 'jungle',
    accent: '#FBE0DA',
    accentInk: '#14453B',
  },
  {
    title: "Never Trust a Change You Can't See",
    goal: 'Build the baseline → diff → verify → commit habit until it is automatic',
    biome: 'tundra',
    accent: '#C9E4E7',
    accentInk: '#2A4B50',
  },
  {
    title: 'Your First Boring Hack',
    goal: 'Put all of it together on something real, small and genuinely useful to you',
    biome: 'blossom',
    accent: '#FBD9E3',
    accentInk: '#7A3A52',
  },
];

export const TOTAL_TOPICS = TOPIC_META.length;

export const TOPICS: Topic[] = TOPIC_META.map((meta, i) => ({
  id: `topic-${i + 1}`,
  number: i + 1,
  title: meta.title,
  goal: meta.goal,
  biome: meta.biome,
  accent: meta.accent,
  accentInk: meta.accentInk,
  steps: STEPS[i].map((s, j) => ({ ...s, id: `t${i + 1}s${j + 1}` })),
}));

export const PATHS: LearningPath[] = [
  { number: 1, name: 'Foundations', topicNumbers: [1, 2, 3, 4] },
  { number: 2, name: 'Making It Yours', topicNumbers: [5, 6, 7] },
  { number: 3, name: 'Shipping With Confidence', topicNumbers: [8, 9, 10] },
];

export function pathForTopic(topicNumber: number): LearningPath {
  return PATHS.find((p) => p.topicNumbers.includes(topicNumber)) ?? PATHS[0];
}

export function topicByNumber(n: number): Topic {
  return TOPICS[Math.min(Math.max(n, 1), TOTAL_TOPICS) - 1];
}

export const TOTAL_STEPS = TOPICS.reduce((sum, t) => sum + t.steps.length, 0);

/* -------------------------------------------------------------------------- */
/* The journey: every step and every end-of-world quiz, as one flat sequence    */
/* -------------------------------------------------------------------------- */

/* The trail is one continuous rail. Each topic contributes its steps and then a
   quiz, so the quiz closes out the world just before the crossing into the next
   one. A cursor position equal to `topic.steps.length` means "on the quiz". */
export type JourneyEntry =
  | {
      kind: 'step';
      globalIndex: number;
      topic: Topic;
      step: Step;
      /** Position within the owning topic, for "Step 2/4" labelling. */
      indexInTopic: number;
    }
  | { kind: 'quiz'; globalIndex: number; topic: Topic };

export const JOURNEY: JourneyEntry[] = (() => {
  const out: JourneyEntry[] = [];
  for (const topic of TOPICS) {
    topic.steps.forEach((step, indexInTopic) => {
      out.push({ kind: 'step', globalIndex: out.length, topic, step, indexInTopic });
    });
    out.push({ kind: 'quiz', globalIndex: out.length, topic });
  }
  return out;
})();

/** Stable React key for a journey entry. */
export function entryKey(entry: JourneyEntry): string {
  return entry.kind === 'step' ? entry.step.id : `quiz-t${entry.topic.number}`;
}

/** Global indices at which a new world begins. Index 0 is not a boundary. */
export const WORLD_BOUNDARIES: number[] = JOURNEY.reduce<number[]>((acc, entry, i) => {
  if (i > 0 && entry.topic.number !== JOURNEY[i - 1].topic.number) acc.push(i);
  return acc;
}, []);

/** The cursor position that means "the quiz" for a given topic. */
export function quizPosition(topicNumber: number): number {
  return topicByNumber(topicNumber).steps.length;
}

/** Map a { topic, step } cursor onto its position in the flat journey. */
export function globalIndexOf(topicNumber: number, position: number): number {
  const onQuiz = position >= quizPosition(topicNumber);
  const found = JOURNEY.findIndex(
    (e) =>
      e.topic.number === topicNumber &&
      (onQuiz ? e.kind === 'quiz' : e.kind === 'step' && e.indexInTopic === position),
  );
  return found === -1 ? 0 : found;
}
