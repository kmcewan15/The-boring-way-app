/* Slash commands worth knowing while you are on a given step.
   Surfaced by the lightbulb in the corner of the step view (`CommandHints.tsx`).

   Two lookups, in order of precedence: a step id, then the topic number. A step
   entry replaces the topic list rather than adding to it, so keep each list to
   two to four commands — the panel is a nudge, not a manual.

   Every command here is a real built-in of the Claude Code CLI. Deliberately
   absent: `/cost` (it is now `/usage`) and `/agents` (removed). Check a command
   against `/help` before you add it. */

export interface CommandHint {
  /** The command as the reader types it, leading slash included. */
  cmd: string;
  /** When to reach for it, in one short line. Plain words, no backticks. */
  when: string;
}

/** The default list for every step in a topic. Keyed by 1-based topic number. */
export const TOPIC_COMMANDS: Record<number, CommandHint[]> = {
  1: [
    { cmd: '/login', when: 'Sign in to your account. You do this once per machine.' },
    { cmd: '/status', when: 'Check you are signed in and see which folder you are in.' },
    { cmd: '/help', when: 'List every command you can type.' },
    { cmd: '/doctor', when: 'Check the install when something looks wrong.' },
  ],
  2: [
    { cmd: '/status', when: 'See the folder the agent can actually reach.' },
    { cmd: '/add-dir', when: 'Let it reach a second folder as well.' },
    { cmd: '/permissions', when: 'Decide what it may do without asking you first.' },
    { cmd: '/diff', when: 'See what it changed on disk, not what it says it changed.' },
  ],
  3: [
    { cmd: '/diff', when: 'Read the change before you accept it.' },
    { cmd: '/rewind', when: 'Take the conversation and the files back a step.' },
    { cmd: '/permissions', when: 'Keep edits behind a prompt while you are learning.' },
    { cmd: '/context', when: 'See which files it has actually read.' },
  ],
  4: [
    { cmd: '/diff', when: 'Check the change yourself, line by line.' },
    { cmd: '/security-review', when: 'Get a second pass over the pending change.' },
    { cmd: '/rewind', when: 'Undo a confident wrong edit.' },
    { cmd: '/clear', when: 'Start clean instead of arguing with a wrong answer.' },
  ],
  5: [
    { cmd: '/memory', when: 'Open your CLAUDE.md and edit it.' },
    { cmd: '/init', when: 'Write a first CLAUDE.md from the project you are in.' },
    { cmd: '/clear', when: 'Start a fresh session, to prove the rule holds on its own.' },
    { cmd: '/context', when: 'See how much room the file takes up.' },
  ],
  6: [
    { cmd: '/skills', when: 'List every skill available to you right now.' },
    { cmd: '/resume', when: 'Reopen a past session and find the prompt you keep retyping.' },
    { cmd: '/reload-skills', when: 'Pick up a skill file you just saved.' },
    { cmd: '/memory', when: 'Put the rule in CLAUDE.md when it is too small for a skill.' },
  ],
  7: [
    { cmd: '/context', when: 'See how full the desk already is.' },
    { cmd: '/clear', when: 'Empty the desk between two unrelated jobs.' },
    { cmd: '/compact', when: 'Keep the thread of one long job, drop the clutter.' },
    { cmd: '/usage', when: 'See what you have spent so far.' },
  ],
  8: [
    { cmd: '/goal', when: 'Set the goal Claude checks before it stops.' },
    { cmd: '/plan', when: 'Agree the approach before any file changes.' },
    { cmd: '/permissions', when: 'Set the tools allowed and the limits.' },
    { cmd: '/diff', when: 'Check the result against your own idea of done.' },
  ],
  9: [
    { cmd: '/mcp', when: 'Connect Claude to a live system.' },
    { cmd: '/skills', when: 'See what extra abilities are loaded.' },
    { cmd: '/ide', when: 'Work alongside your editor instead of plain text.' },
    { cmd: '/config', when: 'Turn a connector on or off.' },
  ],
  10: [
    { cmd: '/privacy-settings', when: 'See and change what is shared.' },
    { cmd: '/status', when: 'Check which account this session is signed in to.' },
    { cmd: '/clear', when: 'Wipe the session before you move to another subject.' },
    { cmd: '/permissions', when: 'Block the folders that must stay untouched.' },
  ],
};

