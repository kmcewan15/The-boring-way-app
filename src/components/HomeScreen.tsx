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
   colours the top bar actually lands in, but not the same colours, so even a
   pixel-perfect slide still landed on a colour that then had to jump to the
   right one. Reading the true target colour here instead means there is
   nothing left to jump. */
const W_INK = PALETTE.foreDeep;
const W_INK_SOFT = mixHex(PALETTE.foreDeep, PALETTE.sky, 0.06);
const W_PANEL = mixHex(PALETTE.sky, PALETTE.fore, 0.13);

/* Where the title lands and how small it gets. Top is fixed -- the bar's own
   72px height, minus the brand block's total rendered height (title 20 +
   gap 4 + tagline 12 = 36, all set in px in .topbar__brand precisely so this
   division comes out even), halved to centre it: (72 - 36) / 2 = 18. Left is
   NOT fixed, unlike the old sidebar's left-aligned brand: the bar centres
   its brand column between two equal 1fr grid tracks, so the true target is
   always the viewport's own horizontal centre, whatever the window width --
   handleEnter computes that at click time instead of guessing a literal
   offset here. */
const DOCK_TOP = 18;
const DOCK_FONT = 44;
const DOCK_SIZE = 17;
const DOCK_SCALE = DOCK_SIZE / DOCK_FONT;

/* Where the tagline lands -- its own measured dock, not a ride-along on the
   title's. Nested inside the title's own transformed box, it could only ever
   scale by the title's own ratio, landing nowhere near the bar's real 10px
   tagline. Top is the title's own dock top (18) plus its real line-height
   (20) plus the bar's own margin-top between title and tagline (4): 18 + 20
   + 4 = 42. Horizontal centre is computed the same way as the title's, at
   click time -- see DOCK_TOP above. */
const TAG_DOCK_TOP = 42;
const TAG_FONT = 17;
const TAG_DOCK_SIZE = 10;
const TAG_SCALE = TAG_DOCK_SIZE / TAG_FONT;

/* Where the burger lands and how small it gets -- same idea as the title's
   dock above, aimed at the bar's own hamburger instead of its brand text.
   This one still docks to a literal corner rather than a computed centre --
   the bar's hamburger stays left-anchored regardless of viewport width, so
   there's nothing to compute. Top is (72 - 44) / 2 = 14, centring the 44px
   button in the bar's own 72px height the same way align-items: center does
   for the real one. Left matches the bar's own left padding (26) -- the
   hamburger sits flush with the bar's edge, not indented under the brand. */
const BURGER_DOCK_TOP = 14;
const BURGER_DOCK_LEFT = 26;
/* The hamburger is a chip inside the "Start learning" pill now, not a second
   button doing the same thing next to it (see .home__start-icon below) --
   56px is that chip's own size, sized to the pill's height rather than to
   stand alone the way an 88px icon-only button needed to. Still docks to the
   same 44px bar target either way. */
const BURGER_SIZE = 56;
const BURGER_DOCK_SIZE = 44;
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

/** The bar centres its brand column between two equal 1fr grid tracks, so the
    title and tagline's true horizontal target is always the viewport's own
    centre, not a fixed offset from the left edge the way the old left-
    aligned sidebar brand was -- a literal DOCK_LEFT constant would only be
    correct at one window width. dockTransformFor still wants a left edge to
    aim at, though, so this converts: a box of the given scaled width,
    centred on window.innerWidth / 2, has its left edge at centre minus half
    that width. */
function centeredDockLeft(el: HTMLElement, scale: number): number {
  const scaledWidth = el.getBoundingClientRect().width * scale;
  return window.innerWidth / 2 - scaledWidth / 2;
}

/** The screen before the trail: the trailhead itself, dust already drifting
    through lantern-lit dawn air, and one "Start learning" pill to walk
    through it -- a hamburger chip on its own read as a second way to do what
    the labelled button already did, so the two are one control now, not two.
    Tapping it slides the title up into the centre of the bar it becomes on
    every other screen, the tagline into the spot it becomes underneath
    that, and the hamburger chip out of the pill entirely and into the bar's
    left corner -- where it becomes the top bar's own hamburger, opener of
    the nav drawer -- while the rest of the pill and its label just dissolve.
    Three separate docks landing at once, not one shared slide, because each
    of those three pieces has its own real target size and position in the
    bar, not a shared one. */
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
      const dockLeft = centeredDockLeft(brandRef.current, DOCK_SCALE);
      setDockTransform(dockTransformFor(brandRef.current, dockLeft, DOCK_TOP, DOCK_SCALE));
    }
    if (tagRef.current) {
      const dockLeft = centeredDockLeft(tagRef.current, TAG_SCALE);
      setTagDockTransform(dockTransformFor(tagRef.current, dockLeft, TAG_DOCK_TOP, TAG_SCALE));
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
          {/* One line, matching the bar's own tagline -- unlike the old
              narrow sidebar, a full-width bar never wraps this, so forcing a
              break here would be the mismatch the dock is supposed to erase,
              not avoid it. */}
          AI practice, one step at a time
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
