import { useMemo, type CSSProperties } from 'react';
import type { IslandBiome } from './FloatingIsland';
import { withAlpha, type Landscape } from './landscapes';

/* Ambient life for the trail's backdrop. Every world got the same treatment
   before this: paint it once, let the camera drift over it. This gives each
   biome a handful of small, slow-moving things that belong to it specifically
   -- dust catching the desert's lantern light, fireflies at dusk in the
   jungle, snow over the glacier -- so a world reads as a place rather than a
   photograph of one.

   Deliberately understated: a dozen-odd motes on the same calm, slow timing
   the rest of the app uses (--ease-calm's whole point is "never snappy" --
   this is not confetti). Pure CSS animation, positions seeded once per biome
   so the scatter doesn't reshuffle on every scroll re-render. */

type MoteKind = 'dust' | 'firefly' | 'snow' | 'pollen' | 'bubble';

const KIND_BY_BIOME: Record<IslandBiome, MoteKind> = {
  desert: 'dust',
  savanna: 'dust',
  jungle: 'firefly',
  forest: 'firefly',
  tundra: 'snow',
  glacier: 'snow',
  ocean: 'bubble',
  blossom: 'pollen',
};

const COUNT: Record<MoteKind, number> = {
  dust: 16,
  firefly: 12,
  snow: 24,
  pollen: 16,
  bubble: 14,
};

/* Deterministic pseudo-random: the same seed always gives the same scatter,
   so the only thing that ever reshuffles a biome's motes is switching biome,
   not the trail's own per-frame re-renders. */
function seeded(seed: number): number {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

/* Dust and bubbles are meant to be catching light, not carrying colour --
   tried tinting them with the biome's own palette first, and on a world
   whose sky is already pale and warm (or pale and blue, for water) a
   translucent mote in that same family had no brightness to stand out with
   and all but vanished. A near-white glow reads against anything behind it,
   the way an actual sunlit speck or a highlight on water would. */
function colorFor(kind: MoteKind, p: Landscape): string {
  switch (kind) {
    case 'dust':
      return 'rgba(255, 246, 224, 0.92)';
    case 'firefly':
      return p.plantLit;
    case 'snow':
      return 'rgba(255, 255, 255, 0.85)';
    case 'pollen':
      return withAlpha(p.bloom, 0.9);
    case 'bubble':
      return 'rgba(255, 255, 255, 0.6)';
  }
}

interface Mote {
  left: number;
  top: number;
  size: number;
  dur: number;
  delay: number;
  sway: number;
  travel: number;
}

/* Snow falls (positive travel); everything else drifts upward (negative) --
   dust and pollen catching a rising air current, bubbles actually rising,
   fireflies just barely lifting as they flit. */
function motesFor(kind: MoteKind): Mote[] {
  const n = COUNT[kind];
  const motes: Mote[] = [];
  for (let i = 0; i < n; i += 1) {
    const s = i + 1;
    const size =
      kind === 'snow'
        ? 2 + seeded(s + 0.47) * 3
        : kind === 'firefly'
          ? 3 + seeded(s + 0.47) * 2.5
          : 1.5 + seeded(s + 0.47) * 2.5;
    const dur =
      kind === 'firefly'
        ? 3200 + seeded(s + 0.63) * 2600
        : kind === 'snow'
          ? 9000 + seeded(s + 0.63) * 7000
          : 7000 + seeded(s + 0.63) * 6000;
    const travel =
      kind === 'snow'
        ? 140 + seeded(s + 0.91) * 90
        : kind === 'firefly'
          ? -(14 + seeded(s + 0.91) * 18)
          : -(110 + seeded(s + 0.91) * 90);
    motes.push({
      left: seeded(s) * 100,
      top: seeded(s + 0.31) * 100,
      size,
      dur,
      /* Negative delay starts each mote mid-cycle rather than all of them
         fading in together the moment a world loads. */
      delay: seeded(s + 0.79) * -dur,
      sway: (seeded(s + 0.11) - 0.5) * 40,
      travel,
    });
  }
  return motes;
}

export default function Particles({
  biome,
  palette,
}: {
  biome: IslandBiome;
  palette: Landscape;
}) {
  const kind = KIND_BY_BIOME[biome];
  /* Keyed on kind, not biome: savanna and desert both drift dust, and
     re-seeding at that boundary would make the dust jump rather than simply
     keep drifting through the colour blend. */
  const motes = useMemo(() => motesFor(kind), [kind]);
  const color = colorFor(kind, palette);

  return (
    <div className={`motes motes--${kind}`} aria-hidden="true">
      {motes.map((m, i) => (
        <i
          key={i}
          style={
            {
              left: `${m.left}%`,
              top: `${m.top}%`,
              '--size': `${m.size}px`,
              '--dur': `${m.dur}ms`,
              '--delay': `${m.delay}ms`,
              '--sway': `${m.sway}px`,
              '--travel': `${m.travel}px`,
              '--mote-color': color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
