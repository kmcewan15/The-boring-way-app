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
        'Claude Code is an agent that runs in your terminal, not on a website. It runs on your machine, in a folder you choose, and it can read and change the files in it.',
      body: [
        {
          t: 'p',
          text: 'You have probably used Claude in a browser tab. You describe a problem, it writes something back, and you copy the answer into wherever it actually needed to go.',
        },
        {
          t: 'p',
          text: 'Claude Code is not that. It runs on your own machine, in one folder you choose, and it opens and changes the files in that folder itself. There is no copying back.',
        },
        {
          t: 'term',
          word: 'Terminal',
          means: 'The text window on your computer where you type commands instead of clicking. Claude Code lives here.',
        },
        {
          t: 'term',
          word: 'Agent',
          means: 'An AI model that can do more than just chat, it can read, write and run things.',
        },
        {
          t: 'term',
          word: 'Working directory',
          means: 'The single folder you started Claude in. It is the whole of what Claude can see.',
        },
        {
          t: 'p',
          text: 'Nothing is uploaded. Your files stay where they are and Claude comes to them, which is the opposite of how a browser chat works. It is not a website, not a browser extension, and not a server you send your work to.',
        },
        {
          t: 'why',
          text: 'Every other topic rests on this one idea. Claude is standing in your folder looking at your real material, so its answers are about your work rather than a generic example. Its mistakes land on your real files for the same reason.',
        },
        {
          t: 'warn',
          text: 'Running on your machine is not the same as running unsupervised. Claude asks before it changes anything, and topic 3 is about keeping that habit rather than clicking through it.',
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
          text: 'Installing is the easy half. The half people skip is proving that it worked.',
        },
        {
          t: 'term',
          word: 'PATH',
          means: 'The list of places your terminal looks when you type a command. If Claude Code is not on it, your terminal will say it has never heard of `claude` — even though it is installed.',
        },
        {
          t: 'p',
          text: 'So an installer that finished tells you the files landed. It does not tell you that you can reach them. Only one thing does that.',
        },
        { t: 'do', label: 'Check it is really there', cmd: 'claude --version' },
        {
          t: 'see',
          text: 'A version number. If you get `command not found` instead, the install did not finish the job — the files may be on the machine, but your terminal cannot see them.',
        },
        {
          t: 'why',
          text: 'This is the first of many times you will be asked to prove something rather than assume it. A version number is evidence. A progress bar that reached the end is not.',
        },
        {
          t: 'warn',
          text: 'Do not go looking for an icon in your dock or taskbar, and do not check whether claude.ai loads in your browser. Neither one tells you anything about whether the command works. This tool has no window of its own.',
        },
      ],
      tasks: ["Install Claude Code following your team's instructions", 'Run `claude --version`'],
      verify: "`claude --version` prints a version number rather than 'command not found'.",
    },
    {
      title: 'Authenticate',
      kind: 'exercise',
      minutes: 6,
      brief: 'Sign in once so Claude can reach the API. Until this works, nothing else will.',
      body: [
        {
          t: 'p',
          text: 'Claude needs to know who you are before it will answer anything. This happens once on a machine, and then you can forget about it.',
        },
        { t: 'do', label: 'Start it', cmd: 'claude' },
        {
          t: 'see',
          text: 'A sign-in prompt. Follow it, your browser opens, and you sign in there — then come back to the terminal window you started in.',
        },
        {
          t: 'p',
          text: 'The terminal is waiting for the browser to finish. It carries on by itself once you are signed in, so there is nothing to run a second time.',
        },
        {
          t: 'warn',
          text: 'If your organisation sends you through its own sign-in page, that is expected. If signing in fails outright, stop and ask whoever set up your account rather than reinstalling — a reinstall does not fix a permissions problem.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Most people try a new tool somewhere harmless first. Do the opposite here.',
        },
        {
          t: 'p',
          text: 'The working directory is the whole of what Claude can see. Start it somewhere real and its answers are about your actual work. Start it in an empty folder and it has nothing to go on, so you get the same generic advice a browser chat would have given you.',
        },
        {
          t: 'do',
          label: 'Go to a project you know well',
          cmd: 'cd ~/projects/your-project\nclaude',
        },
        {
          t: 'see',
          text: 'Claude starts and names the folder it is working in. Read that line — it should be your project, not your home folder.',
        },
        {
          t: 'do',
          label: 'Ask it something only that folder can answer',
          cmd: 'What is in this folder?',
        },
        {
          t: 'see',
          text: 'A list of files that genuinely exist. If it names things you do not recognise, you are in the wrong folder.',
        },
        {
          t: 'p',
          text: 'None of this is a requirement, by the way. An empty folder works. A folder with no version control in it works. More files will not make Claude faster either. The only thing that matters is that the files are yours, so you can tell at a glance whether an answer is right.',
        },
        {
          t: 'why',
          text: 'This is the test you will use for the rest of the course. You know your own project, so you are the one person who can catch Claude being confidently wrong about it. In a folder you have never seen, every answer looks plausible.',
        },
        {
          t: 'warn',
          text: 'Pick a project you know well, but not the one carrying this quarter. You will be letting Claude change files in topic 3, and you want your first mistake to be a cheap one.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'You already know what a chat window does. You describe the problem, it writes something back, and then you do the work of getting that answer to wherever it needed to go.',
        },
        {
          t: 'p',
          text: 'An agent closes that gap. It opens the files itself, runs the commands itself, and hands you back a changed project rather than instructions for changing one.',
        },
        {
          t: 'p',
          text: 'It is worth being precise about what has not changed. It is not a better model, it is not faster, and it does not cost less per message. The model is the same one. What moved is where the work happens.',
        },
        { t: 'p', text: 'That makes some jobs obvious and others pointless.' },
        {
          t: 'table',
          rows: [
            {
              dimension: 'Work spread over many files',
              doThis:
                'Hand it to the agent. Renaming one config key across twelve files is twelve opens and twelve edits, and none of them are yours.',
              notThis:
                'Paste the files into a chat one at a time. You will lose track of where you are, and the twelfth one will get missed.',
            },
            {
              dimension: 'General explanation',
              doThis:
                'Ask in a chat. What a closure is has nothing to do with your project, so the folder adds nothing to the answer.',
              notThis:
                'Open a terminal inside a project to ask a question that has no project in it.',
            },
            {
              dimension: 'Short writing',
              doThis:
                'A chat is fine. Drafting an email, or summarising something you pasted in, needs no access to anything.',
              notThis:
                'Reach for the agent because it is the newer tool. Nothing on disk needs to change, so nothing is gained.',
            },
            {
              dimension: 'Anything that changes files',
              doThis:
                'The agent, with your work committed first. It can do it for you, so make sure you can undo it.',
              notThis:
                'Assume advice and action carry the same risk. On disk, a wrong answer is a wrong file.',
            },
          ],
        },
        {
          t: 'why',
          text: 'Most people carry their chat habits across and end up using an agent as a chat window with extra steps. The gain was never better answers. It is that nobody has to copy anything.',
        },
        {
          t: 'warn',
          text: 'Here is the part worth sitting with. An agent is no more likely to be wrong than the chat was — the accuracy did not change at all. What changed is that a wrong answer now lands in your files instead of on your screen. Same mistake, different blast radius.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Reading about the difference is not the same as seeing it on your own work. Ask one question in both places and compare what comes back.',
        },
        {
          t: 'p',
          text: 'Pick something specific enough to be checkable — where a setting lives, or which file decides some piece of behaviour you know well.',
        },
        {
          t: 'do',
          label: 'In a browser chat, with nothing attached',
          cmd: 'Where is the database connection configured\n  in my project?',
        },
        {
          t: 'see',
          text: 'A sensible, general answer about where such things usually live. It cannot name your file, because it has never seen your project.',
        },
        {
          t: 'do',
          label: 'In Claude Code, inside the project folder',
          cmd: 'Where is the database connection configured\n  in my project?',
        },
        {
          t: 'see',
          text: 'A filename, and probably a line number. You can go and open it.',
        },
        {
          t: 'p',
          text: 'That is the whole difference, in one pair of answers. The first told you how projects like yours tend to work. The second told you how yours actually does.',
        },
        {
          t: 'why',
          text: 'At some point you will have to explain to someone why this is worth their time. One concrete pair of answers from a project they recognise will do that better than any argument you could make.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'One task. Not a list and not a strategy — one thing you did by hand this month that an agent could have done, and that you are willing to hand over this week.',
        },
        {
          t: 'p',
          text: 'The good candidates look alike: dull, repetitive, spread across more than one file, and with a result you could check at a glance. If you could not check it quickly, it is a poor first thing to move.',
        },
        {
          t: 'why',
          text: 'Habits change when one real task moves across, not when you are convinced in principle. Pick the small dull one. The boring choice is the one that sticks.',
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
          text: 'Almost every bad edit starts the same way. Someone changed a file based on what they were sure was in it, rather than on what was actually in it.',
        },
        {
          t: 'p',
          text: 'Claude does this too, and it does it fluently. Asked to change a setting, it can produce a confident edit to a file it never opened — an edit that would have been correct, if the file had looked the way it assumed.',
        },
        {
          t: 'p',
          text: 'So the order matters. Read, then write. Claude opens the file before it changes it, and you look at what it found before you agree to the change.',
        },
        {
          t: 'p',
          text: 'Some tools do insist on a read before an edit, and that is a sensible guard. Treat it as your own habit rather than something the tool owes you, though — it is a good instinct even when nothing is enforcing it.',
        },
        {
          t: 'why',
          text: 'This is the cheapest habit in the course. Reading costs a few seconds. An edit built on a guess costs you the afternoon you spend working out what broke.',
        },
        {
          t: 'warn',
          text: 'It is not about saving money, and it is not warming anything up. Reading first is not a performance trick. It is the only thing that makes the edit about the real file rather than a plausible one.',
        },
      ],
      tasks: ['Read the guidance on reading before editing'],
    },
    {
      title: 'Have Claude read something real',
      kind: 'exercise',
      minutes: 8,
      brief:
        "Ask Claude to explain a file you already understand. You're testing its comprehension, not learning the file.",
      body: [
        {
          t: 'p',
          text: 'Before you let Claude change anything, find out how well it reads. Pick a file you know well — one you could summarise yourself without opening it.',
        },
        {
          t: 'p',
          text: 'You are not learning the file here. You are testing the reader, and you can only do that somewhere you already know the answer.',
        },
        {
          t: 'do',
          label: 'Point it at the file and ask',
          cmd: 'Summarise what this file does, and what\n  depends on it.',
        },
        {
          t: 'see',
          text: 'A summary you can mark. Read it against what you know and look for the parts that are subtly off, rather than the parts that are obviously wrong.',
        },
        {
          t: 'p',
          text: 'The obvious errors are harmless, because you will catch them. What you are hunting for is the confident half-truth: the right shape with a wrong detail sitting inside it.',
        },
        {
          t: 'why',
          text: 'This is where you calibrate. You are finding out how much of what Claude tells you about your own project you can take at face value, in the one situation where you can check every word of it.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Now the first real edit. Two things make this safe, and neither of them is about being clever with the prompt.',
        },
        {
          t: 'p',
          text: 'The first is a way back. Commit your work, or copy the folder somewhere — either is fine, as long as you can put the file back exactly as it was without having to think about how. Do that before you ask for anything.',
        },
        {
          t: 'term',
          word: 'Diff',
          means: 'The list of what changed: what the file said before, and what it says now. It is the only honest account of an edit.',
        },
        {
          t: 'p',
          text: 'The second is asking small. One specific change you could check at a glance — a renamed setting, a corrected message, a single condition. Not "improve this file", not a refactor, and not whatever Claude offers to tidy up while it is in there.',
        },
        {
          t: 'do',
          label: 'Ask for one specific thing',
          cmd: 'Change the timeout in this file from 30\n  seconds to 60. Do not change anything else.',
        },
        {
          t: 'see',
          text: 'A diff. Read it before you accept it, and check the second half of what you asked for too: that nothing else moved.',
        },
        {
          t: 'why',
          text: 'You are calibrating trust, and you cannot calibrate against a change you cannot check. A refactor you skimmed and accepted teaches you nothing about whether Claude is reliable.',
        },
        {
          t: 'warn',
          text: 'Asking it to explain its plan first feels like the careful move, and it is not a bad habit. But a plan is just more text, and it is not a way back. If you only do one of the two, keep the backup.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Undoing the edit is the actual skill in this topic. Knowing you can put things back is what makes you willing to try the next thing.',
        },
        {
          t: 'do',
          label: 'If you committed first',
          cmd: 'git checkout -- the-file-you-changed',
        },
        {
          t: 'p',
          text: 'If you copied the folder instead, this is where you copy the file back over the top. Both routes are fine. What matters is that you have done it once, deliberately, at a moment when nothing was actually wrong.',
        },
        {
          t: 'do',
          label: 'Confirm there is nothing left',
          cmd: 'git diff',
        },
        {
          t: 'see',
          text: 'Nothing at all. Empty output means the file is exactly where it started. If anything prints, something is still changed.',
        },
        {
          t: 'warn',
          text: 'Practise this while the stakes are zero. The first time you need to undo something in a hurry should not also be the first time you have tried to.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Claude will tell you something untrue in exactly the voice it uses for things that are true. No hedging, no tell, no change in tone.',
        },
        {
          t: 'p',
          text: 'That is the whole problem. Every instinct you have for spotting someone who is unsure — the hesitation, the vagueness, the caveat — is calibrated on people, and none of it transfers.',
        },
        {
          t: 'term',
          word: 'Hallucination',
          means: 'A confident answer with nothing behind it. Not a lie, which would require knowing better, and not a bug. It is the same machinery that gets things right, missing.',
        },
        {
          t: 'p',
          text: 'Two things that feel like checks are not checks. Asking again and getting the same answer tells you the answer is stable, which is a different thing from correct — it can be consistently wrong all day.',
        },
        {
          t: 'p',
          text: 'And asking how confident it is just produces another confident sentence. A number it makes up about its own reliability is not evidence about its reliability.',
        },
        {
          t: 'why',
          text: 'Everything else you do with Claude rests on this. Not scepticism in the abstract, but a specific habit: check the claims that are cheap to check and expensive to get wrong.',
        },
        {
          t: 'warn',
          text: 'Fluency is not evidence. That is the sentence to keep. If a claim matters and you can verify it in under a minute, verify it, however sure it sounded.',
        },
      ],
      tasks: ['Read the note on plausible-sounding errors'],
    },
    {
      title: 'Go and find one',
      kind: 'exercise',
      minutes: 15,
      brief:
        'Deliberately ask about something obscure in your project, or about a version number you can check yourself.',
      body: [
        {
          t: 'p',
          text: 'Go and catch it doing this. It works better than any warning, because the example will be yours and you will remember it.',
        },
        {
          t: 'p',
          text: 'Ask about something you can check independently, and something obscure enough to be a real test: an exact version number, a specific line in a config, which of two similar files a thing actually lives in.',
        },
        {
          t: 'do',
          label: 'Ask something with a checkable answer',
          cmd: 'Which version of the framework does this\n  project use?',
        },
        {
          t: 'see',
          text: 'A specific, confident answer. Now go and read the file yourself, and compare. Do not skip the reading — the reading is the entire exercise.',
        },
        {
          t: 'p',
          text: 'If it was right, that is not the end of it. Ask something harder: more obscure, more specific, further from the obvious files. You are looking for the edge of what it actually knows, and moving up in difficulty is how you find it. Note that this is not the same as asking the same question twice — a repeat tests nothing, but a harder question tests something new.',
        },
        {
          t: 'p',
          text: 'One kind of claim deserves special attention, because it is the one people trust most: whether something ran, and whether it passed.',
        },
        {
          t: 'do',
          label: 'Make it show you, not tell you',
          cmd: 'Run the tests and show me the full output.',
        },
        {
          t: 'see',
          text: 'The real output, scrolling past. "All tests pass" is Claude summarising that output for you, and a summary is a claim like any other. Read the output itself — it is right there, and it takes ten seconds.',
        },
        {
          t: 'why',
          text: 'Whether a test passed is the highest-stakes cheap check there is. It is the claim most likely to be taken on trust and the most expensive one to get wrong, and the fix is nothing more than looking.',
        },
        {
          t: 'warn',
          text: 'Write the wrong answer down when you find it: the question, what it said, and what was actually true. A specific memory beats general caution, and you will want it the next time something sounds authoritative.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'General caution does not survive a busy week. What survives is a short list of claim types you always check, written down now, while you are thinking about it.',
        },
        {
          t: 'p',
          text: 'The good candidates share a shape: cheap to verify, expensive to get wrong. Version numbers. Whether a test passed. Whether a file really contains what you were told it contains. Anything you are about to repeat to someone else as fact.',
        },
        {
          t: 'why',
          text: 'Deciding in advance is what makes it automatic. In the moment, with a good answer sitting in front of you sounding right, you will not stop to weigh it up. You will only follow a rule you already had.',
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
          text: 'Every session starts from nothing. Close the terminal, open it again tomorrow, and Claude has no memory of anything you explained yesterday. The same three corrections, every morning, forever.',
        },
        {
          t: 'p',
          text: 'One file fixes that. Claude reads it at the start of every session, before you have typed a word.',
        },
        {
          t: 'term',
          word: 'Session',
          means: 'One run of Claude, from opening it to closing it. Nothing carries over into the next one by itself.',
        },
        {
          t: 'term',
          word: 'CLAUDE.md',
          means: 'A plain text file in your project. Standing instructions, read automatically at the start of every session.',
        },
        {
          t: 'p',
          text: 'It is worth being clear about what it is not. Not a log of the prompts you have used. Not a changelog of what Claude altered. Not documentation for your colleagues either — they may well read it, but it is written for Claude, and that changes what belongs in it.',
        },
        {
          t: 'why',
          text: 'This is the difference between a tool you re-explain your project to every day and one that already knows it. Ten minutes on this file pays back in every session that follows.',
        },
        {
          t: 'warn',
          text: 'It is read every session, which means every line in it costs something every session. That is why the last step of this topic is about deleting things.',
        },
      ],
      tasks: ["Read what belongs in CLAUDE.md and what doesn't"],
    },
    {
      title: 'Write your first one',
      kind: 'exercise',
      minutes: 12,
      brief:
        'Start small: three or four rules that are true about your project and would otherwise need repeating every session.',
      body: [
        {
          t: 'p',
          text: 'Three or four rules. That is the whole first version, and it is deliberately small.',
        },
        {
          t: 'p',
          text: 'There is one test for whether something belongs: could Claude work this out by reading the code? If it could, leave it out.',
        },
        {
          t: 'table',
          rows: [
            {
              dimension: 'How to run things',
              doThis:
                'The exact command, including the flags nobody remembers. This is the single most valuable line in most of these files.',
              notThis:
                'Leave it out because it is obvious to you. It is not obvious from the code, which is exactly why it belongs.',
            },
            {
              dimension: 'What the code already says',
              doThis:
                'Trust Claude to read. It can see your file layout, your names and your imports without being told.',
              notThis:
                'List every file, or describe the code function by function. It is re-read every session, and it stopped being true weeks ago.',
            },
            {
              dimension: 'Decisions and constraints',
              doThis:
                'The things nobody could infer: why this library rather than that one, what must never be touched, which pattern to follow.',
              notThis:
                'Restate the README. If it is already written down for humans elsewhere, copying it in just doubles what you have to keep true.',
            },
            {
              dimension: 'Length',
              doThis:
                'Keep it to what actually changes behaviour. A short file that gets fully read beats a long one that gets skimmed.',
              notThis:
                'Paste in everything that might one day help. Bloat is not neutral — it crowds out the lines that matter.',
            },
          ],
        },
        {
          t: 'do',
          label: 'A complete first version',
          cmd: '# Notes for Claude\n\nRun the tests with: npm test\nDeploy is manual. Never run it.\nUse the existing date helper, not a new one.',
        },
        {
          t: 'p',
          text: 'Four lines. Every one of them is something Claude could not have guessed, and something you would otherwise be saying out loud again tomorrow. That is a finished first CLAUDE.md.',
        },
        {
          t: 'why',
          text: 'Small and true beats thorough and ignored. A file with four rules that hold gets followed. A file with forty gets skimmed by Claude and never updated by you.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'A rule you cannot prove is being read is a rule you cannot rely on. So prove it, once, properly.',
        },
        {
          t: 'p',
          text: 'The test has to run from a completely fresh session, and you have to avoid hinting. One mention of the rule in your prompt and you have tested nothing at all.',
        },
        {
          t: 'do',
          label: 'Start clean, then ask for something the rule covers',
          cmd: 'Run the tests.',
        },
        {
          t: 'see',
          text: 'Claude uses the exact command from your CLAUDE.md without you naming it. That is the rule working: it read the file, and it acted on it unprompted.',
        },
        {
          t: 'p',
          text: 'If it does something else instead, the rule is not doing its job. Usually it is buried in too much other text, or it is written as a suggestion rather than an instruction. Shorten it, make it an instruction, and test again.',
        },
        {
          t: 'why',
          text: 'This is the step people skip, and it is the one that turns CLAUDE.md from a file you hope is working into one you know is. Everything you build on top of it depends on that being settled.',
        },
        {
          t: 'warn',
          text: 'Claude telling you it has read CLAUDE.md is not evidence. That is a claim, and topic 4 was about exactly this kind of claim. The evidence is behaviour you did not ask for.',
        },
      ],
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
      body: [
        {
          t: 'p',
          text: 'Go back and read what you wrote. Every line is read again at the start of every session, so every line should be earning that.',
        },
        {
          t: 'p',
          text: 'Cut anything Claude could have read from the code, anything you added speculatively, and anything you have never actually seen it act on. If you are unsure about a line, delete it. You will notice soon enough if it mattered.',
        },
        {
          t: 'why',
          text: 'A bloated file fails quietly. Claude skims it, you stop trusting it, and nobody ever updates it. The small version is the one that stays true.',
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
