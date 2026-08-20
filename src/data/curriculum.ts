import type { IslandBiome } from '../art/FloatingIsland';

/* Internal AI-learning curriculum, arranged as a journey:
   Path  ->  Topic  ->  Step
   Progress is a single cursor into that ladder. */

export type StepKind = 'read' | 'exercise' | 'verify' | 'note';

/* The teaching content of a step, as a short scrollable document. The reader is
   not a developer, so every block renders as a visually distinct thing rather
   than as another paragraph in a wall of prose.

   Backticked spans render as inline code in the prose fields — `p.text`,
   `why.text`, `term.means`, `see.text` and `warn.text`, as well as in a step's
   own `brief`, `tasks` and `verify`. They do not in `do.label`, `term.word` or
   `video.title`, which are labels: write those as plain text or the backticks
   appear on screen. */
export type Block =
  /** Plain prose. Keep it to two or three short sentences. */
  | { t: 'p'; text: string }
  /** Why this matters to the reader. Use sparingly — once per step at most. */
  | { t: 'why'; text: string }
  /** A word the reader may not know, defined in one line. */
  | { t: 'term'; word: string; means: string }
  /** Something to type, verbatim. `cmd` may be a command or a prompt. */
  | { t: 'do'; label: string; cmd: string }
  /** What appears on screen after the `do` above it. */
  | { t: 'see'; text: string }
  /** A mistake the reader is likely to make. */
  | { t: 'warn'; text: string }
  /** A do-and-don't comparison, one row per dimension. */
  | {
      t: 'table';
      rows: Array<{ dimension: string; doThis: string; notThis: string }>;
    }
  /** The interactive token and cost estimator. Takes no content of its own. */
  | { t: 'calc' }
  /** The interactive four-part request builder. Takes no content of its own. */
  | { t: 'builder' }
  /** A video slot. Renders as a labelled placeholder until `src` is filled in. */
  | { t: 'video'; title: string; src?: string };

