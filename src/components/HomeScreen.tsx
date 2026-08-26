import { useRef, useState, type CSSProperties } from 'react';
import Particles from '../art/Particles';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES } from '../art/landscapes';

/* The desert is topic one -- Bring Claude to Life -- so this is literally the
   view from the trailhead, not a generic splash colour. Static rather than
   blended: nothing has been walked yet for a palette to blend from. */
const PALETTE = LANDSCAPES.desert;

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

/* Where the burger lands and how small it gets -- same idea as the title's
   dock above, aimed at the sidebar's nav toggle instead of its brand text.
   Top is the sidebar's own padding-top (34) plus the brand box's rendered
   height (title line-height 24 + 4 gap + tagline line-height ~17.6 ≈ 46) plus
   the toggle's own margin-top (22): 34 + 46 + 22 = 102. Left matches the
   sidebar's own padding-left (20) rather than the brand text's further-
   indented 30 -- the toggle lines up with the nav items below it, not the
   title above it. */
const BURGER_DOCK_TOP = 102;
const BURGER_DOCK_LEFT = 20;
const BURGER_SIZE = 88;
const BURGER_DOCK_SIZE = 46;
const BURGER_DOCK_SCALE = BURGER_DOCK_SIZE / BURGER_SIZE;

/** The screen before the trail: the trailhead itself, dust already drifting
    through lantern-lit dawn air, and a hamburger that is the door rather than
    a decoration next to one. Tapping it slides the title up into the corner
    it becomes on every other screen, sends the hamburger to the corner below
    it -- where it becomes the sidebar's own nav toggle -- and fades the hint
    text away to reveal the app underneath. */
export default function HomeScreen({ onEnter }: { onEnter: () => void }) {
  const [entering, setEntering] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [dockTransform, setDockTransform] = useState<string | null>(null);
  const [burgerDockTransform, setBurgerDockTransform] = useState<string | null>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    if (entering) return;

    /* Measured, not guessed. A fixed vw/vh translate was the first attempt
       and badly overshot -- it doesn't know the title's actual size, so
       "roughly toward the corner" landed well past the corner and off the
       edge of the screen entirely. transform-origin stays centre (the
       default), so scaling alone keeps the title's centre fixed; translating
       by (target centre − current centre) is what actually lands that centre
       at the docked spot, whatever the viewport size or however the title
       happens to have wrapped. */
    const el = brandRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const targetCx = DOCK_LEFT + (r.width * DOCK_SCALE) / 2;
      const targetCy = DOCK_TOP + (r.height * DOCK_SCALE) / 2;
      setDockTransform(
        `translate(${(targetCx - cx).toFixed(1)}px, ${(targetCy - cy).toFixed(1)}px) scale(${DOCK_SCALE})`,
      );
    }

    /* Same measured landing for the burger, aimed at the nav toggle's spot
       instead of the brand's. */
    const burgerEl = burgerRef.current;
    if (burgerEl) {
      const r = burgerEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const targetCx = BURGER_DOCK_LEFT + (r.width * BURGER_DOCK_SCALE) / 2;
      const targetCy = BURGER_DOCK_TOP + (r.height * BURGER_DOCK_SCALE) / 2;
      setBurgerDockTransform(
        `translate(${(targetCx - cx).toFixed(1)}px, ${(targetCy - cy).toFixed(1)}px) scale(${BURGER_DOCK_SCALE})`,
      );
    }

    setEntering(true);
    /* Two states, not one, and a beat apart on purpose. The title's own
       arrival used an animation with fill:both, which keeps holding its
       transform/opacity forever once it finishes rather than handing the
       property back -- a held animation value always wins over a
       transition on that same property, so setting the slide's target
       value in the very same update that cancels the animation is a no-op;
       the browser never sees a "before" and "after" to transition between.
       `entering` cancels the animation and freezes everything at its
       current value; `sliding`, committed as a genuinely separate render a
       moment later, is what the transition has something real to animate
       from. A timeout rather than requestAnimationFrame: rAF can be
       throttled to well under one tick a frame on a backgrounded or
       otherwise deprioritised tab, and this only needs two distinct commits,
       not two painted frames. */
    window.setTimeout(() => setSliding(true), 20);
    /* Let the slide and the fade play out before the app mounts underneath --
       matches the CSS transition below, so the state change never outruns it. */
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

      <div
        ref={brandRef}
        className="home__brand"
        style={sliding && dockTransform ? ({ transform: dockTransform } as CSSProperties) : undefined}
      >
        The Boring Way
        <span>AI practice, one step at a time</span>
      </div>

      <div className="home__enter">
        <button
          ref={burgerRef}
          type="button"
          className="home__burger"
          onClick={handleEnter}
          aria-label="Start"
          style={
            sliding && burgerDockTransform
              ? ({ transform: burgerDockTransform } as CSSProperties)
              : undefined
          }
        >
          <i />
          <i />
          <i />
        </button>
        <p className="home__hint">Tap to begin</p>
      </div>
    </div>
  );
}
