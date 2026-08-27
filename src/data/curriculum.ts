import type { IslandBiome } from '../art/FloatingIsland';

/* Internal AI-learning curriculum, arranged as a journey:
   Path  ->  Topic  ->  Step
   Progress is a single cursor into that ladder. */

export type StepKind = 'read' | 'exercise' | 'verify' | 'note';

/* The teaching content of a step, as a short scrollable document. The reader is
   not a developer, so every block renders as a visually distinct thing rather
   than as another paragraph in a wall of prose.

   Backticked spans render as inline code, and [label](https://url) renders as a
   link, in the prose fields — `p.text`, `why.text`, `tip.text`, `term.means`,
   `see.text`, `warn.text`, the three `table` cell fields, and a step's own
   `brief`, `tasks` and `verify`. Neither works in `do.label`, `do.cmd`,
   `term.word`, `track.label` or `video.title`, which are labels: write those as
   plain text or the markup appears on screen. */
export type Block =
  /** Plain prose. Keep it to two or three short sentences. */
  | { t: 'p'; text: string }
  /** Why this matters to the reader. Use sparingly — once per step at most. */
  | { t: 'why'; text: string }
  /** A word the reader may not know, defined in one line. Pass
      `collapsed: true` to fold the definition behind the word, for a run of
      terms a reader can skip if they already know them. */
  | { t: 'term'; word: string; means: string; collapsed?: boolean }
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
  /** A titled box grouping related blocks under a sub-header. Use for a run of
      terms or steps that belong together. */
  | { t: 'panel'; heading: string; blocks: Block[] }
  /** A short bullet list. For a handful of few-word points, usually answering a
      question posed in the `p` above it. Not for prose — keep items to a line. */
  | { t: 'list'; items: string[] }
  /** A helpful aside: an extra route, a shortcut, an optional detail. Emits a
      fixed heading like `why` and `warn`, so keep it to one per step. */
  | { t: 'tip'; text: string }
  /** A labelled collapsible holding nested blocks. Closed by default — pass
      `open: true` for a branch the reader should see without clicking. Keep
      `why` and `warn` outside a track: they emit fixed headings, so one in
      each branch reads as a duplicate. */
  | { t: 'track'; label: string; blocks: Block[]; open?: boolean }
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
        'Claude Code is an agent that works in your system, not on a website. When given access, it can read and change the files in it.',
      body: [
        {
          t: 'p',
          text: 'When you want to give a file to Claude, you upload to the website. With Claude Code, the agent comes to your files to work on them.',
        },
        {
          t: 'p',
          text: 'Because Claude can read your files, its answers about your work are more accurate rather than a generic example',
        },
        {
          t: 'panel',
          heading: 'Some useful terms you might not know:',
          blocks: [
            {
              t: 'term',
              word: 'Terminal',
              collapsed: true,
              means: 'The text window on your computer where you type commands instead of clicking. Claude Code lives here.',
            },
            {
              t: 'term',
              word: 'Agent',
              collapsed: true,
              means: 'An AI model that can do more than just chat, it can read, write and run things.',
            },
            {
              t: 'term',
              word: 'Working directory',
              collapsed: true,
              means: 'The single folder you started Claude in. It is the whole of what Claude can see.',
            },
          ],
        },
        {
          t: 'p',
          text: 'So what can you do with Claude Code that you cannot do with Claude in a browser?',
        },
        {
          t: 'list',
          items: [
            'Create entire applications from scratch with one prompt',
            'Search and understand a large codebase in just a few minutes.',
            'Organise folders and scan for issues across many documents',
            'Make changes for you without having to copy-and-paste or download a file',
          ],
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'There are two main ways to run Claude Code and you only need one. Pick the terminal if you are comfortable there, otherwise install Visual Studio Code (a coding environment) for a friendlier interface where you can install Claude Code as an extension',
        },
        {
          t: 'tip',
          text: 'There are more ways to install and run it. The official steps live in the [Claude Code quickstart](https://code.claude.com/docs/en/quickstart).',
        },
        {
          t: 'track',
          label: 'In the terminal',
          blocks: [
            {
              t: 'p',
              text: 'One line, depending on the machine.',
            },
            {
              t: 'do',
              label: 'macOS, Linux or WSL',
              cmd: 'curl -fsSL https://claude.ai/install.sh | bash',
            },
            {
              t: 'do',
              label: 'Windows PowerShell',
              cmd: 'irm https://claude.ai/install.ps1 | iex',
            },
            {
              t: 'do',
              label: 'Or, if you already have Node',
              cmd: 'npm install -g @anthropic-ai/claude-code',
            },
            { t: 'do', label: 'Then check it is really there', cmd: 'claude --version' },
            {
              t: 'see',
              text: 'A version number. If you get `command not found` instead, the install did not finish the job — the files may be on the machine, but your terminal cannot see them.',
            },
            {
              t: 'video',
              title: 'Installing Claude Code in the terminal',
              src: '/demos/claude_install_terminal.mp4',
            },
          ],
        },
        {
          t: 'track',
          label: 'In Visual Studio Code',
          blocks: [
            {
              t: 'p',
              text: 'Open the Extensions panel, search for Claude Code, and install it. The video below walks through the process.',
            },
            { t: 'video', title: 'Installing the Claude Code extension in Visual Studio Code', src: '/demos/claude_install_vsc.mp4',},
          ],
        },
      ],
      tasks: [
        'Install Claude Code, either in the terminal or as the Visual Studio Code extension',
        'If installed in the terminal, run `claude --version` to see which version you are on',
      ],
    },
    {
      title: 'Find it and sign in',
      kind: 'exercise',
      minutes: 6,
      brief: 'Open Claude where you installed it and sign in once. Until this works, nothing else will.',
      body: [
        {
          t: 'p',
          text: 'Signing in happens once on a machine. The videos cover the whole flow, so watch the one that matches how you installed it.',
        },
        {
          t: 'tip',
          text: 'Sign in at [claude.ai](https://claude.ai). If you are on Claude Enterprise, you sign in on the web through UKI Okta.',
        },
        {
          t: 'track',
          label: 'In the terminal',
          blocks: [
            { t: 'do', label: 'Start it', cmd: 'claude' },
            {
              t: 'see',
              text: 'A sign-in prompt. Follow it, your browser opens, and you come back to the same terminal window when it is done.',
            },
            {
              t: 'p',
              text: 'Customise your UI, read the security notes carefully, and keep the recommended settings for now.',
            },
            { t: 'video', title: 'Signing in from the terminal', src: '/demos/claude_login_terminal.mp4', },
          ],
        },
        {
          t: 'track',
          label: 'In Visual Studio Code',
          blocks: [
            {
              t: 'p',
              text: 'Open the Claude panel from the sidebar and sign in from there.',
            },
            {
              t: 'p',
              text: 'Press "+ New Session" and send your first message!',
            },
            { t: 'video', title: 'Opening the extension and signing in', src: '/demos/claude_login_vsc.mp4' },
          ],
        },
        {
          t: 'p',
          text: 'There is more than one way in: Claude Enterprise through your organisation, a personal subscription, or an API key. Use whichever method your team issues',
        },
        {
          t: 'warn',
          text: 'Never use Claude Code on a directory containing work files if authenticated with a personal subscription.',
        },
        {
          t: 'track',
          label: 'Did you know...',
          open: false,
          blocks: [
            {
              t: 'p',
              text: 'If you have both installed, you can open the terminal from inside the Visual Studio Code extension — so you never have to pick one for good.',
            },
            {
              t: 'video',
              title: 'Using the terminal from inside the extension',
              src: '/demos/claude_use_both.mp4',
            },
          ],
        },
      ],
      tasks: [
        'Open Claude — in the terminal, or from the Visual Studio Code panel',
        'Sign in with the method your team uses',
      ],
      verify: "Claude answers a plain 'hello' without an authentication error.",
    },
    {
      title: 'Open a real project',
      kind: 'exercise',
      minutes: 8,
      brief:
        'Point Claude at an actual folder of yours, not a scratch directory. The whole point is that it works on real material.',
      body: [
        {
          t: 'p',
          text: 'Most people try a new tool somewhere simple first. Go for something you know well thats not easy to understand.',
        },
        {
          t: 'track',
          label: 'In the terminal',
          blocks: [
            {
              t: 'do',
              label: 'Go to a project you know well',
              cmd: 'cd ~/projects/your-project\nclaude',
            },
            {
              t: 'see',
              text: 'Claude starts and names the folder it is working in. Read that line — it should be your project, not your home folder.',
            },
          ],
        },
        {
          t: 'track',
          label: 'In Visual Studio Code',
          blocks: [
            {
              t: 'p',
              text: 'Open the folder in Visual Studio Code first. Whichever folder is open is the one Claude works in.',
            },
            { t: 'video', title: 'How to open a project folder in Visual Studio Code', src: '/demos/open_dir_vsc.mp4', },
          ],
        },
        {
          t: 'do',
          label: 'Ask it something only that folder can answer',
          cmd: 'What is in this folder?',
        },
        {
          t: 'see',
          text: 'Claude lists files that genuinely exist in that folder. If it names things you do not recognise, it has access to the wrong folder.',
        },
        {
          t: 'why',
          text: 'You know your own project, so you are the one person who can catch Claude being confidently wrong about it. In a folder you have never seen, every answer looks plausible.',
        },
        {
          t: 'warn',
          text: 'On work laptops and projects, use Claude Enterprise to authenticate where possible - topic 10 covers why this matters.',
        },
      ],
      tasks: [
        '`cd` into a project folder you know well',
        'Start `claude`',
        "Ask: 'What is in this folder?'",
      ],
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
      body: [
        {
          t: 'p',
          text: 'A chat window gives you advice. You then do the work of getting that advice to wherever it needed to go.',
        },
        {
          t: 'p',
          text: 'An agent does that work instead. It is the same model — not newer, not faster, not cheaper per message. It has just moved to where your files are.',
        },
        {
          t: 'table',
          rows: [
            {
              dimension: 'Work spread over many files',
              doThis: 'The agent. Renaming one key across twelve files is twelve edits, none of them yours.',
              notThis: 'Paste the files into a chat one at a time. The twelfth will get missed.',
            },
            {
              dimension: 'General explanation',
              doThis: 'A chat. What a closure is has nothing to do with your project.',
              notThis: 'Open a terminal in a project to ask a question that has no project in it.',
            },
            {
              dimension: 'Short writing',
              doThis: 'A chat. Drafting an email, or summarising something you pasted in, needs no access to anything.',
              notThis: 'Reach for the agent because it is the newer tool. Nothing on disk needs to change.',
            },
            {
              dimension: 'Anything that changes files',
              doThis: 'The agent, it can do it for you. You can also undo work with /rewind command',
              notThis: 'Assume advice and action carry the same risk. On disk, a wrong answer is a wrong file.',
            },
          ],
        },
        {
          t: 'warn',
          text: 'An agent is less likely to be wrong because its answer is grounded within your files, but that carries greater risk as it can actually make changes to your files.',
        },
      ],
      tasks: [
        'Read the comparison',
        'List two things you currently copy-paste that an agent could just do',
      ],
    },
    {
      title: 'Build something to work on',
      kind: 'exercise',
      minutes: 12,
      brief:
        'Have the agent build a small folder of work, then ask it the same question you asked a browser chat. Everything from here uses this folder.',
      body: [
        {
          t: 'p',
          text: 'You need something real to work on for the next four topics. Have the agent build it — which is itself the demonstration.',
        },
        {
          t: 'do',
          label: 'Ask the agent to make it',
          cmd: 'Create a folder called handover with three\n  short meeting notes, week-1.md to week-3.md,\n  and a costs.csv of six expenses. Have one\n  note mention a vendor renewal.',
        },
        {
          t: 'see',
          text: 'The files exist on disk. It did not describe them to you and you did not paste anything.',
        },
        { t: 'p', text: 'Now the comparison. Same question, asked in both places.' },
        {
          t: 'do',
          label: 'A browser chat, nothing attached',
          cmd: 'Which week mentions the vendor renewal?',
        },
        { t: 'see', text: 'It cannot know. It has never seen the folder.' },
        {
          t: 'do',
          label: 'The agent, inside that folder',
          cmd: 'Which week mentions the vendor renewal?',
        },
        { t: 'see', text: 'The filename, and the line it is on.' },
      ],
      tasks: [
        'Ask the agent to create the `handover` folder and its files',
        'Ask a browser chat which week mentions the renewal',
        'Ask the agent the same question, inside the folder',
      ],
      verify:
        'The `handover` folder exists, and you can point at a concrete difference between the two answers.',
    },
    {
      title: 'What this changes for you',
      kind: 'note',
      minutes: 5,
      brief: "Write down what you'd now use an agent for that you would not have used chat for.",
      body: [
        {
          t: 'p',
          text: 'One task. Not a list — one thing you did by hand this month that an agent could have done.',
        },
        {
          t: 'p',
          text: 'The good ones are dull, touch more than one file, and have a result you could check at a glance.',
        },
        {
          t: 'why',
          text: 'Habits change when one real task moves across, not when you are convinced in principle. The boring choice is the one that sticks.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Almost every bad edit starts the same way: someone changed a file based on what they were sure was in it.',
        },
        {
          t: 'p',
          text: 'Claude does this too, and fluently. Asked to change a setting, it can produce a confident edit to a file it never opened — one that would have been right, if the file had looked the way it assumed.',
        },
        {
          t: 'p',
          text: 'So: read, then write. It opens the file before changing it, and you look at what it found before you agree.',
        },
        {
          t: 'warn',
          text: 'Reading first is not about saving money, and it is not warming anything up. It is the only thing that makes the edit about the real file rather than a plausible one.',
        },
      ],
      tasks: ['Read the guidance on reading before editing'],
    },
    {
      title: 'Have Claude read something real',
      kind: 'exercise',
      minutes: 8,
      brief:
        'Ask Claude to explain one of the notes you just made. You are testing the reader, not learning the file.',
      body: [
        {
          t: 'p',
          text: 'Before letting Claude change anything, find out how well it reads. Use a note from the pack, so you already know the answer.',
        },
        {
          t: 'do',
          label: 'Ask it to read one',
          cmd: 'Summarise week-2.md and tell me what it\n  commits us to.',
        },
        {
          t: 'see',
          text: 'A summary you can mark against the file. Look for the parts that are subtly off, not the obviously wrong ones.',
        },
        {
          t: 'why',
          text: 'The obvious errors you will catch anyway. What you are calibrating against is the confident half-truth: the right shape with a wrong detail inside it.',
        },
      ],
      tasks: ['Read `week-2.md` yourself first', 'Ask Claude to summarise it', 'Note anything it got wrong'],
      verify: 'You have compared its summary against what the file actually says.',
    },
    {
      title: 'Make one small edit',
      kind: 'exercise',
      minutes: 12,
      brief:
        'One small, obviously-correct change to the pack. Resist asking for a big tidy-up on your first go.',
      body: [
        {
          t: 'p',
          text: 'Two things make a first edit safe, and neither is about clever prompting.',
        },
        {
          t: 'p',
          text: 'One: a way back. Copy the `handover` folder somewhere before you start. That is a complete backup and it takes two seconds.',
        },
        {
          t: 'term',
          word: 'Diff',
          means: 'What changed: the file before, and the file now. The only honest account of an edit.',
        },
        {
          t: 'p',
          text: 'Two: ask small. One specific change you can check at a glance. Not "improve this", and not a tidy-up while it is in there.',
        },
        {
          t: 'do',
          label: 'Ask for exactly one thing',
          cmd: 'In week-2.md, change the date to 2026-03-11.\n  Change nothing else.',
        },
        {
          t: 'see',
          text: 'A diff showing one changed line. Read it, and check the second half of what you asked for too: that nothing else moved.',
        },
        {
          t: 'warn',
          text: 'Asking it to explain its plan first is a fine habit, but a plan is not a way back. If you only do one of the two, keep the backup.',
        },
        { t: 'video', title: 'Making one small edit and reading the diff' },
      ],
      tasks: [
        'Copy the `handover` folder somewhere as a backup',
        'Ask for one specific, small change',
        'Read the diff before you accept it',
      ],
      verify: 'The change is what you asked for, and nothing else changed.',
    },
    {
      title: 'Undo it cleanly',
      kind: 'exercise',
      minutes: 6,
      brief: 'Knowing how to get back is what makes everything else safe to try.',
      body: [
        {
          t: 'p',
          text: 'Undoing is the actual skill here. Knowing you can get back is what makes you willing to try the next thing.',
        },
        {
          t: 'p',
          text: 'Copy your backup over the top. If the folder is in version control, `git checkout` does the same job.',
        },
        { t: 'do', label: 'Then check nothing is left', cmd: 'git status' },
        {
          t: 'see',
          text: 'Nothing changed. If you backed up by copying instead, compare the two folders — they should match exactly.',
        },
        {
          t: 'warn',
          text: 'Practise this while the stakes are zero. The first time you need to undo something in a hurry should not also be the first time you have tried.',
        },
      ],
      tasks: ['Revert the edit', 'Confirm the note is back exactly where it started'],
      verify: 'The note is back as it was, by whichever route you used to restore it.',
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
      body: [
        {
          t: 'p',
          text: 'Claude states untrue things in exactly the voice it uses for true ones. No hedging, no tell, no change in tone.',
        },
        {
          t: 'term',
          word: 'Hallucination',
          means: 'A confident answer with nothing behind it. Not a lie, which would require knowing better, and not a bug.',
        },
        {
          t: 'p',
          text: 'Two things that feel like checks are not. Asking again and getting the same answer tells you it is stable, not that it is right — it can be consistently wrong all day. And asking how confident it is just produces another confident sentence.',
        },
        {
          t: 'warn',
          text: 'Fluency is not evidence. If a claim matters and you can check it in under a minute, check it, however sure it sounded.',
        },
      ],
      tasks: ['Read the note on plausible-sounding errors'],
    },
    {
      title: 'Go and find one',
      kind: 'exercise',
      minutes: 15,
      brief:
        'Ask about the numbers in your costs file, then check them yourself. You are here to catch it out once.',
      body: [
        {
          t: 'p',
          text: 'Go and catch it. Your own example will stick where a warning will not.',
        },
        {
          t: 'do',
          label: 'Ask something you can check',
          cmd: 'What is the total of all the amounts in\n  costs.csv?',
        },
        {
          t: 'see',
          text: 'A confident number. Now add the column up yourself. Do not skip that part — it is the whole exercise.',
        },
        {
          t: 'p',
          text: 'Right or wrong, ask something harder next: a single row, a date, the largest item. You are looking for the edge of what it actually knows, and harder questions find it. Asking the same question twice does not.',
        },
        {
          t: 'p',
          text: 'Then the claim people trust most — that something ran, and that it passed.',
        },
        {
          t: 'do',
          label: 'Make it show you, not tell you',
          cmd: 'Show me every row and the running total.',
        },
        {
          t: 'see',
          text: 'The actual rows. A total on its own is a summary of the file, and a summary is a claim like any other. The same goes for tests: "all tests pass" is not the test output.',
        },
        {
          t: 'why',
          text: 'Whether something passed is the highest-stakes cheap check there is. Most likely to be taken on trust, most expensive to get wrong, and the fix is nothing more than looking.',
        },
        { t: 'video', title: 'Catching a confident wrong answer in the costs file' },
      ],
      tasks: [
        'Ask for the total in `costs.csv`, then add it up yourself',
        'Ask something harder and check that too',
        'Ask it to show the rows rather than summarise them',
      ],
      verify: 'You have one concrete example of Claude being confidently wrong, written down.',
    },
    {
      title: "Where you'll check from now on",
      kind: 'note',
      minutes: 6,
      brief: 'Decide in advance which kinds of claim you will always verify.',
      body: [
        {
          t: 'p',
          text: 'General caution does not survive a busy week. A short list of claim types you always check does.',
        },
        {
          t: 'p',
          text: 'They share a shape: cheap to verify, expensive to get wrong. Totals. Version numbers. Whether a test passed. Anything you are about to repeat to someone else as fact.',
        },
        {
          t: 'why',
          text: 'Deciding now is what makes it automatic. With a good answer in front of you sounding right, you will only follow a rule you already had.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Every session starts from nothing. Close Claude, open it tomorrow, and it has forgotten the pack, your date format, all of it.',
        },
        {
          t: 'term',
          word: 'Session',
          means: 'One run of Claude, from opening it to closing it. Nothing carries into the next one by itself.',
        },
        {
          t: 'term',
          word: 'CLAUDE.md',
          means: 'A plain text file in your project. Standing instructions, read automatically at the start of every session.',
        },
        {
          t: 'p',
          text: 'It is not a log of your prompts, not a changelog of what changed, and not documentation for colleagues. It is written for Claude, and that changes what belongs in it.',
        },
        {
          t: 'warn',
          text: 'It is read every session, so every line in it costs something every session. That is why the last step of this topic is about deleting things.',
        },
      ],
      tasks: ["Read what belongs in CLAUDE.md and what doesn't"],
    },
    {
      title: 'Write your first one',
      kind: 'exercise',
      minutes: 12,
      brief:
        'Three or four rules about the pack that would otherwise need repeating every session.',
      body: [
        {
          t: 'p',
          text: 'Three or four rules. One test for whether something belongs: could Claude work it out by reading the files? If it could, leave it out.',
        },
        {
          t: 'table',
          rows: [
            {
              dimension: 'How to run things',
              doThis: 'The exact command, flags included. How to run the tests is the classic example, and usually the most valuable line in the file.',
              notThis: 'Leave it out because it is obvious to you. It is not obvious from the files.',
            },
            {
              dimension: 'What the files already say',
              doThis: 'Trust Claude to read. It can see the folder, the names and the contents.',
              notThis: 'List every file, or describe them one by one. It is re-read every session and it stopped being true weeks ago.',
            },
            {
              dimension: 'Decisions and constraints',
              doThis: 'What nobody could infer: your date format, which file is the source of truth, what must never be touched.',
              notThis: 'Restate the README. Copying it in just doubles what you have to keep true.',
            },
            {
              dimension: 'Length',
              doThis: 'Keep it to what changes behaviour. A short file that gets fully read beats a long one that gets skimmed.',
              notThis: 'Paste in everything that might one day help. Bloat crowds out the lines that matter.',
            },
          ],
        },
        {
          t: 'do',
          label: 'A complete first version',
          cmd: '# Notes for Claude\n\nAmounts in GBP, two decimals.\nDates as YYYY-MM-DD.\nAlways name the file a fact came from.',
        },
        {
          t: 'p',
          text: 'Three lines. None of them guessable from the files, and all of them things you would otherwise be repeating tomorrow.',
        },
        {
          t: 'why',
          text: 'Small and true beats thorough and ignored. Four rules that hold get followed. Forty get skimmed by Claude and never updated by you.',
        },
      ],
      tasks: [
        'Create `CLAUDE.md` in the `handover` folder',
        'Write 3–4 concrete rules about how the pack should be handled',
        'Leave out anything Claude can already read from the files',
      ],
    },
    {
      title: "Prove it's being used",
      kind: 'verify',
      minutes: 8,
      brief: "A rule you can't prove is being read is a rule you can't rely on.",
      body: [
        {
          t: 'p',
          text: 'Prove it once, properly. Fresh session, and no hinting — one mention of the rule in your prompt and you have tested nothing.',
        },
        { t: 'do', label: 'Start clean, then ask', cmd: 'Summarise week-3.md.' },
        {
          t: 'see',
          text: 'The summary names the file it came from, and the dates are formatted your way, without you asking. That is the rule working.',
        },
        {
          t: 'p',
          text: 'If not, the rule is usually buried in too much text, or written as a suggestion. Shorten it, make it an instruction, and test again.',
        },
        {
          t: 'warn',
          text: 'Claude saying it has read CLAUDE.md is not evidence. That is a claim, and topic 4 was about claims. The evidence is behaviour you did not ask for.',
        },
        { t: 'video', title: 'Proving a CLAUDE.md rule from a fresh session' },
      ],
      tasks: [
        'Start a completely fresh session',
        'Ask for something the rule applies to, without mentioning the rule',
        'Check it followed the rule anyway',
      ],
      verify: 'Claude followed a CLAUDE.md rule that you never mentioned in the prompt.',
    },
    {
      title: 'Keep it small',
      kind: 'note',
      minutes: 5,
      brief: 'A bloated CLAUDE.md gets ignored — by Claude and by you.',
      body: [
        {
          t: 'p',
          text: 'Read back what you wrote. Every line is read again at the start of every session, so every line should be earning that.',
        },
        {
          t: 'p',
          text: 'Cut anything Claude could read from the files, anything speculative, and anything you have never seen it act on. Unsure about a line? Delete it. You will notice soon enough if it mattered.',
        },
        {
          t: 'why',
          text: 'A bloated file fails quietly. Claude skims it, you stop trusting it, and nobody updates it. The small version is the one that stays true.',
        },
      ],
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
