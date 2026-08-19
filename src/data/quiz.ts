/* End-of-world quizzes: a short checkpoint at the end of each topic, testing the
   ground that topic just covered. Three questions each, and nothing is gated on
   the result — a wrong answer points at the steps worth revisiting. */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Shown in the review after answering, so a wrong answer teaches something. */
  why: string;
}

export const TOPIC_QUIZZES: Record<number, QuizQuestion[]> = {
  1: [
    {
      id: 't1q1',
      question: 'Where does Claude Code actually run?',
      options: [
        'In a browser tab, like a normal chat',
        'As a terminal agent on your own machine, in a folder you choose',
        'On a server you upload your files to',
        'As a browser extension that reads the page',
      ],
      answer: 1,
      why: 'It runs locally, in a directory you point it at. That is exactly why it can read and change your real files.',
    },
    {
      id: 't1q2',
      question: 'What actually confirms the install worked?',
      options: [
        'The installer finished without an error',
        '`claude --version` prints a version number',
        'An icon appeared in your dock or taskbar',
        'You can reach claude.ai in your browser',
      ],
      answer: 1,
      why: 'A finished installer is not evidence the command is on your PATH. Running it is.',
    },
    {
      id: 't1q3',
      question: 'Why start Claude in a real project folder rather than an empty one?',
      options: [
        'The folder you start it in is the material it can read and change',
        'Empty folders are not supported',
        'It responds faster when there are more files',
        'It requires a git repository to start',
      ],
      answer: 0,
      why: 'The working directory defines what the agent can see. Point it at real material and the answers become useful rather than generic.',
    },
  ],

  2: [
    {
      id: 't2q1',
      question: 'What is the main practical difference between a chat window and an agent?',
      options: [
        'The agent uses a more capable model',
        'The agent can read and change the files in your project itself',
        'The agent responds faster',
        'The agent costs less per message',
      ],
      answer: 1,
      why: 'Chat gives you advice to copy and paste. An agent takes the action for you, which changes both the value and the risk.',
    },
    {
      id: 't2q2',
      question: 'Which task is a poor fit for a browser chat but a good fit for an agent?',
      options: [
        'Explaining what a closure is',
        'Renaming a config key across twelve files in your repo',
        'Drafting a short email',
        'Summarising an article you have pasted in',
      ],
      answer: 1,
      why: 'Anything that needs to touch many real files is where an agent earns its keep. General explanation is fine in chat.',
    },
    {
      id: 't2q3',
      question: 'What new risk comes with moving from chat to an agent?',
      options: [
        'It is more likely to be factually wrong',
        'It can change things, so a wrong answer now has consequences on disk',
        'It costs significantly more per word',
        'It cannot be interrupted once started',
      ],
      answer: 1,
      why: 'The model is no more or less accurate. What changes is that its mistakes now land in your files rather than on your screen.',
    },
  ],

  3: [
    {
      id: 't3q1',
      question: 'Before letting Claude edit a real file, what matters most?',
      options: [
        'Asking it to explain its plan in detail first',
        'Making sure your work is committed or backed up, so you have a way back',
        'Switching to the most capable model available',
        'Closing any other editors that have the file open',
      ],
      answer: 1,
      why: 'A reliable way back is what makes everything else safe to try. Without it, one bad edit is a bad afternoon.',
    },
    {
      id: 't3q2',
      question: 'Why should Claude read a file before changing it?',
      options: [
        'Most bad edits come from an assumption about what the file contains',
        'Reading is cheaper than writing',
        'It warms up the model on your codebase',
        'The tool refuses to edit unread files',
      ],
      answer: 0,
      why: 'The same applies to you. An edit based on what someone assumed was in the file is the classic way to break something.',
    },
    {
      id: 't3q3',
      question: 'What is a sensible first edit to ask for?',
      options: [
        'Whatever it suggests would improve the file',
        'One small, specific change you could verify at a glance',
        'A full refactor of the module',
        'Renaming everything for consistency',
      ],
      answer: 1,
      why: 'Small and obviously-correct first. You are calibrating your trust, and you cannot calibrate against a change you cannot check.',
    },
  ],

  4: [
    {
      id: 't4q1',
      question:
        'Claude tells you, confidently, which version of a library your project uses. What should you do?',
      options: [
        'Trust it — confident answers are usually right',
        'Check it yourself, because fluency is not evidence',
        'Ask again and see whether the answer is consistent',
        'Ask how confident it is and go by that',
      ],
      answer: 1,
      why: 'The tone is identical whether it is right or wrong, so tone tells you nothing.',
    },
    {
      id: 't4q2',
      question: 'You ask Claude to run the tests and it reports they pass. What is the minimum you should do?',
      options: [
        'Accept it — it ran the command, so it knows',
        'Look at the actual test output yourself',
        'Ask it to run them a second time',
        'Nothing, if the summary sounds detailed',
      ],
      answer: 1,
      why: 'Whether a test passed is exactly the kind of claim never to take on trust. Read the output, not the summary of it.',
    },
    {
      id: 't4q3',
      question: 'Claude gives you the same wrong answer twice. What does that tell you?',
      options: [
        'Nothing useful — it can be consistently wrong',
        'That it is probably right after all',
        'That your question was ambiguous',
        'That the session needs restarting',
      ],
      answer: 0,
      why: 'Consistency is not corroboration. Asking twice tests nothing except whether it is stable.',
    },
  ],

  5: [
    {
      id: 't5q1',
      question: 'What is CLAUDE.md for?',
      options: [
        'A log of the prompts you have used',
        'Durable project rules that Claude reads at the start of every session',
        'A changelog of what Claude has altered',
        'Documentation intended only for human readers',
      ],
      answer: 1,
      why: 'Every session starts fresh. CLAUDE.md is the one file read every time, so it is where standing instructions belong.',
    },
    {
      id: 't5q2',
      question: 'Which of these genuinely belongs in a CLAUDE.md?',
      options: [
        'A list of every file in the repository',
        'How to run the tests in this project',
        'The full contents of the README',
        'A description of the code, function by function',
      ],
      answer: 1,
      why: 'Put in what Claude cannot work out by reading the code. Anything it can already see is bloat, and bloat gets ignored.',
    },
    {
      id: 't5q3',
      question: 'How do you know a CLAUDE.md rule is actually being used?',
      options: [
        'Claude confirms it has read the file',
        'Start a fresh session and check it follows the rule unprompted',
        'The file parses without errors',
        'It shows up when you list the directory',
      ],
      answer: 1,
      why: 'A rule you cannot prove is being read is a rule you cannot rely on. Test it from a clean session, without hinting.',
    },
  ],

  6: [
    {
      id: 't6q1',
      question: 'When should a prompt become a reusable skill?',
      options: [
        'Once you have written roughly the same prompt several times',
        'Only for tasks that take longer than an hour',
        'Never — prompts should stay ad hoc so they stay flexible',
        'As soon as a prompt runs past a few lines',
      ],
      answer: 0,
      why: 'Repetition is the signal, not size or importance.',
    },
    {
      id: 't6q2',
      question: 'What makes a good first skill?',
      options: [
        'The hardest thing you do, so the payoff is biggest',
        'Boring and frequent, with a clear definition of done',
        'Something nobody else on the team understands',
        'A rare task that is high value when it happens',
      ],
      answer: 1,
      why: 'Frequent means you get feedback quickly. Clear success criteria mean you can tell whether it worked.',
    },
    {
      id: 't6q3',
      question: 'Your new skill produces the wrong output on its first run. Most likely cause?',
      options: [
        'The model is not capable enough for it',
        'Instructions you left in your head rather than in the file',
        'The skill name does not match the task',
        'Skills need a second run to take effect',
      ],
      answer: 1,
      why: 'The first run always exposes the context you assumed rather than stated. That is what the first run is for.',
    },
  ],

  7: [
    {
      id: 't7q1',
      question: 'What mainly drives context use and cost?',
      options: [
        'How many separate messages you send',
        'How much content gets read into, and written out of, the context window',
        'How long the session has been open',
        'How many tools are enabled',
      ],
      answer: 1,
      why: 'Everything read and written costs tokens, and the window is finite.',
    },
    {
      id: 't7q2',
      question: 'Which habit reduces cost most reliably?',
      options: [
        'Being specific about which files Claude needs to look at',
        'Writing shorter messages',
        'Enabling fewer tools',
        'Avoiding follow-up questions',
      ],
      answer: 0,
      why: 'Your prompt is rarely the expensive part. What the agent reads in order to answer it usually is.',
    },
    {
      id: 't7q3',
      question: 'Why start a fresh session for an unrelated task?',
      options: [
        'Sessions expire after a while anyway',
        'The previous task is still filling the window with material that is now irrelevant',
        'It resets your tool permissions',
        'It clears a local cache that slows things down',
      ],
      answer: 1,
      why: 'Carrying a finished task around costs you tokens and dilutes the model attention on the new one.',
    },
  ],

  8: [
    {
      id: 't8q1',
      question: 'A request that reliably gets you what you wanted states four things. Which set?',
      options: [
        'The goal, the deadline, the owner, and the priority',
        'The result, how you will know it is done, what it may use, and what it must not touch',
        'The context, the background, the history, and the goal',
        'The files to change, the files to read, the model, and the budget',
      ],
      answer: 1,
      why: 'Result, done, tools, limits. Most disappointing output is missing the second or the fourth.',
    },
    {
      id: 't8q2',
      question: 'Which of these is a definition of done, rather than just a goal?',
      options: [
        'Make the login flow better',
        'The test suite passes and no file outside src/auth has changed',
        'Tidy up the auth module',
        'Improve performance where you can',
      ],
      answer: 1,
      why: 'A definition of done is checkable by someone other than you. If it cannot be verified, it cannot be delivered.',
    },
    {
      id: 't8q3',
      question: 'Why state the limits — what must not change?',
      options: [
        'It saves tokens',
        'It stops a small task turning into a broad diff you cannot review',
        'It is required for the request to be accepted',
        'It makes the agent run faster',
      ],
      answer: 1,
      why: 'Without limits, a helpful agent will improve things you never asked about, and now you have to review all of it.',
    },
  ],

  9: [
    {
      id: 't9q1',
      question: 'What is the right order for the change loop?',
      options: [
        'Change, commit, verify, review',
        'Baseline, diff, verify, commit',
        'Commit, baseline, diff, verify',
        'Diff, verify, baseline, commit',
      ],
      answer: 1,
      why: 'Know the state before, see exactly what changed, prove it still works, then checkpoint it.',
    },
    {
      id: 't9q2',
      question: 'Why start from a clean working tree?',
      options: [
        'Git will refuse the request otherwise',
        'So everything appearing in the diff came from this task',
        'It reduces the tokens used',
        'It makes the agent run faster',
      ],
      answer: 1,
      why: 'A diff is only meaningful if you know what it is a diff against. Start dirty and you cannot tell your changes from its changes.',
    },
    {
      id: 't9q3',
      question: 'Claude summarises its work as "minor refactor, all tests pass". What do you read?',
      options: [
        'The summary is enough when tests pass',
        'The diff itself, line by line',
        'Just the list of files that changed',
        'The commit message it wrote',
      ],
      answer: 1,
      why: 'The summary is the thing being checked, not the evidence. "Minor" is its judgement, not a fact you have verified.',
    },
  ],

  10: [
    {
      id: 't10q1',
      question: 'What makes the best first thing to automate?',
      options: [
        'The largest, most valuable process you own',
        'A small, dull task you do often, with an obvious definition of done',
        'Something nobody else understands',
        'A brand new process with no existing way of working',
      ],
      answer: 1,
      why: 'Ambitious first attempts fail for reasons you cannot diagnose yet.',
    },
    {
      id: 't10q2',
      question: 'Why does "boring" make a task a good candidate?',
      options: [
        'Boring tasks have clear, checkable definitions of done',
        'It matters less if they go wrong',
        'They need less context to explain',
        'Nobody will notice if they change',
      ],
      answer: 0,
      why: 'The dullness is not the point — the clarity that comes with it is. You can tell immediately whether it worked.',
    },
    {
      id: 't10q3',
      question: 'You finish your first hack. What makes it worth more than the time it saved?',
      options: [
        'The amount of code produced',
        'Writing up what you learned so the next person starts further along',
        'Proving to the team that the tool works',
        'The cost saved on the task itself',
      ],
      answer: 1,
      why: 'One person saving an hour is a rounding error. A team that knows how you did it is not.',
    },
  ],
};

export function quizForTopic(topicNumber: number): QuizQuestion[] {
  return TOPIC_QUIZZES[topicNumber] ?? [];
}

export interface TopicQuizOutcome {
  score: number;
  total: number;
  /** Two out of three. Nothing is gated on this — it just changes the wording. */
  passed: boolean;
  missed: Array<{ q: QuizQuestion; given: number | null }>;
}

export function scoreTopicQuiz(
  topicNumber: number,
  answers: Array<number | null>,
): TopicQuizOutcome {
  const questions = quizForTopic(topicNumber);
  const missed: TopicQuizOutcome['missed'] = [];
  let score = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) score += 1;
    else missed.push({ q, given: answers[i] ?? null });
  });

  const total = questions.length;
  return { score, total, passed: total > 0 && score / total >= 2 / 3, missed };
}