/* Step-level overrides. Keyed by the generated step id (`t3s4` = topic 3,
   step 4). These ids are positional, so if you insert or reorder a step in
   `curriculum.ts`, re-point these keys by hand — nothing here will fail to
   compile if you forget. */
export const STEP_COMMANDS: Record<string, CommandHint[]> = {
  t1s2: [
    { cmd: '/doctor', when: 'Confirm the install is healthy.' },
    { cmd: '/help', when: 'See what you can type now that it runs.' },
    { cmd: '/status', when: 'Check the version and the folder in one place.' },
  ],
  t1s3: [
    { cmd: '/login', when: 'Start the sign-in. Your browser opens once.' },
    { cmd: '/logout', when: 'Sign out, if you picked the wrong account.' },
    { cmd: '/status', when: 'Confirm which account you are on.' },
  ],
  t1s4: [
    { cmd: '/status', when: 'Confirm the folder Claude is working in.' },
    { cmd: '/cd', when: 'Move this session to a different folder.' },
    { cmd: '/init', when: 'Have Claude look around and write down what it found.' },
  ],
  t2s2: [
    { cmd: '/permissions', when: 'Decide whether it may create files without asking.' },
    { cmd: '/diff', when: 'See exactly what landed in the folder.' },
    { cmd: '/status', when: 'Check it built the folder where you meant.' },
  ],
  t3s3: [
    { cmd: '/diff', when: 'Read the one change before you keep it.' },
    { cmd: '/permissions', when: 'Make it ask you before every edit.' },
    { cmd: '/rewind', when: 'Step back if the edit is wrong.' },
  ],
  t3s4: [
    { cmd: '/rewind', when: 'Undo inside Claude, without touching your backup.' },
    { cmd: '/diff', when: 'Confirm nothing is left behind.' },
  ],
  t4s2: [
    { cmd: '/diff', when: 'Compare what it claims with what it changed.' },
    { cmd: '/context', when: 'Check it really opened the file it is quoting.' },
    { cmd: '/security-review', when: 'Have a second pass look for what you missed.' },
  ],
  t5s2: [
    { cmd: '/init', when: 'Get a first draft written from the project.' },
    { cmd: '/memory', when: 'Open the file and cut it back to your own rules.' },
    { cmd: '/context', when: 'See what the file costs every session.' },
  ],
  t5s3: [
    { cmd: '/clear', when: 'Start clean. A fresh session is the only honest test.' },
    { cmd: '/memory', when: 'Check the rule is in the file you think it is in.' },
    { cmd: '/resume', when: 'Go back to the old session to compare.' },
  ],
  t6s2: [
    { cmd: '/resume', when: 'Reopen old sessions and look for a repeat.' },
    { cmd: '/insights', when: 'Get a report on how you have been using Claude.' },
    { cmd: '/export', when: 'Save a session out so you can read it properly.' },
  ],
  t6s3: [
    { cmd: '/skills', when: 'Read an existing skill before you write yours.' },
    { cmd: '/reload-skills', when: 'Load the file you just saved to disk.' },
    { cmd: '/memory', when: 'Keep project rules in CLAUDE.md, not in the skill.' },
  ],
  t6s5: [
    { cmd: '/skills', when: 'Confirm Claude can see your skill by name.' },
    { cmd: '/reload-skills', when: 'Pick up each fix without restarting.' },
    { cmd: '/skill-doctor', when: 'See which skills sit unused and cost you context.' },
  ],
  t7s2: [
    { cmd: '/context', when: 'Run it before you start, then again after.' },
    { cmd: '/usage', when: 'Put a number on what the session cost.' },
    { cmd: '/compact', when: 'Shrink the desk once it is nearly full.' },
  ],
  t7s3: [
    { cmd: '/clear', when: 'Between two unrelated jobs.' },
    { cmd: '/compact', when: 'Inside one long job that you still need.' },
    { cmd: '/model', when: 'Match the model to the size of the job.' },
    { cmd: '/mcp', when: 'Switch off a connector you are not using.' },
  ],
  t8s3: [
    { cmd: '/goal', when: 'State what done means, so Claude checks it too.' },
    { cmd: '/permissions', when: 'Hold it to the tools you allowed.' },
    { cmd: '/diff', when: 'Judge the result against your criteria, not your hopes.' },
  ],
  t10s2: [
    { cmd: '/privacy-settings', when: 'See what your account shares today.' },
    { cmd: '/status', when: 'Check whether this is the company account or your own.' },
  ],
};

