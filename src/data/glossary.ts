/* The glossary, split by the job the reader does. Each discipline holds three
   things: the words that come up in their work, the sentence to add to a prompt
   for a given task, and the slash commands that pay off most for them.

   The prompt lines are written to be pasted. Keep them as one instruction each,
   in the reader's own voice, and keep them honest — every one of them is a thing
   that genuinely changes the answer, not a politeness. */

export interface GlossaryTerm {
  word: string;
  means: string;
}

export interface PromptRecipe {
  /** The task the reader is doing. */
  task: string;
  /** The sentence to add to the prompt. Written for copying, so no backticks. */
  add: string;
}

export interface Discipline {
  id: string;
  /** Short label for the switcher. */
  name: string;
  blurb: string;
  terms: GlossaryTerm[];
  prompts: PromptRecipe[];
  /** Slash commands that earn their place in this kind of work. */
  commands: string[];
}

export const DISCIPLINES: Discipline[] = [
  {
    id: 'product',
    name: 'Product',
    blurb: 'Turning a want into something a team can build and check.',
    terms: [
      {
        word: 'Acceptance criteria',
        means: 'The list that says when the work is finished. Write it before the work starts.',
      },
      {
        word: 'Definition of done',
        means: 'The check you apply to the result. Claude will follow it, but only if you give it.',
      },
      { word: 'User story', means: 'One sentence: who wants what, and why they want it.' },
      { word: 'Edge case', means: 'The unusual input that breaks the ordinary path.' },
      {
        word: 'Non-goal',
        means: 'What you have decided not to build. Writing it down is what stops scope creep.',
      },
    ],
    prompts: [
      {
        task: 'Write a user story',
        add: 'Give me the story, the acceptance criteria and two edge cases. Number the criteria so I can tick them off.',
      },
      {
        task: 'Review a spec',
        add: 'List every question a developer would have to ask before starting. Do not answer them.',
      },
      {
        task: 'Compare two options',
        add: 'Give me a table: the option, what it costs us, what it gets the user, and what we give up.',
      },
      {
        task: 'Draft release notes',
        add: 'Group the changes by what the user sees. Leave out anything internal.',
      },
      {
        task: 'Summarise feedback',
        add: 'Group the comments by theme, count each theme, and quote one real line per theme.',
      },
    ],
    commands: ['/goal', '/plan', '/memory', '/export'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    blurb: 'Reading, changing and checking real code.',
    terms: [
      { word: 'Diff', means: 'The exact lines a change added and removed. Read it before you keep it.' },
      { word: 'Baseline', means: 'The state before the change. Take one, so you have something to compare.' },
      { word: 'Regression', means: 'Something that used to work and now does not.' },
      { word: 'Reproduction', means: 'The smallest set of steps that triggers the bug every time.' },
      {
        word: 'Stack trace',
        means: 'The list of calls that led to the error. Paste all of it, not the last line.',
      },
    ],
    prompts: [
      {
        task: 'Fix a bug',
        add: 'Reproduce it first and show me the failing output. Change no code until I have seen it.',
      },
      {
        task: 'Review a change',
        add: 'Review only the diff on this branch. Report correctness bugs. Ignore style.',
      },
      {
        task: 'Refactor something',
        add: 'Keep the behaviour identical. Show me the diff before you touch a second file.',
      },
      {
        task: 'Learn a codebase',
        add: 'Map the flow from the entry point to the database. Cite the file and line for each step.',
      },
      {
        task: 'Write a test',
        add: 'Write a test that fails on the current code. Show me the failure, then fix the code.',
      },
    ],
    commands: ['/diff', '/plan', '/security-review', '/rewind', '/context'],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    blurb: 'Getting a number you would be happy to defend.',
    terms: [
      { word: 'Source of truth', means: 'The one dataset everybody agrees on. Name it in the prompt.' },
      { word: 'Sample', means: 'The rows it actually looked at. A sample is not the whole table.' },
      {
        word: 'Outlier',
        means: 'A value far from the rest. Decide whether to keep it before you take an average.',
      },
      {
        word: 'Assumption',
        means: 'Anything filled in rather than measured. Write it next to the number.',
      },
    ],
    prompts: [
      {
        task: 'Summarise a dataset',
        add: 'Give me the row count, the date range and the columns with missing values, before any analysis.',
      },
      { task: 'Check a total', add: 'Show me the rows behind the total, not only the total.' },
      {
        task: 'Build a chart',
        add: 'Name the file you read and say which columns you grouped by.',
      },
      {
        task: 'Clean the data',
        add: 'List what you would drop and why. Drop nothing until I agree.',
      },
      {
        task: 'Explain a trend',
        add: 'Separate what the data shows from what you are inferring. Label the two.',
      },
    ],
    commands: ['/context', '/diff', '/memory', '/usage'],
  },
  {
    id: 'finance',
    name: 'Finance',
    blurb: 'Numbers that have to tie, and that somebody will audit.',
    terms: [
      {
        word: 'Reconciliation',
        means: 'Checking two records agree, and naming every single difference.',
      },
      { word: 'Accrual', means: 'A cost recorded when it happens, not when it is paid.' },
      {
        word: 'Variance',
        means: 'The gap between the plan and the actual. Explain the driver, not only the size.',
      },
      { word: 'Materiality', means: 'The size at which a difference starts to matter.' },
    ],
    prompts: [
      {
        task: 'Reconcile two files',
        add: 'Match on the reference column. List every unmatched row on both sides before you summarise.',
      },
      {
        task: 'Explain a variance',
        add: 'Give me the five largest differences by value, with the line item and the driver.',
      },
      {
        task: 'Build a forecast',
        add: 'State every assumption as a separate line I can change. Use no hidden constants.',
      },
      {
        task: 'Check a total',
        add: 'Show your working row by row for the ten largest rows.',
      },
    ],
    commands: ['/context', '/diff', '/permissions', '/privacy-settings'],
  },
  {
    id: 'delivery',
    name: 'Project management',
    blurb: 'Keeping work moving, and telling people the truth about it.',
    terms: [
      { word: 'Dependency', means: 'The thing that must finish before your thing can start.' },
      { word: 'Critical path', means: 'The chain of work that sets the end date.' },
      { word: 'Blocker', means: 'What is stopping work now. It needs an owner and a date.' },
      {
        word: 'Status',
        means: 'What changed and what is now at risk. It is not a list of who was busy.',
      },
    ],
    prompts: [
      {
        task: 'Write a status update',
        add: 'Three parts: what shipped, what is at risk, what I need a decision on. Six lines in total.',
      },
      {
        task: 'Pull actions out of notes',
        add: 'List every action with an owner and a date. Flag any action with no owner.',
      },
      {
        task: 'Build a timeline',
        add: 'Give me the order of the work and mark which items block others.',
      },
      {
        task: 'Prepare for a meeting',
        add: 'Read the last three updates and give me the five questions most likely to come up.',
      },
    ],
    commands: ['/goal', '/plan', '/memory', '/export'],
  },
];

export function disciplineById(id: string): Discipline {
  return DISCIPLINES.find((d) => d.id === id) ?? DISCIPLINES[0];
}
