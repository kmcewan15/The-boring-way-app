import { useRef, useState } from 'react';
import Particles from '../art/Particles';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES, mixHex, withAlpha } from '../art/landscapes';
import { JOURNEY, TOPICS, globalIndexOf } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { IconArrowRight, IconFlame, IconVerify } from './Icons';
import { StepKindIcon } from './StepCard';
import { KIND_LABEL } from './StepView';

/* The desert is topic one -- Bring Claude to Life -- so this is literally the
   view from the trailhead, not a generic splash colour. Static rather than
   blended: nothing has been walked yet for a palette to blend from. */
const PALETTE = LANDSCAPES.desert;

/* The same --w-ink / --w-ink-soft LearnScreen writes onto the document root
   once it mounts, computed here from that same fixed desert palette instead.
   Module-level, not per-render: this palette never changes, so there is
   nothing to recompute. Without this the title and tagline were drawn in the
   app's generic fixed tokens -- close cousins of the real desert-tinted
   colours the top bar actually lands in, but not the same colours, so even a
   pixel-perfect slide still landed on a colour that then had to jump to the
   right one. Reading the true target colour here means there is nothing left
   to jump. */
const W_INK = PALETTE.foreDeep;
const W_INK_SOFT = mixHex(PALETTE.foreDeep, PALETTE.sky, 0.06);
/* The same --w-panel the trail writes for its reading surfaces. LearnScreen
   sets that token on mount, which has not happened yet on this screen, so the
   card would otherwise fall back to a generic white and read as a different
   app's component sitting on the desert. */
const W_PANEL = mixHex(PALETTE.sky, PALETTE.fore, 0.13);

/* Where the title lands and how small it gets. Top is fixed -- the bar's own
   72px height, minus the brand block's total rendered height (title 20 +
   gap 4 + tagline 12 = 36, all set in px in .topbar__brand precisely so this
   division comes out even), halved to centre it: (72 - 36) / 2 = 18. Left is
   NOT fixed: the bar centres its brand column between two equal 1fr grid
   tracks, so the true target is always the viewport's own horizontal centre,
   whatever the window width -- handleEnter computes that at click time
   instead of guessing a literal offset here. */
const DOCK_TOP = 18;
const DOCK_SIZE = 17;

/* Where the tagline lands -- its own measured dock, not a ride-along on the
   title's. Nested inside the title's own transformed box, it could only ever
   scale by the title's own ratio, landing nowhere near the bar's real 10px
   tagline. Top is the title's own dock top (18) plus its real line-height
   (20) plus the bar's own margin-top between title and tagline (4): 18 + 20
   + 4 = 42. */
const TAG_DOCK_TOP = 42;
const TAG_DOCK_SIZE = 10;

/* What the whole course costs, for somebody deciding whether to start it. Read
   off the curriculum rather than written down, so it cannot drift from the
   content the way a hardcoded "about 5 hours" would. */
const TOTAL_MINUTES = TOPICS.reduce(
  (sum, t) => sum + t.steps.reduce((a, s) => a + s.minutes, 0),
  0,
);
const TOTAL_HOURS = Math.round(TOTAL_MINUTES / 60);

/* Ring geometry. Stroke is inside the box, so the radius is inset by half of
   it or the arc clips at the edges. */
const RING_SIZE = 92;
const RING_STROKE = 7;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

/** How far along the course you are, as an arc. Drawn from a dash offset on a
    single circle rather than an SVG path: the arc length is the one number
    that changes, so there is no path to rebuild per render. Rotated -90deg so
    it fills from twelve o'clock, which is the only place a progress ring
    reads as starting from. */
function ProgressRing({ pct, done, total }: { pct: number; done: number; total: number }) {
  const mid = RING_SIZE / 2;
  return (
    <div
      className="home__ring"
      role="img"
      aria-label={`${pct}% of the course complete, ${done} of ${total} steps`}
    >
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} aria-hidden="true">
        <g transform={`rotate(-90 ${mid} ${mid})`} fill="none" strokeWidth={RING_STROKE}>
          <circle cx={mid} cy={mid} r={RING_R} stroke={withAlpha(PALETTE.foreDeep, 0.17)} />
          {/* Only when there is something to draw: a round cap at zero length
              still paints a dot, which reads as one step done rather than none. */}
          {pct > 0 && (
            <circle
              cx={mid}
              cy={mid}
              r={RING_R}
              stroke="var(--terracotta)"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - pct / 100)}
            />
          )}
        </g>
      </svg>
      <span className="home__ringpct" style={{ color: W_INK }}>
        {pct}
        <i>%</i>
      </span>
    </div>
  );
}

