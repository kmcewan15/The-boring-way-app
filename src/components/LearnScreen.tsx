import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FloatingIsland from '../art/FloatingIsland';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES, mixLandscape, withAlpha } from '../art/landscapes';
import {
  JOURNEY,
  WORLD_BOUNDARIES,
  entryKey,
  globalIndexOf,
  pathForTopic,
} from '../data/curriculum';
import { useApp } from '../state/useApp';
import QuizCard from './QuizCard';
import StepCard from './StepCard';
import { IconChevronDown } from './Icons';

/* The trail is ONE continuous rail across all ten topics, not one rail per
   topic. Scrolling past the last step of a topic carries straight on into the
   first step of the next, and the landscape palette blends between the two
   worlds as you cross, so the journey never cuts.

   Cards are placed by their distance from the step you are looking at: the
   focused one is large and low in the frame, the next ones recede up the path
   toward the horizon. `left` drifts right with distance because the trail's
   vanishing point is up on the right of the frame. */
const TIERS: Record<number, { bottom: number; left: number; scale: number; opacity: number }> = {
  [-2]: { bottom: -58, left: 44, scale: 1.1, opacity: 0 },
  [-1]: { bottom: -34, left: 47, scale: 1.06, opacity: 0 },
  0: { bottom: 8, left: 50, scale: 1, opacity: 1 },
  1: { bottom: 44, left: 58, scale: 0.34, opacity: 1 },
  2: { bottom: 56, left: 63, scale: 0.19, opacity: 0.5 },
  3: { bottom: 62, left: 66, scale: 0.12, opacity: 0 },
};

function tierFor(offset: number) {
  if (offset <= -2) return TIERS[-2];
  if (offset >= 3) return TIERS[3];
  return TIERS[offset];
}

/** How many steps out the next world starts rising on the horizon. */
const LEAD_STEPS = 2.2;

/* The palette morph is centred on the crossing rather than finishing before it:
   the old world holds while the new island is still on the horizon, then the
   colour washes over you as you step through. Values are distances to the
   boundary, so BLEND_FROM is ahead of it and BLEND_TO is just past it. */
const BLEND_FROM = 0.9;
const BLEND_TO = -0.4;

/** Cards rendered either side of the focused one. Anything further is invisible. */
const WINDOW = 4;

/* One scroll, one step. The rail's native wheel scrolling is turned off entirely;
   we read only the direction and snap to the neighbouring step.

   The unit is the *gesture*, not the event and not the distance. A scroll is not
   one wheel event: a flick fires a burst, and on a trackpad the momentum tail
   keeps firing for up to a second after your fingers have left. So a gesture
   yields exactly one step no matter how many events it contains or how far they
   add up to, and the next step needs a new gesture.

   A gesture ends when the wheel goes quiet for IDLE_MS. The exception is
   NEW_PUSH_DELTA: momentum decays, so a late event that is still large is not
   momentum, it is you pushing again -- without that, spinning a mouse wheel
   quickly would be read as one long gesture and stall on a single step. */
const IDLE_MS = 180;
const NEW_PUSH_DELTA = 90;

/* Ignore the wheel entirely for this long after a step. Long enough to outlast the
   loud part of a flick, so a hard one still counts as a single scroll; it also caps
   how fast a spun mouse wheel can walk, at roughly four steps a second. */
const SNAP_PAUSE_MS = 220;

/* How long the rail must be untouched before its position is believed over our
   own record of where we are heading. Only there to recover if something outside
   this component ever scrolls the rail; during a run of quick steps the rail lags
   behind on purpose, and reading it then walked the trail backwards. */
const RESYNC_IDLE_MS = 900;