/** The commands to show for one step. A step entry wins over its topic. */
export function commandsFor(topicNumber: number, stepId: string): CommandHint[] {
  return STEP_COMMANDS[stepId] ?? TOPIC_COMMANDS[topicNumber] ?? [];
}

/* One command, with every reason the course gives for it. A command can be
   taught for two different purposes — topic 7 wants `/mcp` switched OFF to save
   context, topic 9 wants it switched ON to reach a live system — so the
   cheatsheet keeps each reason next to the topics that give it rather than
   collapsing them into whichever came first. */
export interface CommandUse {
  when: string;
  topics: number[];
}

export interface CommandEntry {
  cmd: string;
  uses: CommandUse[];
  /** Every topic that mentions the command, ascending. */
  topics: number[];
}

const TOPIC_OF_STEP = /^t(\d+)s\d+$/;

/** Every distinct command in this file, in first-appearance order. */
export function allCommands(): CommandEntry[] {
  const found = new Map<string, CommandEntry>();

  const add = (hint: CommandHint, topicNumber: number) => {
    let entry = found.get(hint.cmd);
    if (!entry) {
      entry = { cmd: hint.cmd, uses: [], topics: [] };
      found.set(hint.cmd, entry);
    }
    /* One reason per topic. A topic's own list runs first, so its broad reason
       wins and the narrower step wording is dropped here — the reader already
       gets that one from the lightbulb inside the step. Without this, `/status`
       lists eight near-identical lines, three of them for topic 1. */
    if (entry.topics.includes(topicNumber)) return;
    entry.topics.push(topicNumber);

    const use = entry.uses.find((u) => u.when === hint.when);
    if (use) {
      use.topics.push(topicNumber);
      return;
    }
    entry.uses.push({ when: hint.when, topics: [topicNumber] });
  };

  /* Topic lists first, so the broad reason for a command leads and the narrower
     step reasons follow it. `Object.entries` walks integer-like keys 1..10 in
     ascending order, which is the order the reader meets them in. */
  for (const [n, hints] of Object.entries(TOPIC_COMMANDS)) {
    for (const h of hints) add(h, Number(n));
  }
  for (const [stepId, hints] of Object.entries(STEP_COMMANDS)) {
    const m = TOPIC_OF_STEP.exec(stepId);
    if (!m) continue;
    for (const h of hints) add(h, Number(m[1]));
  }

  const asc = (a: number, b: number) => a - b;
  for (const entry of found.values()) {
    entry.topics.sort(asc);
    for (const use of entry.uses) use.topics.sort(asc);
    /* Step-only topics are collected in a second pass, so without this a reason
       from topic 4 lands after one from topic 7. Read the table in course order. */
    entry.uses.sort((a, b) => a.topics[0] - b.topics[0]);
  }
  return [...found.values()];
}
