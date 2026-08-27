/* A glossary of the two ways into Claude, kept separate on purpose. The words
   overlap but the things do not, and the difference decides what is safe to put
   in: Claude Code works on files already on your machine, while the Claude apps
   work on what you paste, upload or connect.

   Definitions are written for somebody who does not write code. One sentence for
   what it is, and a second only when the second earns its place.

   These entries go stale quickly — plan defaults, feature names and pricing
   language all move. Re-read them against the current docs before you trust
   them in front of a room. */

export interface ProductTerm {
  word: string;
  means: string;
}

export interface Product {
  id: string;
  name: string;
  blurb: string;
  terms: ProductTerm[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'code',
    name: 'Claude Code',
    blurb:
      'Runs in your terminal or your editor, on your own machine. It opens and changes real files in the folder you point it at.',
    terms: [
      {
        word: 'Agent',
        means:
          'Claude with tools. It reads and changes files itself, instead of telling you what to change.',
      },
      {
        word: 'Working directory',
        means:
          'The folder the session runs in. Claude reads files here, and CLAUDE.md files above it, but it does not go wandering.',
      },
      {
        word: 'Session',
        means:
          'One conversation. It starts with only your standing instructions, not your last chat — though the history is kept, so /resume can reopen it.',
      },
      {
        word: 'Context window',
        means:
          'The space that holds the session. Everything Claude has read sits in it, and it has a limit.',
      },
      {
        word: 'Token',
        means: 'The unit Claude reads and writes in. Roughly three quarters of a word.',
      },
      {
        word: 'Compaction',
        means:
          'Swapping the session history for a summary, to free space. You lose detail and keep the thread.',
      },
      {
        word: 'CLAUDE.md',
        means:
          'A file of standing instructions. Claude reads it at the start of every session, along with any CLAUDE.md in a folder above.',
      },
      {
        word: 'Skill',
        means:
          'A folder holding a SKILL.md: a short header saying when to use it, then the instructions. It can carry scripts too.',
      },
      {
        word: 'Slash command',
        means:
          'Anything you run by typing a leading slash — one that ships with Claude Code, one you wrote, or a skill.',
      },
      {
        word: 'Permissions',
        means: 'The rules that decide what Claude may do without stopping to ask you.',
      },
      {
        word: 'Plan mode',
        means: 'Claude researches and writes a plan, and changes nothing until you approve it.',
      },
      {
        word: 'Subagent',
        means:
          'A second Claude with its own context, sent off to do one job and report back. Keeps the main session clean.',
      },
      {
        word: 'Hook',
        means: 'A command the tool runs by itself at a set moment, such as before every edit.',
      },
      {
        word: 'MCP server',
        means:
          'A connector that gives Claude a tool it did not ship with. An idle one still costs a little room, so switch off what you never use.',
      },
      {
        word: 'Diff',
        means: 'The exact lines a change added and removed. Read it before you keep the change.',
      },
      {
        word: 'Terminal',
        means: 'The text window on your computer where you type commands instead of clicking.',
      },
    ],
  },
  {
    id: 'apps',
    name: 'Claude apps',
    blurb:
      'The website, the phone app and the desktop app. Normally you paste or upload what Claude should see. The desktop app is the exception: once someone sets up a filesystem connector, Claude can read and change files in the folders that connector allows — treat those folders the way you treat Claude Code.',
    terms: [
      {
        word: 'Chat',
        means:
          'One conversation. Chats are separate, but memory can still carry things between them.',
      },
      {
        word: 'Project',
        means:
          'A workspace holding files and instructions that every chat inside it can see. The nearest thing to a CLAUDE.md.',
      },
      {
        word: 'Artifact',
        means:
          'A document, page or small app Claude builds in a panel beside the chat, rather than in the reply.',
      },
      {
        word: 'Connector',
        means:
          'A link to another system, so Claude can read your calendar, your files or your tickets.',
      },
      {
        word: 'File upload',
        means: 'Adding a file to the chat. A copy goes to Anthropic. Your own file is not changed.',
      },
      {
        word: 'Memory',
        means:
          'What Claude carries from one chat to the next. On a personal plan it is ON unless you turn it off, so a throwaway chat is not private by default.',
      },
      {
        word: 'Extended thinking',
        means:
          'Claude works for longer before it answers. Better on a hard problem, and it uses more of your allowance.',
      },
      {
        word: 'Effort',
        means:
          'How hard Claude works per answer. Turn it down for simple jobs to stretch your allowance further.',
      },
      {
        word: 'Web search',
        means: 'Claude looks something up live, instead of answering from what it was trained on.',
      },
      {
        word: 'Knowledge cutoff',
        means:
          'The date the training data stops. Anything after it needs a search or a file from you.',
      },
      {
        word: 'Skill',
        means:
          'A saved set of instructions you call by name, as a slash command. Writing styles live here now, rather than in their own setting.',
      },
      {
        word: 'Claude in Chrome',
        means: 'An extension that lets Claude act in a browser tab, with your permission per site.',
      },
      {
        word: 'Model',
        means:
          'Which Claude answers. A bigger one reasons better and spends your allowance faster; match it to the job.',
      },
    ],
  },
];

export function productById(id: string): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}