export interface Step {
  id: string;
  title: string;
  kind: StepKind;
  minutes: number;
  /** One or two sentences framing why the step matters. */
  brief: string;
  /** The teaching content, shown between the brief and the task list. */
  body?: Block[];
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
      title: 'What a skill is',
      kind: 'read',
      minutes: 4,
      brief:
        'A skill is a set of instructions you write down once and then call by name. It turns a prompt you keep retyping into something you run.',
      body: [
        {
          t: 'p',
          text: 'You have probably typed almost the same request to Claude more than once. Maybe you ask it to tidy the same report every Monday. Maybe you ask it for the same kind of summary every week.',
        },
        {
          t: 'p',
          text: 'Each time, you type the instructions again from memory. You leave out a detail. The answer comes back slightly different from last time.',
        },
        {
          t: 'term',
          word: 'Skill',
          means: 'A set of instructions you write down once, then call by name.',
        },
        {
          t: 'p',
          text: 'Think of a recipe card. You write the recipe out one time. After that you only say the name of the dish.',
        },
        {
          t: 'p',
          text: 'A skill is a folder with one plain text file inside it. There is no code in it. You write it in ordinary English, and Claude reads it and follows the steps.',
        },
        {
          t: 'p',
          text: 'You can apply a skill globally, so it works in every project you open. Or you can apply it to one project, when the task only comes up in the project you are working on. Either way, you can share the skill with your colleagues, so the whole team does the same task the same way.',
        },
        {
          t: 'p',
          text: 'A skill pays off when three things are true. You repeat the task. The task has a clear finish. You can write the steps down in plain words.',
        },
        {
          t: 'why',
          text: 'Those three conditions are what make a skill effective. The instructions sit in a file instead of in your head, so the result comes back the same every time, you stop retyping it, and a colleague can run the same thing without asking you how.',
        },
        {
          t: 'warn',
          text: 'A skill is the wrong tool for a one-off job, and for anything that needs a judgement you cannot write down. Writing the file costs you ten minutes, so it only pays back on work you repeat.',
        },
        {
          t: 'p',
          text: 'The rule is simple. If you have typed roughly the same request three times, stop retyping it and write a skill.',
        },
        { t: 'video', title: 'What a skill is, in two minutes' },
      ],
      tasks: ['Find something boring that needs a clear, defined finish'],
    },
    {
      title: 'Spot your boring task',
      kind: 'exercise',
      minutes: 7,
      brief:
        'Find the task you already do every day or every week, and that you could hand to a competent colleague with written instructions.',
      body: [
        {
          t: 'p',
          text: 'Do not pick your hardest task. Pick the one you are tired of. Your first skill should be small, dull, and something you do on a schedule.',
        },
        {
          t: 'p',
          text: 'A good candidate passes three tests. You do it at least weekly. You already know what a good result looks like. You could explain the whole task to a new colleague in under a minute.',
        },
        {
          t: 'why',
          text: 'You can judge the result of a boring task in seconds, because you have seen it a hundred times. That is what makes the first skill quick to get right — and it is why people who start with something ambitious give up.',
        },
        {
          t: 'p',
          text: 'Here are the kinds of tasks that work. Turning your rough notes into the same weekly update. Turning a meeting transcript into a list of actions. Checking a spreadsheet for the same five mistakes. Renaming and filing a batch of files the same way every time.',
        },
        {
          t: 'p',
          text: 'Start from evidence, not memory. Go back and read what you actually asked Claude for last week.',
        },
        { t: 'do', label: 'Reopen a past session', cmd: 'claude --resume' },
        {
          t: 'see',
          text: 'A list of your recent sessions appears. Pick one, then scroll up and read your own requests. Look for the ones you typed more than twice, and the ones where you corrected Claude the same way each time.',
        },
        {
          t: 'warn',
          text: 'Leave out anything that needs a judgement call you cannot write down. A skill follows written instructions. It does not read your mind.',
        },
      ],
      tasks: [
        'Find something boring that you repeat every week',
        'Check that it has a clear, defined finish',
        "Write down what 'done' looks like, in one sentence",
      ],
    },
    {
      title: 'Write a good skill',
      kind: 'exercise',
      minutes: 12,
      brief: "Write the instructions you'd give a competent colleague who has never done it before.",
      body: [
        {
          t: 'p',
          text: 'Write for a capable new colleague. They can do the work. They just do not know your habits, or what you call finished.',
        },
        {
          t: 'p',
          text: 'A skill is one file, called `SKILL.md`, in a folder named after the skill. Name it in lowercase words joined by hyphens, like `weekly-summary`.',
        },
        {
          t: 'do',
          label: 'A complete SKILL.md',
          cmd: '---\ndescription: Turn my rough weekly notes into a status update.\n---\n\n1. Read the notes file I point you at.\n2. Group the notes by project.\n3. Write three bullets for each project.\n4. Keep the whole thing under 200 words.',
        },
        {
          t: 'term',
          word: 'Description',
          means: 'The one line Claude reads to decide when your skill applies.',
        },
        {
          t: 'p',
          text: 'Write that line as a trigger, not a title. It decides whether your skill ever gets used.',
        },
        {
          t: 'p',
          text: 'You do not have to write the file yourself. Ask Claude, then read what it wrote.',
        },
        {
          t: 'do',
          label: 'Ask Claude to set it up',
          cmd: 'Create a skill called weekly-summary.\nUse it when I ask for my weekly update.\nSteps: read my notes, group them by project,\nthree bullets each, under 200 words.',
        },
        {
          t: 'warn',
          text: 'Never write "make it good". Write what good means: the length, the order, the format.',
        },
        {
          t: 'p',
          text: 'Four things separate a skill people use from one that sits there.',
        },
        {
          t: 'table',
          rows: [
            {
              dimension: 'The description line',
              doThis:
                'List the words a real person would say when they need this, including the ones that never mention the obvious keyword.',
              notThis:
                'Write it like a filename, such as "PDF handling". A skill nobody triggers is a skill nobody has.',
            },
            {
              dimension: 'What goes inside',
              doThis:
                'Only what Claude cannot guess: your exact format, the order of the steps, and one worked example.',
              notThis:
                'Repeat the task back at it. "Write clear professional copy" is the request, not the recipe.',
            },
            {
              dimension: 'How long it is',
              doThis:
                'Keep the file to the path everyone takes. Put the rare exceptions in a separate file beside it.',
              notThis:
                'Pack everything in, so the once-a-year exception loads every time and buries what matters.',
            },
            {
              dimension: 'Who keeps it true',
              doThis:
                'Give the skill the same owner as the task it describes, and update it when the task changes.',
              notThis:
                "Leave it unowned. A skill that teaches last year's steps is confidently wrong, in your name.",
            },
          ],
        },
        { t: 'video', title: 'Writing a skill file from scratch' },
      ],
      tasks: [
        'Define your skill: the steps in order, and the answer you want back',
        'Create it as `SKILL.md`, named in lowercase with hyphens',
        'Write the description as a trigger, not a title',
      ],
    },
    {
      title: "Yours everywhere, or the team's",
      kind: 'exercise',
      minutes: 6,
      brief:
        'A skill can live with you, with one project, or in the Claude app you use. Where you put it decides who gets it.',
      body: [
        {
          t: 'p',
          text: 'Where a skill lives decides who can use it. There are three homes, so choose on purpose.',
        },
        {
          t: 'do',
          label: 'Yours, in every project',
          cmd: '~/.claude/skills/weekly-summary/SKILL.md',
        },
        {
          t: 'p',
          text: 'This one follows you. It works in every project on your machine, and nobody else gets it. Use it for skills about the way you work.',
        },
        {
          t: 'do',
          label: "The team's, in one project",
          cmd: '.claude/skills/release-notes/SKILL.md',
        },
        {
          t: 'p',
          text: 'This one lives inside the project and goes into git with the code. Everyone on that project gets it, and it follows you nowhere else.',
        },
        {
          t: 'p',
          text: 'One question decides between those two. Is this skill about how you work, or about how this project works?',
        },
        {
          t: 'p',
          text: 'Both of those folders are for Claude Code. If you use Claude in the browser or in the desktop app, there are no folders at all. You upload the skill instead.',
        },
        {
          t: 'p',
          text: 'In the browser, open Customize, then Skills, then Upload a skill. In the desktop app, open Settings, then Skills. Both take the skill folder as a .zip file.',
        },
        {
          t: 'why',
          text: 'The same `SKILL.md` works in all three homes. Better still, an owner can upload a skill once under Organization settings, and everyone in the company gets it. That is the fastest way to make a whole team do a task the same way.',
        },
        {
          t: 'warn',
          text: 'Two traps. In the apps, someone has to switch on code execution and file creation for your organisation first, or an uploaded skill will not run. In Claude Code, if the same name sits in both folders, your personal one wins and the team version is ignored.',
        },
      ],
      tasks: [
        'Decide whether the skill is about you, or about this project',
        'Put it in the folder you chose, or upload it in the app you use',
        'Share it so the team gets it',
      ],
      verify: 'The skill runs in the place you chose, and its name is not used in the other folder.',
    },
    {
      title: 'Run it and fix the gaps',
      kind: 'verify',
      minutes: 9,
      brief: 'The first run always reveals what you left in your head instead of in the file.',
      body: [
        {
          t: 'p',
          text: 'Now call the skill by name. Type a slash and the name you gave it.',
        },
        { t: 'do', label: 'Run your skill', cmd: '/weekly-summary' },
        {
          t: 'see',
          text: 'Claude works through your file. Watch for the moment it guesses, or asks you a question that the file should have answered.',
        },
        {
          t: 'p',
          text: 'Read every question and every wrong turn as a gap in your writing. A question means a missing sentence. A wrong turn means a vague one. Go back to the file and fix it.',
        },
        {
          t: 'p',
          text: 'Then run it again. Keep going until two runs in a row need no extra help from you.',
        },
        {
          t: 'why',
          text: 'A skill you fixed twice is worth more than one you wrote perfectly once. The second clean run proves the instructions are complete — not just that you remembered the missing bits in the moment.',
        },
      ],
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
      minutes: 3,
      brief: 'A long chat gets worse, not better. Once you know why, the fix is free.',
      body: [
        {
          t: 'p',
          text: 'Talk to Claude long enough and it starts losing the plot. It forgets what you agreed. It repeats itself. It makes silly mistakes it was not making an hour ago.',
        },
        { t: 'p', text: 'Claude is not tired. The desk is full.' },
        {
          t: 'p',
          text: 'Claude works at a desk. Everything you say, every file it opens, and every answer it writes goes on as another sheet of paper. The desk has a size. When it fills, the oldest sheets slide off the edge, and the one you needed may be the one that fell.',
        },
        {
          t: 'term',
          word: 'Context window',
          means: "The size of Claude's desk.",
        },
        {
          t: 'term',
          word: 'Token',
          means: 'How desk space is counted. A million tokens is about half a million words.',
        },
        {
          t: 'term',
          word: 'Cost',
          means: 'The price of the paper. Writing costs about five times more than reading.',
        },
        {
          t: 'p',
          text: 'More is on that desk than you put there: every file Claude opens, every command it runs, your `CLAUDE.md`, and every skill and connector you have switched on. Your questions are the smallest sheets on it.',
        },
        {
          t: 'term',
          word: 'MCP server',
          means:
            'A connector. It is the medium between Claude and another system, like a ticket tracker or your calendar.',
        },
        {
          t: 'p',
          text: 'A connector reaches things Claude cannot, which is exactly why it takes room. One you switched on months ago and forgot has been paying rent on your desk ever since.',
        },
        {
          t: 'why',
          text: 'Anthropic says it plainly: as the desk fills, Claude starts forgetting instructions and making more mistakes. A clear desk is the cheapest upgrade you will ever get.',
        },
        {
          t: 'p',
          text: 'Someone pays for the paper, too. Claude re-reads the whole desk every time you press enter, so the bill follows the length of the chat, not the difficulty of the question.',
        },
        {
          t: 'p',
          text: 'Two habits fall out of that. Name the file you mean, or Claude goes hunting and stacks the desk high on the way. And write your project a map once, so every session starts knowing where things live instead of asking you again.',
        },
        { t: 'do', label: 'If you use Claude Code', cmd: '/context' },
        {
          t: 'see',
          text: 'A coloured grid: what is on the desk, and how much room is left.',
        },
        {
          t: 'warn',
          text: 'When the desk is nearly full, Claude Code tidies it and swaps your history for a summary. A summary is not the original. The costly habit is not asking too much. It is never starting fresh.',
        },
      ],
      tasks: [],
    },
    {
      title: 'Watch the context fill',
      kind: 'exercise',
      minutes: 14,
      brief: 'See it happen in a real session rather than taking it on faith.',
      body: [
        {
          t: 'p',
          text: 'You have read the theory. Now watch the desk fill up in one of your own sessions.',
        },
        { t: 'do', label: 'Before you ask anything', cmd: '/context' },
        {
          t: 'see',
          text: 'A mostly empty grid. Note how much is already used before you have said a word. That part is your skills, your connectors and your `CLAUDE.md`.',
        },
        {
          t: 'p',
          text: 'Now do ten minutes of real work. Ask Claude to read some files. Let it run a few commands. Do not tidy up as you go.',
        },
        { t: 'do', label: 'After the work', cmd: '/context' },
        {
          t: 'see',
          text: 'The same grid, much fuller, and now you can see which sheets took the room. It is almost never your questions.',
        },
        {
          t: 'p',
          text: 'Now put a number on it. Type the last thing you asked Claude into the box below, and compare the two bottom rows.',
        },
        { t: 'calc' },
        {
          t: 'why',
          text: 'Reading that a full desk costs more is easy to nod along to. Watching your own session go from nearly empty to nearly full in ten minutes is the thing that actually changes how you work.',
        },
        {
          t: 'warn',
          text: 'No terminal? You can still do this. Work in one long chat until Claude forgets something you told it near the start, and note how far in that happened. That moment is the desk overflowing.',
        },
        { t: 'video', title: 'Watching the context fill in one session' },
      ],
      tasks: [
        'Run `/context` before you start, and note how full the desk already is',
        'Do ten minutes of real work without tidying up',
        'Run `/context` again and name what took the most room',
      ],
    },
    {
      title: 'Three cheaper habits',
      kind: 'read',
      minutes: 6,
      brief: 'Small habits beat clever optimisations.',
      body: [
        {
          t: 'p',
          text: 'None of this needs a clever trick. Here are six small habits. Pick the three you will actually do.',
        },
        { t: 'do', label: 'Between two unrelated jobs', cmd: '/clear' },
        {
          t: 'p',
          text: 'A clear desk. Your project map and your instructions stay. The conversation goes, and you can always go back to it later.',
        },
        { t: 'do', label: 'When you need the thread but not the clutter', cmd: '/compact' },
        {
          t: 'p',
          text: 'Claude replaces the history with a summary and carries on. Use it inside one long job. Use `/clear` between two different ones.',
        },
        {
          t: 'p',
          text: 'Name the file or the folder you mean. A vague question makes Claude search, and searching is what fills the desk.',
        },
        {
          t: 'p',
          text: 'Index the project you are working in. Point Claude at the folder, and write the map of it once: what lives where, and how the thing is put together. Every session you open in that folder then starts knowing the layout, so you get better answers without repeating yourself.',
        },
        {
          t: 'p',
          text: 'Match the model to the job. A cheaper model is plenty for routine work, and you keep the expensive one for the work that needs it.',
        },
        {
          t: 'p',
          text: "Switch off the connectors you're not using this week. They sit on the desk every turn whether you use them or not, and a cluttered desk makes the model reach for the wrong thing.",
        },
        {
          t: 'why',
          text: 'Every one of these is free and takes seconds. Together they beat any clever prompt, because they change what Claude is looking at rather than how you ask.',
        },
      ],
      tasks: [],
    },
  ],

  /* 8 — Tell Claude What Done Means --------------------------------------- */
  [
    {
      title: 'Result, done, tools, limits',
      kind: 'read',
      minutes: 5,
      brief:
        'Four things make a request work: the result you want, how you will know it is done, what Claude may use, and what it must not touch.',
      body: [
        {
          t: 'p',
          text: 'Most disappointing answers are not the model going wrong. They come from a request that never said what finished looks like.',
        },
        {
          t: 'p',
          text: 'Four parts fix that. Put them in and you get what you pictured. Leave them out and Claude fills the gaps with guesses.',
        },
        {
          t: 'term',
          word: 'Result',
          means: 'What you want to end up with. A thing, not a topic.',
        },
        {
          t: 'term',
          word: 'Done',
          means: 'How you will know it worked. The test you are going to apply.',
        },
        {
          t: 'term',
          word: 'Tools',
          means: 'What Claude may use and touch to get there.',
        },
        {
          t: 'term',
          word: 'Limits',
          means: 'What it must leave alone, however tempting.',
        },
        { t: 'p', text: 'Here is the same ask, twice.' },
        { t: 'do', label: 'The vague version', cmd: 'Tidy up the expenses spreadsheet.' },
        {
          t: 'do',
          label: 'The same ask, four parts',
          cmd: 'Result: one row per expense, with a category on each.\nDone when: every row has a category and the total\n  still matches the old total.\nYou may use: the expenses sheet in this folder.\nDo not touch: the original file. Work on a copy.',
        },
        {
          t: 'see',
          text: 'The second one is hard to get wrong. You have said what to make, how you will check it, where to look, and what to leave alone.',
        },
        {
          t: 'warn',
          text: 'Done is the part everyone skips. It is also the only one that turns "looks about right" into "that is correct".',
        },
        { t: 'p', text: 'Your turn. Fill in the four boxes and the request writes itself.' },
        { t: 'builder' },
      ],
      tasks: [],
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

  /* 9 — Beyond Text ------------------------------------------------------- */
  [
    {
      title: 'What it can do beyond text',
      kind: 'read',
      minutes: 5,
      brief:
        'Text in, text out is the baseline. The rest changes the answer to a better question: is Claude even the right tool for this job?',
      body: [
        {
          t: 'p',
          text: 'Most people only ever type and read. These four are the ones worth knowing about, because each one moves a job from "Claude tells me how" to "Claude does it".',
        },
        {
          t: 'term',
          word: 'Web search',
          means:
            'Looks things up as they are now, not as they were when it was trained. It tells you what it found and where.',
        },
        {
          t: 'term',
          word: 'Files it makes',
          means:
            'Real spreadsheets, documents, slides and PDFs that you download and open. Not a description of one.',
        },
        {
          t: 'term',
          word: 'Artifacts',
          means:
            'Small working things built in front of you: a calculator, a chart, a one-page tool. They run beside the conversation.',
        },
        {
          t: 'term',
          word: 'Connectors',
          means:
            'Links to services you already use, so Claude works with your real calendar, files or tickets instead of a description of them. Topic 7 called one of these an MCP server.',
        },
        {
          t: 'p',
          text: 'Nearly all of this lives in the browser and the desktop app, not the terminal. Web search and file making are not in Claude Code at all. Web search also starts switched off, so if you cannot see it, that is a setting rather than a missing feature.',
        },
        {
          t: 'warn',
          text: 'Features change often, and Claude does not know which ones it has today. Ask it and you get an answer from what it learned during training, which is already out of date. Check the help pages, or ask whoever runs your account.',
        },
      ],
      tasks: [],
    },
    {
      title: 'Make a real file',
      kind: 'exercise',
      minutes: 8,
      brief: 'Ask for the thing itself, not a description of the thing.',
      body: [
        {
          t: 'p',
          text: 'The quickest way to feel the difference is to make Claude hand you something you can open.',
        },
        {
          t: 'p',
          text: "Find a small pile of messy data. Last month's expenses, a list of sign-ups, notes from three meetings. Anything untidy and real.",
        },
        {
          t: 'do',
          label: 'Ask for the file, not a description of it',
          cmd: 'Turn this into a spreadsheet with the totals worked out.\nGive me the file to download.',
        },
        {
          t: 'see',
          text: 'A file appears in the conversation with a download button. Download it and open it. The sums are already done.',
        },
        {
          t: 'warn',
          text: 'The common mistake is accepting a table in the chat window instead. A table you have to copy out by hand is not a spreadsheet. Ask again, and say you want the file.',
        },
        {
          t: 'why',
          text: 'This is the line between Claude describing your work and Claude doing it. Once you have opened one file it made, you stop asking for instructions you then have to follow yourself.',
        },
      ],
      tasks: [
        'Find a small pile of messy data',
        'Ask for a real file, not a table in the chat',
        'Download it and open it',
      ],
      verify: 'You have a file on your machine that Claude made, with the work already done in it.',
    },
    {
      title: 'Which tasks need live information',
      kind: 'note',
      minutes: 4,
      brief: 'One judgement, and it decides which tool you reach for.',
      body: [
        {
          t: 'p',
          text: 'Some of your work needs the world as it is today: prices, a rival\'s website, this week\'s numbers, anything that changed after the model was trained. That work needs search switched on, or it needs you.',
        },
        {
          t: 'p',
          text: 'Most of your work does not. Rewriting, summarising, tidying, formatting, drafting. The material is already in front of it.',
        },
        {
          t: 'why',
          text: 'Knowing which is which prevents both mistakes: trusting a confident answer about something current, and reaching for a search you never needed.',
        },
      ],
      tasks: [
        'Write down two of your tasks that need current information',
        'Write down two that do not',
      ],
    },
  ],

  /* 10 — Think Before You Paste ------------------------------------------- */
  [
    {
      title: 'The rule',
      kind: 'read',
      minutes: 4,
      brief: 'One line will keep you out of most trouble. Three specifics follow from it.',
      body: [
        {
          t: 'p',
          text: 'This part is short. It is not optional. The rest of the course is about getting more out of Claude. This is about not creating a problem while you do it.',
        },
        {
          t: 'term',
          word: 'The rule',
          means:
            'Do not put anything into Claude that you would not put into a Google search.',
        },
        { t: 'p', text: 'Three specifics follow from it.' },
        {
          t: 'term',
          word: 'Client and confidential information',
          means:
            "Find out what your organisation's policy actually is, not what you assume it is. Ask before you paste.",
        },
        {
          t: 'term',
          word: "Other people's personal data",
          means:
            'Names, health details, salaries, performance issues. Anything about someone who did not agree to it. Take it out, or leave it out.',
        },
        {
          t: 'term',
          word: 'Credentials',
          means: 'Never paste a password, a key, or an access token. Not anywhere, not once.',
        },
        {
          t: 'warn',
          text: 'The rule is a floor, not a ceiling. Plenty of people search for things they would not want read back to them, so it does not excuse a bad decision.',
        },
      ],
      tasks: [],
    },
    {
      title: 'Find your actual policy',
      kind: 'exercise',
      minutes: 8,
      brief: 'Most people follow the policy they assume exists. Go and read the real one.',
      body: [
        {
          t: 'p',
          text: 'Most people follow a policy they have never read. They follow the version they imagine, which is usually too strict in the places that do not matter and too loose in the ones that do.',
        },
        {
          t: 'p',
          text: 'So go and find the real one. It takes ten minutes once, and then you stop guessing every time you paste something.',
        },
        {
          t: 'p',
          text: 'Come back with three things. Which AI tools are approved for work. What you are allowed to put into them. Whether there is a company account, and whether its terms differ from the free version.',
        },
        {
          t: 'why',
          text: 'The terms are the whole point. A company account and a free personal one can handle your text very differently, and that difference is exactly what your policy turns on.',
        },
        {
          t: 'warn',
          text: 'If you cannot find a written policy, that is an answer too. Ask your manager, or whoever owns data protection, and get the answer in writing.',
        },
      ],
      tasks: [
        "Find your organisation's written policy on AI tools",
        'Write down which tools are approved, and what you may put in them',
        'If you cannot find it, ask someone who would know',
      ],
      verify:
        'You can name the tool you are allowed to use, and one thing you are not allowed to put in it.',
    },
    {
      title: 'Whose work is it',
      kind: 'read',
      minutes: 4,
      brief: 'Two things follow the work, not the tool.',
      body: [
        {
          t: 'p',
          text: 'Attribution. The norms differ. Some places expect you to say when AI helped. Some do not care at all. Academic and regulated settings often have firm rules. When you are not sure, ask first rather than find out afterwards.',
        },
        {
          t: 'p',
          text: 'Ownership. You are responsible for what you send, whatever produced it. If it goes out with your name on it, it is yours.',
        },
        {
          t: 'why',
          text: '"The AI wrote it" has never once worked as a defence. Read it before you send it, the same as you would anything else with your name on it.',
        },
      ],
      tasks: [],
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
    title: 'Beyond Text',
    goal: 'Know what Claude can do besides write back to you, and which of your tasks needs live information',
    biome: 'tundra',
    accent: '#C9E4E7',
    accentInk: '#2A4B50',
  },
  {
    title: 'Think Before You Paste',
    goal: "Know what you must never put into an AI tool, and find out what your own organisation actually allows",
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
  { number: 3, name: 'Using It Well', topicNumbers: [8, 9, 10] },
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
