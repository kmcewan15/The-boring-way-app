import { useRef, useState } from 'react';
import Particles from '../art/Particles';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES, mixHex } from '../art/landscapes';

/* The desert is topic one -- Bring Claude to Life -- so this is literally the
   view from the trailhead, not a generic splash colour. Static rather than
   blended: nothing has been walked yet for a palette to blend from. */
const PALETTE = LANDSCAPES.desert;

/* The same --w-ink / --w-ink-soft / --w-panel LearnScreen writes onto the
   document root once it mounts, computed here from that same fixed desert
   palette instead. Module-level, not per-render: this palette never changes,
   so there is nothing to recompute. Without this the title, tagline and
   hamburger were drawn in the app's generic fixed tokens (--terracotta-deep,
   --rock-mid, --pink-cream) -- close cousins of the real desert-tinted
   colours the sidebar actually lands in, but not the same colours, so even a
   pixel-perfect slide still landed on a colour that then had to jump to the
   right one. Reading the true target colour here instead means there is
   nothing left to jump. */
const W_INK = PALETTE.foreDeep;
const W_INK_SOFT = mixHex(PALETTE.foreDeep, PALETTE.sky, 0.06);
const W_PANEL = mixHex(PALETTE.sky, PALETTE.fore, 0.13);

/* Where the title lands and how small it gets -- lifted straight from the
   sidebar's own numbers (.side padding 34px/20px + .side__brand padding
   0/10px = 34,30; .side__brand font-size 20px, trimmed down from 23px so
   "Way" stops wrapping onto its own line) so the docked title sits exactly
   where the real sidebar brand text will be the instant the app shell
   mounts underneath, not just "somewhere near the corner". */
const DOCK_TOP = 34;
const DOCK_LEFT = 30;
const DOCK_FONT = 44;
const DOCK_SCALE = 20 / DOCK_FONT;

/* Where the tagline lands -- its own measured dock, not a ride-along on the
   title's. Nested inside the title's own transformed box, it could only ever
   scale by the title's 20/44 ratio, which shrinks this 17px source line to
   under 8px -- nowhere near the sidebar's real 13px tagline. Top is the
   title's real line height at 20px (24, line-height 1.2) plus the sidebar
   tagline's own margin-top (4): 34 + 24 + 4 = 62. Left matches the title's,
   same padding context inside .side__brand. */
const TAG_DOCK_TOP = 62;
const TAG_DOCK_LEFT = 30;
const TAG_FONT = 17;
const TAG_DOCK_SIZE = 13;
const TAG_SCALE = TAG_DOCK_SIZE / TAG_FONT;

/* Where the burger lands and how small it gets -- same idea as the title's
   dock above, aimed at the sidebar's own hamburger instead of its brand text.
   Top is the sidebar's own padding-top (34) plus the brand box's rendered
   height (title line-height 24 + 4 gap + tagline line-height ~17.6 ≈ 46) plus
   the hamburger's own margin-top (22): 34 + 46 + 22 = 102. Left matches the
   sidebar's own padding-left (20) rather than the brand text's further-
   indented 30 -- the hamburger lines up with .side__stage below it, not the
   title above it. */
const BURGER_DOCK_TOP = 102;
const BURGER_DOCK_LEFT = 20;
/* The hamburger is a chip inside the "Start learning" pill now, not a second
   button doing the same thing next to it (see .home__start-icon below) --
   56px is that chip's own size, sized to the pill's height rather than to
   stand alone the way an 88px icon-only button needed to. Still docks to the
   same 46px sidebar target either way. */
const BURGER_SIZE = 56;
const BURGER_DOCK_SIZE = 46;
const BURGER_DOCK_SCALE = BURGER_DOCK_SIZE / BURGER_SIZE;

/** Measures `el`'s current box and returns the translate+scale that lands its
    centre at (dockLeft, dockTop) once shrunk by `scale` -- the one calculation
    every docked piece (title, tagline, burger) shares, just aimed at a
    different target each time. transform-origin stays centre (the default),
    so scaling alone keeps the element's own centre fixed; translating by
    (target centre − current centre) is what actually lands that centre at the
    docked spot, whatever the viewport size or however the text happens to
    have wrapped. A fixed vw/vh guess was tried first, for the title, and badly
    overshot -- it doesn't know the element's actual size, so "roughly toward
    the corner" landed well past the corner and off the edge of the screen. */