const LAST = JOURNEY.length - 1;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export default function LearnScreen({
  onOpenExplore,
  onOpenEntry,
}: {
  onOpenExplore: () => void;
  onOpenEntry: (globalIndex: number) => void;
}) {
  const { cursor } = useApp();
  const cursorIndex = globalIndexOf(cursor.topic, cursor.step);

  /* The whole stage, not just the rail: the caption banner and the focused card's
     button sit above the rail and would otherwise swallow the wheel, so scrolling
     with the pointer over them did nothing. */
  const stageRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  /** Pending scroll read, so several events in one frame collapse into one. */
  const frame = useRef<number | null>(null);
  /* The step we are settled on, or snapping toward. Targets are worked out from
     here, so the most we ever ask for is this ± 1 and a skip is impossible. */
  const parked = useRef(cursorIndex);
  /** No step before this moment. See SNAP_PAUSE_MS. */
  const pausedUntil = useRef(0);
  /** When the last wheel event arrived, to tell one gesture from the next. */
  const lastWheelAt = useRef(0);
  /** Whether the current gesture may still produce a step. One each. */
  const armed = useRef(true);
  /** When we last moved, so a lagging rail is not mistaken for a real position. */
  const lastStepAt = useRef(0);
  /* Fractional scroll position in steps. Drives the palette blend and the
     parallax, so both move continuously rather than snapping per step. */
  const [scrollT, setScrollT] = useState(cursorIndex);

  /* Park the rail on wherever the learner actually is when that changes. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    /* Drop any queued read: it belongs to where we were, not where we are going. */
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    parked.current = cursorIndex;
    rail.scrollTo({ top: cursorIndex * rail.clientHeight, behavior: 'auto' });
    setScrollT(cursorIndex);
  }, [cursorIndex]);

  /* Scroll fires far faster than the screen repaints, so coalesce to one read per
     frame. Note this *reschedules* rather than bailing out while a read is
     pending: bailing out dropped the final events of a snap, and since no further
     event was coming, `scrollT` stayed stuck on a half-way value for good -- the
     rail was in the right place but the cards, palette and parallax were frozen.
     The last event must always win. */
  const onScroll = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const rail = railRef.current;
      if (!rail || rail.clientHeight === 0) return;
      const live = rail.scrollTop / rail.clientHeight;
      setScrollT(live);

      /* Keep `parked` honest, but only once the rail has been left alone long
         enough to have actually finished moving. Mid-run it trails our target by
         design, and believing it then walked the trail backwards. */
      if (performance.now() - lastStepAt.current > RESYNC_IDLE_MS) {
        const rounded = Math.round(live);
        if (Math.abs(live - rounded) < 0.02) parked.current = clamp(rounded, 0, LAST);
      }
    });
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        /* Must be nulled, not just cancelled. StrictMode mounts, cleans up, then
           mounts again; a stale handle left here made the read above think one was
           already pending and skip every scroll from then on. */
        frame.current = null;
      }
    },
    [],
  );

  /* Snaps the rail to a step. Native smooth scrolling does the animation: it
     still emits scroll events the whole way, which is what keeps the palette
     morph continuous, and there is no tween of ours left to stall. */
  const goTo = useCallback((i: number) => {
    const rail = railRef.current;
    if (!rail || rail.clientHeight === 0) return;
    const next = clamp(i, 0, LAST);
    parked.current = next;
    lastStepAt.current = performance.now();
    rail.scrollTo({ top: next * rail.clientHeight, behavior: 'smooth' });
  }, []);

  /* Take the wheel off the rail and drive it ourselves, one step at a time. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-to-zoom is the browser's business
      e.preventDefault();

      /* Ignore jitter and sideways swipes: the trail only runs up and down. */
      if (Math.abs(e.deltaY) < 1 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      /* Firefox reports lines and some setups report pages, so normalise before
         comparing against a pixel threshold. */
      const rail = railRef.current;
      const px =
        e.deltaMode === 1
          ? e.deltaY * 16
          : e.deltaMode === 2
            ? e.deltaY * (rail ? rail.clientHeight : 800)
            : e.deltaY;

      const now = performance.now();
      const quiet = now - lastWheelAt.current >= IDLE_MS;
      lastWheelAt.current = now;

      /* Settling from the last step. This must come BEFORE re-arming, or the big
         events still arriving from the burst that just stepped would re-arm the
         gesture that already spent itself -- which made one hard flick step twice. */
      if (now < pausedUntil.current) return;

      /* A new gesture: either the wheel went quiet, or this event is too big to be
         a decaying tail, which means you pushed again. */
      if (quiet || Math.abs(px) >= NEW_PUSH_DELTA) armed.current = true;

      /* This gesture has had its step. The rest of it moves nothing. */
      if (!armed.current) return;

      armed.current = false;
      pausedUntil.current = now + SNAP_PAUSE_MS;
      goTo(parked.current + (px > 0 ? 1 : -1));
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [goTo]);

  const focus = clamp(Math.round(scrollT), 0, LAST);

  /* Arrow keys walk the trail, straight across world boundaries. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      e.preventDefault();
      goTo(parked.current + (e.key === 'ArrowDown' ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  /* The world boundary you are heading toward. Both the palette morph and the
     horizon island are driven off how far away it is, so they move together.
     Kept slightly past the crossing so the morph can finish on the far side. */
  const boundary = WORLD_BOUNDARIES.find((b) => b - scrollT > -1.05);
  const lead = boundary === undefined ? Infinity : boundary - scrollT;

  /* ---- palette: morph the outgoing world into the incoming one -------------
     The pair is taken from either side of the boundary rather than from
     floor(scrollT), because once you are past the crossing the current step is
     already in the new world and there would be nothing left to blend from.
     Quantised so scrolling does not rebuild the palette (and repaint several
     hundred SVG paths) on every scroll event. */
  const morphing = boundary !== undefined && lead <= BLEND_FROM && lead >= BLEND_TO;
  const biomeA = morphing
    ? JOURNEY[boundary! - 1].topic.biome
    : JOURNEY[clamp(Math.round(scrollT), 0, LAST)].topic.biome;
  const biomeB = morphing ? JOURNEY[boundary!].topic.biome : biomeA;
  const rawBlend = morphing ? (BLEND_FROM - lead) / (BLEND_FROM - BLEND_TO) : 0;
  const blend = Math.round(clamp(rawBlend, 0, 1) * 20) / 20;
  const palette = useMemo(
    () => mixLandscape(LANDSCAPES[biomeA], LANDSCAPES[biomeB], blend),
    [biomeA, biomeB, blend],
  );

  /* Parallax is measured from the start of the current world, not from the start
     of the journey, so each world is its own climb instead of the scene zooming
     ever further in across all thirty-eight steps. */
  const worldStart = WORLD_BOUNDARIES.filter((b) => b <= scrollT).pop() ?? 0;
  const localT = clamp(scrollT - worldStart, 0, 8);

  /* ---- the next world, rising at the vanishing point as you approach it ---- */
  const nextWorld = useMemo(() => {
    if (boundary === undefined || lead > LEAD_STEPS) return null;

    const grow = clamp((LEAD_STEPS - lead) / LEAD_STEPS, 0, 1);
    /* Reaches full opacity well before the boundary so it reads as a crisp
       island on the horizon rather than a ghost behind the cards. */
    const appear = clamp(grow * 2.2, 0, 1);
    /* Once you are past the boundary it IS your world, so the preview clears. */
    const fade = lead >= 0 ? 1 : clamp(1 + lead / 0.9, 0, 1);
    const entry = JOURNEY[boundary];

    return {
      biome: entry.topic.biome,
      label: `Topic ${entry.topic.number} · ${entry.topic.title}`,
      opacity: appear * fade,
      scale: 0.3 + grow * 0.55,
      left: 72 - grow * 18,
      top: 27 + grow * 4,
    };
  }, [boundary, lead]);

  const focusEntry = JOURNEY[focus];
  const focusTopic = focusEntry.topic;
  const focusPath = pathForTopic(focusTopic.number);

  /* `memo` on the cards only holds if their props are referentially stable, and
     an inline `() => onOpenEntry(i)` would be a fresh function on every render,
     which would defeat it entirely. So: one cached callback per entry, reading
     `onOpenEntry` through a ref so a new one never invalidates the cache. Bounded
     by JOURNEY.length. */
  const openRef = useRef(onOpenEntry);
  useEffect(() => {
    openRef.current = onOpenEntry;
  }, [onOpenEntry]);

  const starters = useRef(new Map<number, () => void>());
  const starterFor = (i: number) => {
    let fn = starters.current.get(i);
    if (!fn) {
      fn = () => openRef.current(i);
      starters.current.set(i, fn);
    }
    return fn;
  };

  const from = Math.max(0, focus - WINDOW);
  const to = Math.min(LAST, focus + WINDOW);
  const visible = JOURNEY.slice(from, to + 1);

  return (
    <section className="trail" ref={stageRef}>
      {/* Landscape drifts as you move up the trail. Driven by the fractional
          position so it tracks the scroll rather than jumping per step. */}
      <div
        className="trail__art"
        style={{ transform: `translateY(${localT * 2.2}%) scale(${1 + localT * 0.045})` }}
      >
        <TrailScape palette={palette} />
      </div>

      {nextWorld && (
        <div
          className="trail__world"
          style={{
            left: `${nextWorld.left}%`,
            top: `${nextWorld.top}%`,
            opacity: nextWorld.opacity,
            transform: `translate(-50%, -50%) scale(${nextWorld.scale})`,
          }}
          aria-hidden="true"
          title={nextWorld.label}
        >
          <FloatingIsland biome={nextWorld.biome} />
        </div>
      )}

      <div className="trail__top">
        {focus !== cursorIndex && (
          <button
            type="button"
            className="pill fade-in"
            onClick={() => goTo(cursorIndex)}
          >
            <IconChevronDown size={22} />
            Current step
          </button>
        )}
      </div>

      {/* Invisible scroll surface: one snap page per entry, across every topic */}
      <div className="trail__rail" ref={railRef} onScroll={onScroll}>
        {JOURNEY.map((j) => (
          <div className="trail__page" key={entryKey(j)} />
        ))}
      </div>

      <div className="trail__cards">
        {visible.map((j) => {
          const offset = j.globalIndex - focus;
          const tier = tierFor(offset);
          const isFocused = offset === 0;
          return (
            <div
              key={entryKey(j)}
              className={`trailcard${isFocused ? ' trailcard--active' : ''}`}
              style={{
                bottom: `${tier.bottom}%`,
                left: `${tier.left}%`,
                opacity: tier.opacity,
                transform: `translateX(-50%) scale(${tier.scale})`,
                transformOrigin: '50% 100%',
                zIndex: 100 - j.globalIndex,
              }}
              aria-hidden={!isFocused}
            >
              {j.kind === 'step' ? (
                <StepCard
                  step={j.step}
                  index={j.indexInTopic}
                  total={j.topic.steps.length}
                  palette={LANDSCAPES[j.topic.biome]}
                  mini={!isFocused}
                  showCta={isFocused}
                  onStart={starterFor(j.globalIndex)}
                />
              ) : (
                <QuizCard
                  topic={j.topic}
                  palette={LANDSCAPES[j.topic.biome]}
                  mini={!isFocused}
                  showCta={isFocused}
                  onStart={starterFor(j.globalIndex)}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="sheet"
        /* Tinted from the same blended palette as the landscape, so the caption
           banner belongs to whichever world you are currently walking through. */
        style={{
          background: `linear-gradient(180deg, ${withAlpha(palette.sky, 0.8)} 0%, ${withAlpha(
            palette.sky,
            0.95,
          )} 46%, ${palette.sky} 100%)`,
          color: palette.foreDeep,
        }}
        onClick={onOpenExplore}
        aria-label={`Topic ${focusTopic.number}, ${focusTopic.title}. Open all topics`}
      >
        <div className="sheet__line">
          <b>Topic {focusTopic.number}</b> {focusTopic.title}
        </div>
        <div className="sheet__trail">The {focusPath.name} Path</div>
        <div className="sheet__hint">All topics</div>
      </button>
    </section>
  );
}
