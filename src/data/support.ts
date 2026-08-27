/* Where to go when the course runs out. The Slack channel is the first stop:
   it is staffed by people in UKI who use Claude Code every day. */

export interface SupportRoute {
  /** What the reader types, opens or joins. */
  handle: string;
  title: string;
  detail: string;
  /** 'slack' is a channel name to search for, 'command' is typed into Claude
      Code, 'link' opens `href`. Only 'link' is clickable. */
  kind: 'slack' | 'command' | 'link';
  href?: string;
}

export const SUPPORT: SupportRoute[] = [
  {
    handle: '#uki-claude-support',
    title: 'Search this channel in Slack',
    detail:
      'The UKI channel for Claude Code. Ask here first, whatever the question. Say what you tried and paste the exact error.',
    kind: 'slack',
  },
  {
    handle: '/help',
    title: 'See every command',
    detail: 'Lists the commands your version actually has. Faster than searching the docs.',
    kind: 'command',
  },
  {
    handle: '/bug',
    title: 'Report a problem',
    detail: 'Sends the session with your report, so nobody has to ask you to reproduce it.',
    kind: 'command',
  },
  {
    handle: '/doctor',
    title: 'Check your install',
    detail: 'Run this before you ask about a broken install. It usually names the problem itself.',
    kind: 'command',
  },
  {
    handle: 'docs.claude.com',
    title: 'Official documentation',
    detail: 'The reference for everything this course does not cover.',
    kind: 'link',
    href: 'https://docs.claude.com/en/docs/claude-code',
  },
];
