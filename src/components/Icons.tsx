/* Line icons drawn to match the app's thin, rounded stroke.
   Every icon inherits `currentColor` and takes a single `size` prop. */

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/** Compass — the Learn tab, and the journey metaphor generally. */
export function IconCompass({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M15.4 8.6 13.4 13.4 8.6 15.4 10.6 10.6 Z" />
    </svg>
  );
}

/** Three lines — the top bar's own hamburger, opener of the nav drawer. */
export function IconMenu({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

/** Bookmark / ribbon — the My Path tab and the save action. */
export function IconBookmark({
  size = 26,
  filled = false,
  className,
}: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path
        d="M6.5 3.5h11a1 1 0 0 1 1 1v15.6a.8.8 0 0 1-1.25.66L12 17.2l-5.25 3.56a.8.8 0 0 1-1.25-.66V4.5a1 1 0 0 1 1-1Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

/** Uneven book spines — the Resources tab. */
export function IconResources({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M4 5.5v13" />
      <path d="M7.4 3.8v14.7" />
      <path d="M10.8 5.1v13.4" />
      <path d="M14.2 3.4v15.1" />
      <path d="M17.9 9.6l2.3 8.9" />
      <path d="M3 20.4h18" />
    </svg>
  );
}

/** Open book — a reading step. */
export function IconBook({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M12 6.4C10.2 5.2 7.9 4.6 5 4.6a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1 1c2.9 0 5.2.6 7 1.8" />
      <path d="M12 6.4c1.8-1.2 4.1-1.8 7-1.8a1 1 0 0 1 1 1v11.6a1 1 0 0 1-1 1c-2.9 0-5.2.6-7 1.8" />
      <path d="M12 6.4V20" />
    </svg>
  );
}

/** Terminal prompt — a hands-on exercise step. */
export function IconTerminal({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="3" y="4.4" width="18" height="15.2" rx="2.4" />
      <path d="M7 10l2.6 2.4L7 14.8" />
      <path d="M12.6 15.2h4.4" />
    </svg>
  );
}

/** Magnifier over a tick — a verification step. */
export function IconVerify({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="10.6" cy="10.6" r="6.6" />
      <path d="M7.8 10.6l2.2 2.2 3.6-4" />
      <path d="M15.6 15.6 20.4 20.4" />
    </svg>
  );
}

/** Pencil in a circle — a note / write-up step. */
export function IconNote({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.4 8.6 9.8 14.2l-.7 2.6 2.6-.7 5.6-5.6a1.3 1.3 0 0 0 0-1.9a1.3 1.3 0 0 0-1.9 0Z" />
    </svg>
  );
}

/** Triangle with an exclamation — the "Careful" callout. */
export function IconWarning({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M12 4.6a1.4 1.4 0 0 1 1.22.71l7.4 13.1a1.4 1.4 0 0 1-1.22 2.09H4.6a1.4 1.4 0 0 1-1.22-2.09l7.4-13.1A1.4 1.4 0 0 1 12 4.6Z" />
      <path d="M12 10v4.1" strokeWidth={2} />
      <path d="M12 17.1h.01" strokeWidth={2.2} />
    </svg>
  );
}

/** Lightbulb — the contextual command hints in a step. */
export function IconBulb({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M12 3.4a5.8 5.8 0 0 0-3.3 10.6c.6.4.9 1.1.9 1.8v.4h4.8v-.4c0-.7.3-1.4.9-1.8A5.8 5.8 0 0 0 12 3.4Z" />
      <path d="M9.6 18.7h4.8" />
      <path d="M10.8 21h2.4" />
    </svg>
  );
}

/** Speech bubble — a support channel to ask in. */
export function IconChat({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M20.4 12.4c0 3.8-3.8 6.8-8.4 6.8a10 10 0 0 1-2.4-.3l-4 1.5 1.2-3.3a6.4 6.4 0 0 1-2.8-5.2c0-3.8 3.8-6.8 8.4-6.8s8 3 8 6.8Z" />
      <path d="M9 12h.01M12 12h.01M15 12h.01" strokeWidth={2.2} />
    </svg>
  );
}

/** Link out — an external destination rather than a screen in the app. */
export function IconLink({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M13.6 5.6h4.8v4.8" />
      <path d="M18.4 5.6 11 13" />
      <path d="M17.2 14v3.6a1.6 1.6 0 0 1-1.6 1.6H6.4a1.6 1.6 0 0 1-1.6-1.6V8.4a1.6 1.6 0 0 1 1.6-1.6H10" />
    </svg>
  );
}

/** Magnifier — the Resources search field. */
export function IconSearch({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="M15.7 15.7 20.4 20.4" strokeWidth={2} />
    </svg>
  );
}

/** Two stacked sheets — copy to the clipboard. */
export function IconCopy({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15.4 5.6a2.2 2.2 0 0 0-2.2-1.6H6.2A2.2 2.2 0 0 0 4 6.2v7a2.2 2.2 0 0 0 1.6 2.2" />
    </svg>
  );
}

/** Bare tick, for a button that has just done its job. */
export function IconCheckSmall({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M5 12.6l4.4 4.4L19 6.6" strokeWidth={2.2} />
    </svg>
  );
}

/** Triangle with a bar — a rule you must not break. */
export function IconWarn({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M12 4.4 21 19.6H3Z" />
      <path d="M12 10v4.2M12 17h.01" strokeWidth={2.2} />
    </svg>
  );
}

export function IconChevronDown({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M5.5 9.2 12 15.6l6.5-6.4" strokeWidth={2.2} />
    </svg>
  );
}

export function IconChevronLeft({ size = 30, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M15 4.5 7 12l8 7.5" strokeWidth={2.2} />
    </svg>
  );
}

/** Plain arrow, shaft and head -- "go" rather than "back" (IconChevronLeft)
    or "down into" (IconChevronDown). The bottom sheet's "All topics" link. */
export function IconArrowRight({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M4 12h15" strokeWidth={2.2} />
      <path d="M13 6l6 6-6 6" strokeWidth={2.2} />
    </svg>
  );
}

export function IconClose({ size = 30, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" strokeWidth={2.2} />
    </svg>
  );
}

/** Up/down arrow pair — the paging affordance next to the topic counter. */
export function IconUpDown({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M8.4 20V4.6M8.4 4.6 5.2 8M8.4 4.6 11.6 8" strokeWidth={1.8} />
      <path d="M15.6 4v15.4M15.6 19.4 12.4 16M15.6 19.4 18.8 16" strokeWidth={1.8} />
    </svg>
  );
}

/** Filled disc with a tick — "Completed steps". */
export function IconCheckCircle({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" />
      <path
        d="M6.8 12.4l3.6 3.6 6.8-8"
        fill="none"
        stroke="#9C5236"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** An empty ring — an incomplete step in a checklist. */
export function IconCircle({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" strokeWidth={1.8} />
    </svg>
  );
}

/** A ring with a tick — a completed checklist item. */
export function IconCircleCheck({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" strokeWidth={1.8} fill="currentColor" opacity={0.18} />
      <path d="M7.6 12.2l3.1 3.1 5.7-6.6" strokeWidth={2.1} />
    </svg>
  );
}

/** Scattered four-point stars — "My notes". */
export function IconSparkles({ size = 44, className }: IconProps) {
  const star = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r}C${cx + r * 0.16} ${cy - r * 0.16} ${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy}C${cx + r * 0.16} ${cy + r * 0.16} ${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r}C${cx - r * 0.16} ${cy + r * 0.16} ${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy}C${cx - r * 0.16} ${cy - r * 0.16} ${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r}Z`;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} aria-hidden="true">
      <g fill="currentColor">
        <path d={star(15, 12, 7)} />
        <path d={star(31, 21, 9)} />
        <path d={star(13, 29, 5.5)} />
        <path d={star(28, 36, 4)} />
        <path d={star(38, 9, 3.4)} />
      </g>
    </svg>
  );
}

/** Stopwatch — the timebox tile. */
export function IconStopwatch({ size = 44, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="12" cy="13.4" r="7.6" strokeWidth={1.7} />
      <path d="M12 9.8v3.6l2.4 1.8" strokeWidth={1.7} />
      <path d="M9.6 3.2h4.8" strokeWidth={1.7} />
      <path d="M12 3.2v2.6" strokeWidth={1.7} />
    </svg>
  );
}

export function IconPlay({ size = 34, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M8.4 5.4a1 1 0 0 1 1.5-.86l8.2 5.6a1 1 0 0 1 0 1.72l-8.2 5.6a1 1 0 0 1-1.5-.86Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Flame — the streak stat. Outline only at zero, so an unstarted streak
   reads as "nothing lit yet" rather than a small orange fire sitting next to
   a 0, which read as contradicting itself. */
export function IconFlame({ size = 24, lit = false, className }: IconProps & { lit?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      fill={lit ? 'currentColor' : 'none'}
    >
      <path d="M12 2.6c1.7 2.6 5.3 6.4 5.3 10.6a5.3 5.3 0 1 1-10.6 0c0-1.8.7-3.2 1.5-4.4-.1 1.7.6 2.7 1.6 2.7-.3-3.1.9-5.2 2.2-8.9Z" />
    </svg>
  );
}

export function IconPause({ size = 34, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="7" y="5" width="3.6" height="14" rx="1.8" />
        <rect x="13.4" y="5" width="3.6" height="14" rx="1.8" />
      </g>
    </svg>
  );
}