function dockTransformFor(el: HTMLElement, dockLeft: number, dockTop: number, scale: number): string {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const targetCx = dockLeft + (r.width * scale) / 2;
  const targetCy = dockTop + (r.height * scale) / 2;
  return `translate(${(targetCx - cx).toFixed(1)}px, ${(targetCy - cy).toFixed(1)}px) scale(${scale})`;
}

/** The screen before the trail: the trailhead itself, dust already drifting
    through lantern-lit dawn air, and one "Start learning" pill to walk
    through it -- a hamburger chip on its own read as a second way to do what
    the labelled button already did, so the two are one control now, not two.
    Tapping it slides the title into the corner it becomes on every other
    screen, the tagline into the corner it becomes underneath that, and the
    hamburger chip out of the pill entirely and into the corner below both --
    where it becomes the sidebar's own hamburger, opener of the nav drawer --
    while the rest of the pill and its label just dissolve. Three separate
    docks landing at once, not one shared slide, because each of those three
    pieces has its own real target size and position in the sidebar, not a
    shared one. */
export default function HomeScreen({ onEnter }: { onEnter: () => void }) {
  const [entering, setEntering] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [dockTransform, setDockTransform] = useState<string | null>(null);
  const [tagDockTransform, setTagDockTransform] = useState<string | null>(null);
  const [burgerDockTransform, setBurgerDockTransform] = useState<string | null>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLParagraphElement>(null);
  const burgerRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (entering) return;

    if (brandRef.current) {
      setDockTransform(dockTransformFor(brandRef.current, DOCK_LEFT, DOCK_TOP, DOCK_SCALE));
    }
    if (tagRef.current) {
      setTagDockTransform(dockTransformFor(tagRef.current, TAG_DOCK_LEFT, TAG_DOCK_TOP, TAG_SCALE));
    }
    if (burgerRef.current) {
      setBurgerDockTransform(
        dockTransformFor(burgerRef.current, BURGER_DOCK_LEFT, BURGER_DOCK_TOP, BURGER_DOCK_SCALE),
      );
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
       frame on a backgrounded or otherwise deprioritised tab, and this only
       needs two distinct commits, not two painted frames. */
    window.setTimeout(() => setSliding(true), 20);
    /* Let the slide play out before the app mounts underneath -- matches the
       CSS transition below, so the state change never outruns it. */
    window.setTimeout(onEnter, 640);
  };

  return (
    <div
      className={`home${entering ? ' home--entering' : ''}${sliding ? ' home--sliding' : ''}`}
    >
      <div className="home__art" aria-hidden="true">
        <TrailScape palette={PALETTE} />
      </div>
      <Particles biome="desert" palette={PALETTE} />
      {/* Same grain-and-vignette pass every world gets on the trail, so the
          one screen before it doesn't look like a different app. */}
      <div className="grade" aria-hidden="true" />

      {/* Grouped for the gap between them, not for a shared transform -- see
          the comment on TAG_DOCK_TOP above for why each docks on its own. */}
      <div className="home__lede">
        <div
          ref={brandRef}
          className="home__brand"
          style={{
            color: W_INK,
            ...(sliding && dockTransform ? { transform: dockTransform } : null),
          }}
        >
          The Boring Way
        </div>
        <p
          ref={tagRef}
          className="home__subtitle"
          style={{
            color: W_INK_SOFT,
            ...(sliding && tagDockTransform ? { transform: tagDockTransform } : null),
          }}
        >
          {/* Forced at the same point the sidebar's own tagline wraps to on
              its own, at 264px wide -- this page has the whole screen to
              work with and would otherwise sit on one line, which is exactly
              the mismatch the dock is supposed to erase. */}
          AI practice, one
          <br />
          step at a time
        </p>
      </div>

      <div className="home__enter">
        {/* One control, not two -- the hamburger is this pill's own leading
            chip rather than a second button beside it doing the same thing.
            .home__start-fill carries the pill's own background/shadow on a
            layer of its own so it can fade out from under the chip and the
            label independently, rather than the whole button (chip included)
            fading as one flat rectangle. */}
        <button type="button" className="home__start" onClick={handleEnter} aria-label="Start learning">
          <span className="home__start-fill" aria-hidden="true" />
          <span
            ref={burgerRef}
            className="home__start-icon"
            style={{
              color: W_INK,
              backgroundColor: W_PANEL,
              ...(sliding && burgerDockTransform ? { transform: burgerDockTransform } : null),
            }}
          >
            <i />
            <i />
            <i />
          </span>
          <span className="home__start-label">Start learning</span>
        </button>
      </div>
    </div>
  );
}
