import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import FloatingIsland from '../art/FloatingIsland';
import Particles from '../art/Particles';
import TrailScape from '../art/TrailScape';
import { LANDSCAPES, mixHex, mixLandscape, withAlpha } from '../art/landscapes';
import {
  JOURNEY,
  TOPICS,
  WORLD_BOUNDARIES,
  entryKey,
  globalIndexOf,
} from '../data/curriculum';
import { useApp } from '../state/useApp';
import { clearJump, setViewIndex, useJumpTarget } from '../state/viewStore';
import JourneyMap from './JourneyMap';
import QuizCard from './QuizCard';
import StepCard from './StepCard';
import { IconArrowRight, IconChevronDown } from './Icons';

/* The trail is ONE continuous rail across all ten topics, not one rail per
   topic. Scrolling past the last step of a topic carries straight on into the
   first step of the next, and the landscape palette blends between the two
   worlds as you cross, so the journey never cuts.

   Cards are placed by their distance from the step you are looking at: the
   focused one is large and low in the frame, the next ones recede up the path
   toward the horizon. `left` drifts right with distance because the trail's
   vanishing point is up on the right of the frame. */
/* `depth` picks which card gets drawn; distance is carried by real width rather
   than a scale transform. Scaling shrank strokes, corner radii and shadows along
   with the type, so a distant card looked like a blurry sticker instead of a small
   crisp object -- and its 27px title landed at 9px, then 5px. */
const TIERS: Record<
  number,
  { bottom: number; left: number; opacity: number; depth: 0 | 1 | 2; blur: number }
> = {
  [-2]: { bottom: -58, left: 44, opacity: 0, depth: 0, blur: 0 },
  [-1]: { bottom: -34, left: 47, opacity: 0, depth: 0, blur: 0 },
  0: { bottom: 8, left: 50, opacity: 1, depth: 0, blur: 0 },
  /* These clear the focused card rather than tucking behind it. The old values
     assumed cards scaled to a third of their size; at real widths they collided,
     burying d1's lower half and hiding d2 almost completely behind d1. */
  1: { bottom: 53, left: 63, opacity: 1, depth: 1, blur: 0 },
  /* Clear of tier 1 at every window size, not just wide ones. At 1366x768 these
     used to overlap by 69x37px, which left the far marker as a sliver poking out
     from behind the near card rather than reading as a point further up the trail. */
  2: { bottom: 75, left: 76, opacity: 0.9, depth: 2, blur: 0.7 },
  3: { bottom: 82, left: 81, opacity: 0, depth: 2, blur: 1.6 },
};

function tierFor(offset: number) {
  if (offset <= -2) return TIERS[-2];
  if (offset >= 3) return TIERS[3];
  return TIERS[offset];
}

/** How many steps out the next world starts rising on the horizon. */
const LEAD_STEPS = 2.2;

/* The crossing runs over the single step before the boundary and is *finished* on
   arrival. Values are distances to the boundary, so the blend starts one step out
   and completes as you land on the new world's first entry.

   It used to be centred on the crossing, ending 0.4 steps past it. That was fine
   for a colour morph, but each world now has a photograph, and arriving at the
   first step of the jungle while the desert was still 30% opaque read as a double
   exposure rather than a transition. */
const BLEND_FROM = 1;
const BLEND_TO = 0;

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

/* First and last journey index of each world, so a world's photograph can be
   panned across exactly its own stretch of the trail rather than the whole
   forty-eight. */