/** The screen before the trail: the trailhead itself, dust already drifting
    through lantern-lit dawn air, and one pill to walk through it.

    It reads your progress rather than greeting everyone the same way. Coming
    back, you get the arc you have filled, the step you stopped on and a
    "Resume learning". Arriving for the first time there is no arc worth
    drawing, so the same slot carries what the course actually costs, and the
    button invites rather than resumes.

    Tapping it slides the title up into the centre of the bar it becomes on
    every other screen and the tagline into the spot underneath it, while
    everything that belongs only to this screen fades. Two measured docks
    landing at once, not one shared slide, because each piece has its own real
    target size and position in the bar. */
export default function HomeScreen({ onEnter }: { onEnter: () => void }) {
  const { completed, totalSteps, cursor, streak, topicQuizzes } = useApp();
  const [entering, setEntering] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [dockTransform, setDockTransform] = useState<string | null>(null);
  const [tagDockTransform, setTagDockTransform] = useState<string | null>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const tagRef = useRef<HTMLParagraphElement>(null);

  /* One completed step is the whole test. Anything softer -- a saved cursor, a
     visit -- is true of somebody who opened the app once and left, and calling
     that "resume" is a lie about what they will find. */
  const returning = completed.length > 0;
  /* Same formula as ProgressScreen, deliberately, so the two cannot disagree
     about the same number. */
  /* Clamped: `completed` is never filtered against the current curriculum, so
     dropping a step without bumping STORAGE_KEY leaves more ids saved than
     there are steps. Past 100 the ring's dash offset goes negative and the arc
     paints backwards, showing a gap while the label reads "103%". */
  const pct = Math.min(100, Math.round((completed.length / totalSteps) * 100));
  const worldsDone = Object.values(topicQuizzes).filter((r) => r.passed).length;
  /* Where the cursor is pointing, which is the next thing to do rather than
     the last thing done. globalIndexOf clamps a topic's over-range step onto
     its quiz, so this is always a real entry. */
  const next = JOURNEY[globalIndexOf(cursor.topic, cursor.step)];

  const handleEnter = () => {
    if (entering) return;

    /* Both docked pieces are still running `home-rise`, which starts 14px low.
       Measuring mid-flight computes a translate short by however far it still
       had to rise, and `entering` then snaps them to their true position, so
       the title landed above the bar's brand slot. Finish first, then measure. */
    for (const el of [brandRef.current, tagRef.current]) {
      el?.getAnimations().forEach((a) => a.finish());
    }

    if (brandRef.current) {
      const scale = scaleFor(brandRef.current, DOCK_SIZE);
      const dockLeft = centeredDockLeft(brandRef.current, scale);
      setDockTransform(dockTransformFor(brandRef.current, dockLeft, DOCK_TOP, scale));
    }
    if (tagRef.current) {
      const scale = scaleFor(tagRef.current, TAG_DOCK_SIZE);
      const dockLeft = centeredDockLeft(tagRef.current, scale);
      setTagDockTransform(dockTransformFor(tagRef.current, dockLeft, TAG_DOCK_TOP, scale));
    }

    setEntering(true);
    /* Two states, not one, and a beat apart on purpose. Each docked piece's
       own arrival used an animation with fill:both, which keeps holding its
       transform forever once it finishes rather than handing the property
       back -- a held animation value always wins over a transition on that
       same property, so setting the slide's target value in the very same
       update that cancels the animation is a no-op; the browser never sees a
       "before" and "after" to transition between. `entering` cancels the
       animation and freezes everything at its current value; `sliding`,
       committed as a genuinely separate render a moment later, is what the
       transition has something real to animate from. A timeout rather than
       requestAnimationFrame: rAF can be throttled to well under one tick a
       frame on a backgrounded tab, and this needs two commits, not two
       painted frames. */
    window.setTimeout(() => setSliding(true), 20);
    /* Let the slide play out before the app mounts underneath -- matches the
       CSS transition, so the state change never outruns it. */
    window.setTimeout(onEnter, 640);
  };

  return (
    <div className={`home${entering ? ' home--entering' : ''}${sliding ? ' home--sliding' : ''}`}>
      <div className="home__art" aria-hidden="true">
        <TrailScape palette={PALETTE} />
      </div>
      <Particles biome="desert" palette={PALETTE} />
      {/* Same grain-and-vignette pass every world gets on the trail, so the
          one screen before it doesn't look like a different app. */}
      <div className="grade" aria-hidden="true" />

      {/* One column, one gap scale. The docked pieces measure their own live
          boxes at click time, so nesting them here costs the dock nothing. */}
      <div className="home__col">
        {returning ? (
          <div className="home__status">
            <ProgressRing pct={pct} done={completed.length} total={totalSteps} />
            <p className="home__statusline" style={{ color: W_INK_SOFT }}>
              {completed.length} of {totalSteps} steps
            </p>
          </div>
        ) : (
          /* No arc worth drawing yet, so the same slot answers the question a
             first-time visitor actually has: how big is this thing. */
          <p className="home__facts" style={{ color: W_INK_SOFT }}>
            <span>{TOPICS.length} topics</span>
            <span>{totalSteps} steps</span>
            <span>about {TOTAL_HOURS} hours</span>
          </p>
        )}

        {/* Grouped for the gap between them, not for a shared transform -- see
            the comment on TAG_DOCK_TOP above for why each docks on its own. */}
        <div className="home__lede">
          <h1
            ref={brandRef}
            className="home__brand"
            style={{
              color: W_INK,
              ...(sliding && dockTransform ? { transform: dockTransform } : null),
            }}
          >
            The Boring Way
          </h1>
          <p
            ref={tagRef}
            className="home__subtitle"
            style={{
              color: W_INK_SOFT,
              ...(sliding && tagDockTransform ? { transform: tagDockTransform } : null),
            }}
          >
            {/* One line, matching the bar's own tagline -- a full-width bar
                never wraps this, so forcing a break here would be the
                mismatch the dock is supposed to erase, not avoid it. */}
            AI practice, one step at a time
          </p>
        </div>

        {/* What you are walking into, named. The button alone said "learning";
            this says which learning, and how long it takes, which is the
            question somebody with ten spare minutes is actually asking. */}
        <div className="home__next" style={{ background: withAlpha(W_PANEL, 0.72) }}>
          <p className="home__nextlabel">
            {returning ? 'Next up' : 'First up'}
            <i aria-hidden="true">·</i>
            Topic {next.topic.number} of {TOPICS.length}
          </p>
          <h2 className="home__nexttitle" style={{ color: W_INK }}>
            {next.kind === 'step' ? next.step.title : next.topic.title}
          </h2>
          <p className="home__nextmeta" style={{ color: W_INK_SOFT }}>
            {next.kind === 'step' ? (
              <>
                <StepKindIcon kind={next.step.kind} size={19} />
                {KIND_LABEL[next.step.kind]}
                <i aria-hidden="true">·</i>
                {next.step.minutes} min
              </>
            ) : (
              <>
                <IconVerify size={19} />
                End-of-topic quiz
                <i aria-hidden="true">·</i>3 questions
              </>
            )}
          </p>
        </div>

        <div className="home__enter">
          {/* .home__start-fill carries the pill's own background and shadow on
              a layer of its own, so it fades out from under the label rather
              than the whole rectangle fading as one flat piece. */}
          <button type="button" className="home__start" onClick={handleEnter}>
            <span className="home__start-fill" aria-hidden="true" />
            <span className="home__start-label">
              {returning ? 'Resume learning' : 'Begin your AI journey'}
              <IconArrowRight size={20} />
            </span>
          </button>
        </div>

        {/* Only once there is something to report. Shown under the button
            rather than above it: it is a reward for coming back, not a thing
            to read before deciding to. */}
        {returning && (
          <p className="home__stats" style={{ color: W_INK_SOFT }}>
            {streak > 0 && (
              <span>
                <IconFlame size={17} lit />
                {streak} day streak
              </span>
            )}
            <span>
              {worldsDone} of {TOPICS.length} worlds
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/** The ratio that takes `el`'s rendered type down to the size it becomes in the
    top bar. Measured, not a constant: the title shrinks on short windows so it
    fits without clipping, and a hardcoded 17/44 would then land it at 14.7px in
    a bar expecting 17px. Reading the live value means the landing is right at
    every breakpoint, including any added later. */
function scaleFor(el: HTMLElement, targetPx: number): number {
  return targetPx / parseFloat(getComputedStyle(el).fontSize);
}

/** Measures `el`'s current box and returns the translate+scale that lands its
    centre at (dockLeft, dockTop) once shrunk by `scale` -- the one calculation
    both docked pieces share, just aimed at a different target each time.
    transform-origin stays centre (the default), so scaling alone keeps the
    element's own centre fixed; translating by (target centre - current centre)
    is what lands that centre at the docked spot, whatever the viewport size or
    however the text happens to have wrapped. A fixed vw/vh guess was tried
    first, for the title, and badly overshot -- it doesn't know the element's
    actual size, so "roughly toward the corner" landed well past it. */
function dockTransformFor(el: HTMLElement, dockLeft: number, dockTop: number, scale: number): string {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const targetCx = dockLeft + (r.width * scale) / 2;
  const targetCy = dockTop + (r.height * scale) / 2;
  return `translate(${(targetCx - cx).toFixed(1)}px, ${(targetCy - cy).toFixed(1)}px) scale(${scale})`;
}

/** The bar centres its brand column between two equal 1fr grid tracks, so the
    title and tagline's true horizontal target is always the viewport's own
    centre, not a fixed offset from the left edge -- a literal DOCK_LEFT
    constant would only be correct at one window width. dockTransformFor still
    wants a left edge to aim at, so this converts: a box of the given scaled
    width, centred on window.innerWidth / 2, has its left edge at centre minus
    half that width. */
function centeredDockLeft(el: HTMLElement, scale: number): number {
  const scaledWidth = el.getBoundingClientRect().width * scale;
  return window.innerWidth / 2 - scaledWidth / 2;
}
