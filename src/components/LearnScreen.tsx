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

  const railRef = useRef<HTMLDivElement>(null);
  /* Fractional scroll position in steps. Drives the palette blend and the
     parallax, so both move continuously rather than snapping per step. */
  const [scrollT, setScrollT] = useState(cursorIndex);

  /* Park the rail on wherever the learner actually is when that changes. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ top: cursorIndex * rail.clientHeight, behavior: 'auto' });
    setScrollT(cursorIndex);
  }, [cursorIndex]);

  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail || rail.clientHeight === 0) return;
    setScrollT(rail.scrollTop / rail.clientHeight);
  }, []);

  const scrollToStep = useCallback((i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ top: clamp(i, 0, LAST) * rail.clientHeight, behavior: 'smooth' });
  }, []);

  const focus = clamp(Math.round(scrollT), 0, LAST);

  /* Arrow keys walk the trail, straight across world boundaries. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      e.preventDefault();
      scrollToStep(e.key === 'ArrowDown' ? focus + 1 : focus - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, scrollToStep]);

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

  const from = Math.max(0, focus - WINDOW);
  const to = Math.min(LAST, focus + WINDOW);
  const visible = JOURNEY.slice(from, to + 1);

  return (
    <section className="trail">
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
            onClick={() => scrollToStep(cursorIndex)}
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
                  onStart={() => onOpenEntry(j.globalIndex)}
                />
              ) : (
                <QuizCard
                  topic={j.topic}
                  palette={LANDSCAPES[j.topic.biome]}
                  mini={!isFocused}
                  showCta={isFocused}
                  onStart={() => onOpenEntry(j.globalIndex)}
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