const WORLD_SPAN = new Map<number, { first: number; last: number }>();
JOURNEY.forEach((entry, i) => {
  const span = WORLD_SPAN.get(entry.topic.number);
  if (span) span.last = i;
  else WORLD_SPAN.set(entry.topic.number, { first: i, last: i });
});

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export default function LearnScreen({
  onOpenExplore,
  onOpenEntry,
}: {
  onOpenExplore: () => void;
  onOpenEntry: (globalIndex: number) => void;
}) {
  const { cursor, completed, totalSteps, isCompleted } = useApp();
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

  /* A world picked from the nav drawer, which can be opened -- and can pick a
     world -- from any tab, not just this one. If Learn wasn't already
     mounted, the request was waiting in the store before this component
     existed; the effect below still sees it on the very first render, right
     after the mount effect above has already parked the rail on the cursor,
     so this reads as "arrive, then glide on to the picked world" rather than
     a fight over where the rail starts. */
  const jumpTarget = useJumpTarget();
  useEffect(() => {
    if (jumpTarget === null) return;
    goTo(jumpTarget);
    clearJump();
  }, [jumpTarget, goTo]);

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
  /* The outgoing and incoming worlds. Everything that changes across a crossing --
     palette, and now the photographic backdrop -- is driven off this one pair, so
     the colour and the picture always move together. */
  const topicA = morphing
    ? JOURNEY[boundary! - 1].topic
    : JOURNEY[clamp(Math.round(scrollT), 0, LAST)].topic;
  const topicB = morphing ? JOURNEY[boundary!].topic : topicA;
  const biomeA = topicA.biome;
  const biomeB = topicB.biome;
  const rawBlend = morphing ? (BLEND_FROM - lead) / (BLEND_FROM - BLEND_TO) : 0;
  /* Quantised to 5% for the palette only: every distinct value rebuilds the
     landscape's several hundred SVG paths, so it is deliberately coarse. */
  const blend = Math.round(clamp(rawBlend, 0, 1) * 20) / 20;
  /* Photographs are two stacked layers and cost nothing to recolour, so they use
     the continuous value -- the coarse one made the dissolve visibly step through
     twenty stages. */
  const blendSmooth = clamp(rawBlend, 0, 1);
  const palette = useMemo(
    () => mixLandscape(LANDSCAPES[biomeA], LANDSCAPES[biomeB], blend),
    [biomeA, biomeB, blend],
  );

  /* Walks a world's photograph as you walk the world: the foot of the path at its
     first entry, the far end -- the waterfall -- at its last. `cover` on a tall
     image renders it far taller than the stage, and a background-position
     percentage interpolates across exactly that overflow, so the whole picture
     gets used without needing to know its height.

     Each layer is panned by its own world, which matters mid-crossing: the world
     you are leaving sits at the top of its path while the one arriving is still at
     the foot of its own. */
  /* 0 at the top of the picture, 1 at the bottom -- read by --pan on the photo
     layer, which turns it into a composited translate. A world starts at the foot
     of the path (1) and climbs to the landmark at the top (0). */
  const panFor = (topicNumber: number) => {
    const span = WORLD_SPAN.get(topicNumber);
    if (!span || span.last === span.first) return 1;
    const p = clamp((scrollT - span.first) / (span.last - span.first), 0, 1);
    return 1 - p;
  };

  /* Tell the rest of the app which entry is on screen, so the top bar can describe
     what you are looking at rather than where you left off -- it was reading the
     saved cursor while wearing the viewed world's colours, which contradicted
     itself. Cleared on unmount so other tabs fall back to the cursor. */
  useEffect(() => {
    setViewIndex(focus);
  }, [focus, setViewIndex]);

  useEffect(() => () => setViewIndex(null), [setViewIndex]);

  /* Hand the world's colours to the app chrome as CSS custom properties rather
     than as React state. The top bar sits outside this component, and putting a
     per-frame palette into shared state would re-render the whole tree on every
     scroll -- these are written straight to the document instead, so the top bar
     recolours with no React work at all. Only fires when the blend actually
     changes, since `palette` is memoised on the quantised value. */
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--w-chrome', palette.sky);
    root.setProperty('--w-panel', mixHex(palette.sky, palette.fore, 0.13));
    root.setProperty('--w-ink', palette.foreDeep);
    /* Only 6% toward the pale end. Measured across all seven biomes: 30% put the
       small labels at 3.5:1 and 14% still left the blossom world at 4.47:1, both
       under AA. Muted enough to read as secondary, dark enough everywhere. */
    root.setProperty('--w-ink-soft', mixHex(palette.foreDeep, palette.sky, 0.06));
    root.setProperty('--w-accent', palette.fore);
    root.setProperty('--w-line', withAlpha(palette.foreDeep, 0.16));
    root.setProperty('--w-hover', withAlpha(palette.foreDeep, 0.08));
    /* The "Current step" pill floats over the photograph rather than sitting on a
       solid surface, so it stays nearly opaque: at the old 0.76 a dark patch of
       photo showing through dragged the pill down toward its own ink, measuring
       3.4:1 on the blossom world. 0.93 holds every world at 5.2:1 or better even
       against pure black, and the backdrop blur still reads as glass. */
    root.setProperty('--w-glass', withAlpha(palette.sky, 0.93));
    root.setProperty('--w-glass-hi', withAlpha(palette.sky, 1));
  }, [palette]);

  /* Parallax is measured from the start of the current world, not from the start
     of the journey, so each world is its own climb instead of the scene zooming
     ever further in across all thirty-eight steps. */
  const worldStart = WORLD_BOUNDARIES.filter((b) => b <= scrollT).pop() ?? 0;
  const localT = clamp(scrollT - worldStart, 0, 8);

  /* One entry per world with a photograph, outgoing first. Built as a keyed list
     rather than two conditionals so React can tell the layers apart. */
  const photoLayers = [
    topicA.photo
      ? { key: topicA.number, photo: topicA.photo, pan: panFor(topicA.number), opacity: 1 - blendSmooth }
      : null,
    topicB !== topicA && topicB.photo
      ? { key: topicB.number, photo: topicB.photo, pan: panFor(topicB.number), opacity: blendSmooth }
      : null,
  ].filter((l): l is NonNullable<typeof l> => l !== null);

  /* ---- the next world, rising at the vanishing point as you approach it ----
     Skipped when either side of the crossing has a photograph: against a
     photographic backdrop the little illustrated island reads as a sticker stuck
     on top, and a picture dissolving in or out is already the preview. */
  const nextWorld = useMemo(() => {
    if (boundary === undefined || lead > LEAD_STEPS) return null;
    if (JOURNEY[boundary].topic.photo || JOURNEY[boundary - 1].topic.photo) return null;

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

  /* ---- arriving in a new world -------------------------------------------
     Crossing a boundary is the most worked-on moment in the app -- two
     photographs dissolving while the palette, the chrome and the caption all
     migrate together -- and with nothing to mark it, it passes unremarked. This
     announces it.

     Keyed off the topic NUMBER rather than the topic object, so it fires once per
     crossing instead of on every render that happens to produce a new object. The
     ref swallows the first paint: arriving where you already were is not an
     arrival, and without it this would fanfare on every reload. */
  /* The map lives with the trail rather than in App, so opening it needs no prop
     drilled down and no change to the shell. It closes itself on Escape and on a
     second `m`. */
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'm' && e.key !== 'M') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      setMapOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [arrival, setArrival] = useState<{ n: number; title: string; at: number } | null>(
    null,
  );
  const lastWorld = useRef<number | null>(null);
  const focusNumber = focusTopic.number;

  /* The title is read through a ref so it is not a dependency: it is a pure
     function of the number, and listing it would only add a way for the effect to
     re-run without a crossing having happened. */
  const titleRef = useRef(focusTopic.title);
  titleRef.current = focusTopic.title;

  useEffect(() => {
    if (lastWorld.current === null) {
      lastWorld.current = focusNumber;
      return;
    }
    if (lastWorld.current === focusNumber) return;
    lastWorld.current = focusNumber;
    setArrival({ n: focusNumber, title: titleRef.current, at: performance.now() });
    const id = window.setTimeout(() => setArrival(null), 2600);
    return () => window.clearTimeout(id);
  }, [focusNumber]);

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
      <div className="trail__art">
        {/* The generated landscape is the floor of this stack: it shows through
            wherever a world has no photo of its own, and it keeps morphing colour
            underneath one that does. Its drift stays on this inner wrapper so it
            cannot compound with the photo pan below, which moves the picture
            itself. */}
        <div
          className="trail__parallax"
          style={{ transform: `translateY(${localT * 2.2}%) scale(${1 + localT * 0.045})` }}
        >
          <TrailScape palette={palette} />
        </div>

        {/* Two photo layers, outgoing over incoming, cross-faded on the very same
            `blend` that drives the palette -- so one picture dissolves into the
            next exactly as you step across the boundary. A world without a photo
            contributes nothing and simply reveals the landscape below.

            KEYED BY TOPIC, and it has to be. Without keys React matches these by
            position, so the moment the crossing ended and the list went from two
            layers to one it reused the outgoing world's node and mutated it into
            the incoming one -- which, with a transition on background-position,
            swept the new picture the entire way from top to bottom over 820ms
            while the correctly-positioned node was thrown away. Keys let the
            arriving layer simply survive and the departing one unmount. */}
        {photoLayers.map((layer) => (
          <div
            key={layer.key}
            className="trail__photo"
            style={{ opacity: layer.opacity }}
            aria-hidden="true"
          >
            <i
              style={
                {
                  backgroundImage: `url(${layer.photo})`,
                  '--pan': layer.pan,
                } as CSSProperties
              }
            />
          </div>
        ))}

        {/* Above the landscape and any photo so its motes read as sitting in
            the air over the scene, but still inside .trail__art so .grade's
            vignette and grain settle over them exactly as they do everything
            else -- otherwise they'd be the one thing in the frame that never
            aged into the picture. Biome picks *what* drifts; the current
            (possibly blending) palette picks its colour, so the dust doesn't
            jump hue independently of the world it's drifting through. */}
        <Particles biome={focusTopic.biome} palette={palette} />
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

      {/* Grades the landscape only -- z-index puts it under every card and
          control. See .grade. */}
      <div className="grade" aria-hidden="true" />

      {/* How far along the course you are. One segment per topic, each as wide as
          that topic has steps, so the filled length across the whole bar equals
          overall progress while the divisions still show the ten chapters.

          Counts steps only, matching the top bar's own Progress row -- passing a
          quiz is not a 39th step. */}
      <div
        className="coursebar"
        role="progressbar"
        aria-label="Course progress"
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-valuenow={completed.length}
        aria-valuetext={`${completed.length} of ${totalSteps} steps complete`}
        title={`${completed.length} of ${totalSteps} steps · ${Math.round(
          (completed.length / totalSteps) * 100,
        )}%`}
      >
        <span className="coursebar__pct">
          {Math.round((completed.length / totalSteps) * 100)}
          <small>%</small>
        </span>

        {TOPICS.map((topic, i) => {
          const done = topic.steps.filter((s) => isCompleted(s.id)).length;
          const fill = done / topic.steps.length;
          /* Tooltips at the ends would hang off the screen, so the outermost two
             on each side align to their edge instead of centring. */
          const align = i <= 1 ? ' coursebar__slot--l' : i >= TOPICS.length - 2 ? ' coursebar__slot--r' : '';
          return (
            <button
              key={topic.id}
              type="button"
              /* A scrubber, not a bookmark: this walks the trail to that world and
                 leaves your saved place alone. Moving the cursor here would claim
                 you had left off somewhere you were only glancing at. */
              onClick={() => goTo(globalIndexOf(topic.number, 0))}
              aria-label={`Topic ${topic.number}, ${topic.title}. ${done} of ${topic.steps.length} steps complete. Go to this world`}
              className={[
                'coursebar__slot',
                align.trim(),
                /* The world on screen. */
                topic.number === focusTopic.number ? 'coursebar__slot--here' : '',
                /* Every step done: earns the full glow. */
                fill === 1 ? 'coursebar__slot--full' : '',
                /* The head of your progress, which is where the cursor is rather
                   than wherever you have scrolled to look. Carries the bright cap. */
                topic.number === cursor.topic ? 'coursebar__slot--front' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              /* flex-grow by step count, so a five-step world is wider than a
                 three-step one and the bar stays proportional. --fill drives the
                 fill, the sheen's width and the cap's position from one number. */
              style={{ flexGrow: topic.steps.length, '--fill': fill } as CSSProperties}
            >
              {/* The track clips the fill and the sheen. The cap and the tooltip
                  sit outside it, or the clip would cut the cap's glow off and
                  swallow the tooltip entirely. */}
              <span className="coursebar__seg">
                <i />
                <b />
              </span>
              {/* The world's own number, not just a mark -- so the bar reads as
                  "ten worlds, here's which one" rather than ten identical beads
                  you'd have to count. A small chip rather than bare text sitting
                  on the track, so the number stays legible over the fill, the
                  empty track and whatever photo shows through either. */}
              <span className="coursebar__num">{topic.number}</span>
              <u />
              <span className="coursebar__tip">
                <strong>
                  {topic.number} · {topic.title}
                </strong>
                <small>
                  {done} of {topic.steps.length} steps
                </small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="trail__top">
        {focus !== cursorIndex && (
          <button
            type="button"
            className="pill pill--world fade-in"
            onClick={() => goTo(cursorIndex)}
          >
            <IconChevronDown size={15} />
            Current step
          </button>
        )}
      </div>

      {/* Announces the world you have just walked into. Above the cards so it reads
          as a title card over the scene, and inert so it can never intercept a
          scroll. The key restarts the animation when one crossing follows another
          quickly. */}
      {arrival && (
        <div className="arrival" key={arrival.at} aria-hidden="true">
          <span className="arrival__eyebrow">Topic {arrival.n}</span>
          <span className="arrival__title">{arrival.title}</span>
        </div>
      )}

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
              className={`trailcard trailcard--d${tier.depth}${
                isFocused ? ' trailcard--active' : ''
              }`}
              style={{
                bottom: `${tier.bottom}%`,
                left: `${tier.left}%`,
                opacity: tier.opacity,
                transform: 'translateX(-50%)',
                /* Matches how both photographs haze toward the horizon, so a far
                   card recedes into the scene rather than just being small. */
                filter: tier.blur ? `blur(${tier.blur}px) saturate(0.85)` : undefined,
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
                  depth={tier.depth}
                  showCta={isFocused}
                  onStart={starterFor(j.globalIndex)}
                />
              ) : (
                <QuizCard
                  topic={j.topic}
                  palette={LANDSCAPES[j.topic.biome]}
                  depth={tier.depth}
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
           banner belongs to whichever world you are currently walking through.
           Starts at true 0 alpha now, not 0.8 -- opening already 80% opaque
           right at the top edge, with nothing behind it to fade in from, was
           the hard seam against the art above rather than a blend into it.
           Ramps to 95% by 40% and solid by 100%, quick enough that the two
           lines of text (which start around 19% into this now-shorter box)
           still land on a legible backing. */
        style={{
          background: `linear-gradient(180deg, ${withAlpha(palette.sky, 0)} 0%, ${withAlpha(
            palette.sky,
            0.7,
          )} 18%, ${withAlpha(palette.sky, 0.95)} 40%, ${palette.sky} 100%)`,
          color: palette.foreDeep,
        }}
        onClick={onOpenExplore}
        /* Used to also carry the topic/title line, then the path name -- both
           dropped in turn once they stopped being something worth a permanent
           spot on every step: the top bar already says the topic, and the
           path only changes a few times across the whole journey, which
           belongs to the drawer's own deliberate "where does this fit"
           moment (its world list), not to chrome you see on every step. What
           survived is the one thing here that's actually a link. The
           aria-label still names the topic, since a screen reader benefits
           from that context even with no visible text carrying it. */
        aria-label={`Topic ${focusTopic.number}, ${focusTopic.title}. Open all topics`}
      >
        <div className="sheet__hint">
          All topics
          <IconArrowRight size={14} />
        </div>
      </button>

      {mapOpen && <JourneyMap onClose={() => setMapOpen(false)} />}
    </section>
  );
}
