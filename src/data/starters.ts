/* What a reader needs three weeks after the course, when they have a real task
   and no time to re-read a topic.

   Three things live here, and each one exists because it prevents an expensive
   mistake rather than because it completes a set:
   - The data rules. Topic 10 teaches them once. This is the permanent copy.
   - Task fit. The commonest failure is a badly chosen task, not a bad prompt.
   - Troubleshooting, keyed by the symptom the reader would actually type. */

export interface DataRule {
  /** 'never', 'ask' or 'fine' — drives the colour and the ordering. */
  level: 'never' | 'ask' | 'fine';
  what: string;
}

export const DATA_RULES: DataRule[] = [
  { level: 'never', what: 'Work of any kind in a personal Claude account. Use the company account' },
  { level: 'never', what: 'Passwords, keys, tokens or anything that grants access' },
  { level: 'never', what: 'Customer names, accounts, transactions or anything that identifies a player' },
  { level: 'never', what: "A colleague's personal data, including anything from an HR system" },
  {
    level: 'never',
    what: 'Real records with the names swapped out. Masked personal data is still personal data',
  },
  { level: 'ask', what: 'Unreleased commercial figures, or a document marked confidential' },
  { level: 'ask', what: 'Anything covered by a contract with another company' },
  { level: 'fine', what: 'Your own drafts, notes, plans and code, in the company account' },
  { level: 'fine', what: 'Published figures, public documentation and anything already on our website' },
  { level: 'fine', what: 'Example data you invented yourself' },
];

/* The test has to agree with the list. "Would you put it into a Google search?"
   does not: nobody would paste their own unreleased draft into Google, and the
   list marks that Fine. The account is what actually draws the line. */

/** The one-line test, for when the list above does not cover it. */
export const DATA_TEST =
  'Ask yourself who else could end up reading it. If the answer is anyone outside the people already allowed to see it, leave it out. This is the floor, not the ceiling — your team may hold you to more.';

export interface FitRow {
  fit: 'good' | 'poor';
  task: string;
  why: string;
}

export const TASK_FIT: FitRow[] = [
  {
    fit: 'good',
    task: 'The same dull job every week',
    why: 'You can write the steps down once, and you will know a bad result when you see one.',
  },
  {
    fit: 'good',
    task: 'Reading more than you have time to read',
    why: 'Twenty documents, one question. Claude is faster and you can spot-check the answer.',
  },
  {
    fit: 'good',
    task: 'A first draft you were going to rewrite anyway',
    why: 'A rough start you improve beats a blank page, and nothing is lost if it is wrong.',
  },
  {
    fit: 'good',
    task: 'Turning a mess into a shape',
    why: 'Notes into actions, a thread into a summary, a folder into a list. The work is structure, not judgement.',
  },
  {
    fit: 'poor',
    task: 'Anything where you cannot tell right from wrong',
    why: 'If you cannot check it, a confident wrong answer costs you more than doing it yourself.',
  },
  {
    fit: 'poor',
    task: 'A decision that is yours to make',
    why: 'Claude will happily produce a recommendation. Your name is still on it.',
  },
  {
    fit: 'poor',
    task: 'A number that has to tie exactly',
    why: 'Use it to find the rows and show its working. Do not take the total on trust.',
  },
  {
    fit: 'poor',
    task: 'Something that needs today’s world',
    why: 'Training data has a cutoff. Without a search or a file, it is guessing.',
  },
];

export interface Symptom {
  /** What the reader would say out loud. */
  symptom: string;
  cause: string;
  fix: string;
}

export const SYMPTOMS: Symptom[] = [
  {
    symptom: 'It changed the wrong file',
    cause: 'It guessed which file you meant, because you did not name one.',
    fix: 'Run /rewind to step back, then ask again with the exact file name. Run /diff before you keep anything.',
  },
  {
    symptom: 'It says the tests passed, but they did not',
    cause: 'It is reporting what it expected, not what it ran.',
    fix: 'Ask it to paste the actual output. "All tests pass" is a claim; the output is evidence.',
  },
  {
    symptom: 'It ignored my CLAUDE.md',
    cause: 'Either the file is in the wrong folder, or it is too long and vague to act on.',
    fix: 'Run /memory to see which file it loaded. Cut it to a few blunt rules that Claude could not guess.',
  },
  {
    symptom: 'It has got slower and vaguer',
    cause: 'The context window is nearly full, so it is working around a crowded desk.',
    fix: 'Run /context to look. Then /clear for a new job, or /compact to keep this one and drop the clutter.',
  },
  {
    symptom: 'It keeps asking me things it should know',
    cause: 'Nothing has been written down, so every session starts from nothing.',
    fix: 'Run /init to draft a CLAUDE.md, then trim it by hand. Prove it with a fresh session.',
  },
  {
    symptom: 'It will not install, or the command is not found',
    cause: 'Usually the install worked and your terminal cannot see it yet.',
    fix: 'Close the terminal and open a new one, then type claude. Once it starts, /doctor checks the rest. If it never starts, ask in Slack with the exact error.',
  },
  {
    symptom: 'It is doing far more than I asked',
    cause: 'The request said what to work on but never said where to stop.',
    fix: 'Say what done looks like and what it may not touch. /plan first, so you see the scope before any edit.',
  },
  {
    symptom: 'I am burning through my allowance',
    cause: 'Long sessions get re-read every turn, and a big model on a small job costs the same as on a big one.',
    fix: 'Run /usage to see. Then /clear between jobs, and drop the model or the effort for routine work.',
  },
];
