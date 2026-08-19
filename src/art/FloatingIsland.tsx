import { useId } from 'react';

/* ------------------------------------------------------------------ *
 * Hand-painted, gouache-style isometric floating island.
 * Pure inline SVG. One shared geometry, seven palettes + prop sets.
 * ------------------------------------------------------------------ */

export type IslandBiome =
  | 'desert'
  | 'jungle'
  | 'savanna'
  | 'tundra'
  | 'forest'
  | 'glacier'
  | 'blossom';

export type IslandPalette = {
  land: string;
  landDark: string;
  landLight: string;
  underside: string;
  path: string;
  foliage: string;
  accent: string;
};

export const BIOME_PALETTES: Record<IslandBiome, IslandPalette> = {
  desert: {
    land: '#B4705A',
    landDark: '#8A4527',
    landLight: '#D4A091',
    underside: '#7B3A22',
    path: '#FBF4EA',
    foliage: '#0F6D55',
    accent: '#1B8A6B',
  },
  jungle: {
    land: '#2E9B4F',
    landDark: '#166B36',
    landLight: '#57C46E',
    underside: '#0F4A28',
    path: '#EFE4C8',
    foliage: '#1C7A3C',
    accent: '#8FD46A',
  },
  savanna: {
    land: '#A8BF4E',
    landDark: '#6E8A2E',
    landLight: '#CBDE72',
    underside: '#4E6420',
    path: '#F2EBC9',
    foliage: '#7C9A34',
    accent: '#E7A8C4',
  },
  tundra: {
    land: '#7E9AA0',
    landDark: '#4E6B72',
    landLight: '#A8C2C6',
    underside: '#3A5158',
    path: '#F0F5F6',
    foliage: '#2F5B57',
    accent: '#C9E4E7',
  },
  forest: {
    land: '#4A7A55',
    landDark: '#2C5236',
    landLight: '#79A57F',
    underside: '#22402A',
    path: '#EDE6D2',
    foliage: '#1F4A2C',
    accent: '#96C48A',
  },
  glacier: {
    land: '#69B6C9',
    landDark: '#3D8296',
    landLight: '#A6DCE7',
    underside: '#2A5F70',
    path: '#F4FBFC',
    foliage: '#2F7488',
    accent: '#E4F6FA',
  },
  blossom: {
    land: '#D98BA6',
    landDark: '#A85B78',
    landLight: '#F0B3C6',
    underside: '#8C4359',
    path: '#FDF1F3',
    foliage: '#B65C7C',
    accent: '#FBD9E3',
  },
};

/* ------------------------------------------------------------------ *
 * Shared geometry. Every edge is drawn with bezier curves and gentle
 * asymmetry so nothing reads as a polygon.
 * ------------------------------------------------------------------ */

/** Soft-edged diamond top surface: x 40->360, y 122->302, widest at y~250. */
const D_TOP = `M 42,247
C 58,222 82,198 108,178
C 134,158 168,132 199,122
C 228,132 258,152 284,174
C 312,198 344,226 358,250
C 336,268 304,284 268,293
C 238,300 214,303 198,302
C 172,301 140,295 110,284
C 78,272 54,260 42,247 Z`;

/** Cliff / soil band hugging the two front edges of the diamond. */
const D_RIM = `M 42,247
C 54,260 78,272 110,284
C 140,295 172,301 198,302
C 214,303 238,300 268,293
C 304,284 336,268 358,250
C 356,269 350,285 342,297
C 314,319 276,333 236,339
C 210,343 186,342 162,337
C 122,329 84,311 56,287
C 48,277 44,262 42,247 Z`;

/** Tapering rocky mass hanging below, roughly pointed at y~402. */
const D_UNDER = `M 40,244
C 42,282 58,318 84,348
C 110,378 152,398 188,402
C 216,392 250,368 280,338
C 312,306 344,282 356,250
C 328,278 292,294 248,301
C 210,307 172,304 134,295
C 96,286 60,268 40,244 Z`;

/** Hill rising from the back of the island, summit at y~126. */
const D_PEAK = `M 64,234
C 78,208 94,180 112,156
C 124,140 136,127 150,125
C 165,130 176,146 187,163
C 205,191 226,215 246,232
C 218,248 188,256 156,257
C 118,257 86,249 64,234 Z`;

const D_PEAK_LIT = `M 150,125
C 138,131 127,144 116,159
C 99,183 82,208 68,233
C 90,247 120,256 152,256
C 148,214 146,168 150,125 Z`;

const D_PEAK_SHADE = `M 152,127
C 162,136 173,152 183,168
C 200,195 222,216 242,232
C 216,247 190,255 164,256
C 160,212 155,167 152,127 Z`;

/** Small secondary knoll behind and right of the main peak. */
const D_KNOLL = `M 228,208
C 242,187 256,173 271,168
C 286,172 300,190 313,211
C 292,224 258,229 228,208 Z`;

/** Crescent of light along the two back edges. */
const D_BACKLIGHT = `M 42,247
C 58,222 82,198 108,178
C 134,158 168,132 199,122
C 228,132 258,152 284,174
C 312,198 344,226 358,250
C 340,238 318,224 292,206
C 262,186 230,164 198,152
C 168,164 134,188 106,210
C 78,230 58,240 42,247 Z`;

/** Crescent of shadow just inside the two front edges. */
const D_FRONTSHADE = `M 42,247
C 66,262 100,278 140,288
C 172,296 216,298 252,291
C 296,282 330,266 358,250
C 336,270 302,286 264,294
C 224,303 178,304 138,296
C 96,288 62,268 42,247 Z`;

/**
 * Trail: a filled, tapering track. ~18px wide at the front of the
 * island, ~7px near the summit, snaking up in an S-curve.
 */
const D_TRAIL = `M 189,296
C 196,272 216,262 226,250
C 236,238 224,232 206,226
C 186,220 168,212 160,196
C 152,180 150,160 147,146
C 150,145 153,146 154,148
C 157,162 159,182 168,198
C 178,216 196,224 216,232
C 236,240 246,250 234,264
C 222,278 212,288 207,300
C 202,302 194,300 189,296 Z`;

/** Rock spurs dangling off the underside. */
const D_SPURS = [
  `M 60,304 C 74,326 88,348 96,374
   C 98,382 96,386 92,382 C 78,366 64,340 54,314 Z`,
  `M 240,322 C 254,342 268,358 276,382
   C 278,390 274,392 270,386 C 256,368 244,346 234,328 Z`,
  `M 128,362 C 138,378 146,392 148,410
   C 149,416 146,417 143,412 C 134,398 128,380 122,364 Z`,
];

/** Striation strokes over the underside rock. */
const D_STRIAE = [
  'M 62,272 C 74,300 86,332 92,358',
  'M 108,290 C 118,320 130,352 140,380',
  'M 178,302 C 180,332 182,364 182,392',
  'M 236,300 C 234,328 226,356 214,382',
  'M 290,290 C 288,314 278,338 262,360',
  'M 330,268 C 328,288 318,306 306,320',
];

/* ------------------------------------------------------------------ *
 * Small geometry helpers
 * ------------------------------------------------------------------ */

/** A wobbly, never-perfectly-round blob (4 bezier quadrants, jittered radii). */
function blob(cx: number, cy: number, r: number, seed: number): string {
  const j = (n: number) => 1 + 0.17 * Math.sin(seed * 1.7 + n * 2.3);
  const r0 = r * j(0);
  const r1 = r * j(1);
  const r2 = r * j(2);
  const r3 = r * j(3);
  const k = 0.5523;
  return [
    `M ${cx.toFixed(1)},${(cy - r0).toFixed(1)}`,
    `C ${(cx + r0 * k).toFixed(1)},${(cy - r0).toFixed(1)} ${(cx + r1).toFixed(1)},${(cy - r1 * k).toFixed(1)} ${(cx + r1).toFixed(1)},${cy.toFixed(1)}`,
    `C ${(cx + r1).toFixed(1)},${(cy + r1 * k).toFixed(1)} ${(cx + r2 * k).toFixed(1)},${(cy + r2).toFixed(1)} ${cx.toFixed(1)},${(cy + r2).toFixed(1)}`,
    `C ${(cx - r2 * k).toFixed(1)},${(cy + r2).toFixed(1)} ${(cx - r3).toFixed(1)},${(cy + r3 * k).toFixed(1)} ${(cx - r3).toFixed(1)},${cy.toFixed(1)}`,
    `C ${(cx - r3).toFixed(1)},${(cy - r3 * k).toFixed(1)} ${(cx - r0 * k).toFixed(1)},${(cy - r0).toFixed(1)} ${cx.toFixed(1)},${(cy - r0).toFixed(1)} Z`,
  ].join(' ');
}

/** One softly curved conifer tier, apex at (0, yTop). */
function tier(w: number, h: number, yTop: number): string {
  const yb = yTop + h;
  return [
    `M 0,${yTop}`,
    `C ${w * 0.3},${yTop + h * 0.5} ${w * 0.62},${yTop + h * 0.8} ${w},${yb}`,
    `C ${w * 0.55},${yb + 2.2} ${w * 0.2},${yb + 1} 0,${yb + 1.6}`,
    `C ${-w * 0.2},${yb + 1} ${-w * 0.55},${yb + 2.2} ${-w},${yb}`,
    `C ${-w * 0.62},${yTop + h * 0.8} ${-w * 0.3},${yTop + h * 0.5} 0,${yTop} Z`,
  ].join(' ');
}

/** A slim, gently curved leaf/frond pointing up from the origin. */
const LEAF = 'M -2.6,0 C -1.8,-5 -1,-9.5 0,-13.4 C 1.1,-9.5 1.9,-5 2.6,0 Z';

/** A broad, drooping palm frond sweeping right from the origin. */
const FROND =
  'M 0,-0.5 C 7,-7.5 16,-8.5 24.5,-3 C 22,-2.2 19,-2.4 16,-2 C 10,-1.2 4.5,1.4 1.5,4.5 C 0.8,2.8 0.3,1.2 0,-0.5 Z';

/* ------------------------------------------------------------------ *
 * Foliage sprites. Each draws around a base point at the origin.
 * ------------------------------------------------------------------ */

type ShapeProps = { pal: IslandPalette; seed: number };

function Cactus({ pal }: ShapeProps) {
  return (
    <g>
      <path
        d="M -5.4,0 C -7.2,-14 -7.4,-30 -5.2,-40.5 C -3.4,-47 3.4,-47 5.2,-40.5 C 7.4,-30 7.2,-14 5.4,0 C 2,2.2 -2,2.2 -5.4,0 Z"
        fill={pal.foliage}
      />
      <path
        d="M -5.8,-19 C -13,-20.5 -17.4,-25 -17.2,-31.5 C -17,-36 -13.4,-37.4 -11.6,-33.6 C -10.4,-29 -10.6,-25.4 -5.8,-24.2 Z"
        fill={pal.foliage}
      />
      <path
        d="M 5.8,-27 C 12.8,-28.6 17.2,-33 17,-39.4 C 16.8,-44 13.2,-45.4 11.4,-41.6 C 10.2,-37 10.4,-33.2 5.8,-32.2 Z"
        fill={pal.foliage}
      />
      <path
        d="M -2.2,-40 C -3.4,-27 -3.6,-13 -2.6,-1.5"
        fill="none"
        stroke={pal.accent}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.75}
      />
      <path
        d="M 2.4,-39 C 3.4,-26 3.4,-12 2.6,-1.5"
        fill="none"
        stroke={pal.accent}
        strokeWidth={1.1}
        strokeLinecap="round"
        opacity={0.45}
      />
      <path d={blob(0, 1.4, 6.4, 3)} fill={pal.landDark} opacity={0.22} />
    </g>
  );
}

function Agave({ pal, seed }: ShapeProps) {
  const angles = [-58, -38, -16, 0, 17, 39, 60];
  return (
    <g>
      <path d={blob(0, 0.8, 8, seed)} fill={pal.landDark} opacity={0.2} />
      {angles.map((a, i) => (
        <g key={a} transform={`rotate(${a}) scale(${0.82 + (i % 3) * 0.14})`}>
          <path d={LEAF} fill={i % 2 === 0 ? pal.foliage : pal.accent} />
        </g>
      ))}
      <path d={blob(0, -2.4, 2.6, seed + 2)} fill={pal.accent} opacity={0.8} />
    </g>
  );
}

function Palm({ pal, seed }: ShapeProps) {
  const angles = [-158, -124, -88, -50, -6, 34];
  return (
    <g>
      <path d={blob(1, 1, 7.5, seed)} fill={pal.landDark} opacity={0.2} />
      <path
        d="M -2.4,0.5 C 0.4,-13 3.2,-25 7.2,-35 C 9.4,-34.4 11.2,-33.4 12.4,-32.2
           C 7.8,-22 4.6,-11 3.2,0.8 Z"
        fill={pal.underside}
      />
      <path
        d="M -0.4,-3 C 2.2,-12 4.6,-21 7.4,-29"
        fill="none"
        stroke={pal.land}
        strokeWidth={1}
        opacity={0.3}
      />
      <g transform="translate(9 -35)">
        {angles.map((a, i) => (
          <g key={a} transform={`rotate(${a}) scale(${1.05 + (i % 3) * 0.2})`}>
            <path d={FROND} fill={i % 2 === 0 ? pal.foliage : pal.accent} />
            <path
              d="M 1,0.6 C 7,0.4 13.5,0.6 19.5,0.8"
              fill="none"
              stroke={pal.landDark}
              strokeWidth={0.7}
              opacity={0.45}
            />
          </g>
        ))}
        <path d={blob(0, 0, 3.6, seed + 5)} fill={pal.foliage} />
        <path d={blob(0.6, -1.2, 2, seed + 9)} fill={pal.accent} opacity={0.9} />
      </g>
    </g>
  );
}

function LeafBush({ pal, seed }: ShapeProps) {
  const leaves = [
    { a: -74, s: 1.05 },
    { a: -44, s: 1.3 },
    { a: -12, s: 1.15 },
    { a: 20, s: 1.32 },
    { a: 52, s: 1 },
  ];
  return (
    <g>
      <path d={blob(0, 0.5, 9, seed)} fill={pal.landDark} opacity={0.2} />
      {leaves.map(({ a, s }) => (
        <g key={a} transform={`rotate(${a}) scale(${s})`}>
          {/* broad, rounded leaf */}
          <path
            d="M 0,0 C -9.5,-6 -11,-16 -3.5,-22.5 C 4,-16.5 3.5,-6.5 0,0 Z"
            fill={pal.foliage}
          />
          <path
            d="M -3.4,-21 C -3.4,-13 -2,-6 -0.4,-1.2"
            fill="none"
            stroke={pal.accent}
            strokeWidth={1}
            opacity={0.55}
          />
          <path
            d="M -3.4,-16 C -6,-14.5 -7.4,-13 -8.4,-11 M -3,-11 C -5,-9.6 -6,-8.4 -6.6,-6.6"
            fill="none"
            stroke={pal.accent}
            strokeWidth={0.7}
            opacity={0.4}
          />
        </g>
      ))}
      <path d={blob(-1, -8, 4.6, seed + 3)} fill={pal.accent} opacity={0.55} />
    </g>
  );
}

function Acacia({ pal, seed }: ShapeProps) {
  return (
    <g>
      <path d={blob(0, 1, 10, seed)} fill={pal.landDark} opacity={0.2} />
      <path
        d="M -2.2,1 C -1.6,-9 -1,-18 0,-26 C 1.6,-26.2 3,-26.2 4.2,-26
           C 3.4,-17.5 3,-8.5 3,1 Z"
        fill={pal.landDark}
      />
      <path
        d="M 0.6,-21 C -6,-24 -12,-26.5 -17,-28.5 M 3,-20 C 9,-24 16,-27 22,-29"
        fill="none"
        stroke={pal.landDark}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      {/* wide, flat umbrella canopy */}
      <path
        d="M -31,-28 C -21,-35.5 -9,-39 2.5,-38.5 C 15,-38 28,-34.5 35,-27.5
           C 24,-23.5 12,-22 -0.5,-22.2 C -15,-22.5 -25,-24.4 -31,-28 Z"
        fill={pal.foliage}
      />
      <path
        d="M -24,-31.5 C -15,-37 -5,-39.5 3,-39 C 13,-38.5 23,-36 29,-31.5
           C 18,-30 6,-29.4 -6,-29.8 C -15,-30.2 -20,-30.8 -24,-31.5 Z"
        fill={pal.landLight}
        opacity={0.35}
      />
      <path
        d="M -17,-38.5 C -9,-43.5 0,-45.5 8,-44.5 C 15,-43.5 20,-41.5 23.5,-38
           C 14,-39.5 4,-40.2 -6,-39.6 C -12,-39.2 -15,-38.8 -17,-38.5 Z"
        fill={pal.foliage}
        opacity={0.9}
      />
      <path d={blob(-13, -28, 2.4, seed + 4)} fill={pal.accent} opacity={0.7} />
      <path d={blob(18, -30, 2, seed + 7)} fill={pal.accent} opacity={0.6} />
    </g>
  );
}

function Tuft({ pal, seed }: ShapeProps) {
  const angles = [-46, -22, -2, 20, 44];
  return (
    <g>
      {angles.map((a, i) => (
        <g key={a} transform={`rotate(${a}) scale(${0.7 + (i % 2) * 0.3})`}>
          <path
            d="M -1.6,0 C -1,-4.5 -0.4,-8 0.6,-11.5 C 1.2,-7.5 1.4,-4 1.6,0 Z"
            fill={i === 2 ? pal.accent : pal.foliage}
          />
        </g>
      ))}
      <path d={blob(0, 0.6, 5, seed)} fill={pal.landDark} opacity={0.18} />
    </g>
  );
}

function FlowerPatch({ pal, seed }: ShapeProps) {
  const dots = [
    { x: -11, y: -4, r: 1.9, c: pal.accent },
    { x: -6, y: -8.5, r: 1.5, c: '#9CC3E0' },
    { x: -1, y: -3, r: 2.1, c: pal.accent },
    { x: 4, y: -9, r: 1.6, c: pal.accent },
    { x: 9, y: -4.5, r: 1.8, c: '#9CC3E0' },
    { x: 13, y: -9.5, r: 1.4, c: pal.accent },
    { x: -14, y: -10, r: 1.3, c: '#9CC3E0' },
    { x: 2, y: -14, r: 1.4, c: pal.accent },
    { x: -9, y: -14, r: 1.2, c: '#9CC3E0' },
  ];
  return (
    <g>
      <path d={blob(0, 0, 13, seed)} fill={pal.foliage} opacity={0.28} />
      {dots.map((d, i) => (
        <g key={`${d.x}-${d.y}`}>
          <path
            d={`M ${d.x},${d.y + 6} C ${d.x - 0.6},${d.y + 3} ${d.x - 0.4},${d.y + 1.5} ${d.x},${d.y}`}
            fill="none"
            stroke={pal.foliage}
            strokeWidth={0.7}
          />
          <path d={blob(d.x, d.y, d.r, seed + i)} fill={d.c} />
        </g>
      ))}
    </g>
  );
}

function BareConifer({ pal, seed }: ShapeProps) {
  const branches = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <g>
      <path d={blob(0, 0.6, 6.5, seed)} fill={pal.landDark} opacity={0.2} />
      <path
        d="M -1.3,0.5 C -0.7,-14 -0.3,-28 0.4,-38.5 C 1.4,-38.5 2,-38.4 2.4,-38 C 2,-26 1.8,-13 2,0.6 Z"
        fill={pal.foliage}
      />
      {branches.map((i) => {
        const y = -6 - i * 4.2;
        const len = 11.5 - i * 1.2;
        const droop = 2.6 + i * 0.2;
        return (
          <g key={i}>
            <path
              d={`M 0.4,${y} C ${-len * 0.5},${y - 1} ${-len * 0.8},${y + droop * 0.4} ${-len},${y + droop}`}
              fill="none"
              stroke={i % 2 === 0 ? pal.foliage : pal.accent}
              strokeWidth={1.5 - i * 0.08}
              strokeLinecap="round"
            />
            <path
              d={`M 1.2,${y - 1.6} C ${len * 0.5},${y - 2.6} ${len * 0.8},${y - 1} ${len * 0.92},${y + droop - 1}`}
              fill="none"
              stroke={i % 2 === 0 ? pal.foliage : pal.accent}
              strokeWidth={1.4 - i * 0.08}
              strokeLinecap="round"
            />
          </g>
        );
      })}
      <path d={blob(1, -40.5, 2, seed + 3)} fill={pal.accent} opacity={0.8} />
    </g>
  );
}

function Conifer({ pal, seed }: ShapeProps) {
  return (
    <g>
      <path d={blob(1, 1, 9, seed)} fill={pal.landDark} opacity={0.22} />
      <path d="M -1.6,1 C -1.2,-6 -0.8,-11 0,-15 L 2.8,-15 C 2.4,-9 2.2,-4 2.2,1 Z" fill={pal.landDark} />
      <path d={tier(11.5, 15, -20)} fill={pal.foliage} />
      <path d={tier(9.2, 14, -31)} fill={pal.foliage} />
      <path d={tier(6.8, 14, -43)} fill={pal.foliage} />
      <path d={tier(9.6, 13, -30)} fill={pal.accent} opacity={0.3} transform="translate(-2.4 0)" />
      <path d={tier(5.6, 12, -42.5)} fill={pal.accent} opacity={0.35} transform="translate(-1.8 0)" />
      <path
        d="M -9,-8 C -4,-9.5 3,-9.5 9,-8"
        fill="none"
        stroke={pal.landDark}
        strokeWidth={1}
        opacity={0.35}
      />
    </g>
  );
}

function RoundTree({ pal, seed }: ShapeProps) {
  return (
    <g>
      <path d={blob(1.5, 1, 9, seed)} fill={pal.landDark} opacity={0.22} />
      <path
        d="M -1.8,1 C -1.4,-6 -0.8,-11.5 0,-16 C 1.2,-16.2 2.4,-16.2 3.4,-16 C 2.8,-10.5 2.6,-5 2.6,1 Z"
        fill={pal.landDark}
      />
      <path
        d="M 0.6,-11.5 C -2.6,-14 -4.6,-15.5 -6.4,-17 M 2.2,-12.5 C 4.6,-15 6.6,-16.5 8.4,-18"
        fill="none"
        stroke={pal.landDark}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <path d={blob(-6.5, -20.5, 8.5, seed + 1)} fill={pal.foliage} />
      <path d={blob(7, -21.5, 9, seed + 2)} fill={pal.foliage} />
      <path d={blob(0, -28.5, 10.5, seed + 3)} fill={pal.foliage} />
      <path d={blob(-2, -32, 6, seed + 4)} fill={pal.accent} opacity={0.45} />
      <path d={blob(-7.5, -23, 4.2, seed + 5)} fill={pal.accent} opacity={0.35} />
      <path d={blob(6, -18, 3.4, seed + 6)} fill={pal.landDark} opacity={0.25} />
    </g>
  );
}

function Rock({ pal, seed }: ShapeProps) {
  return (
    <g>
      <path d={blob(0.5, 0.5, 8.5, seed)} fill={pal.landDark} opacity={0.22} />
      <path
        d="M -9,0.5 C -9.5,-4.5 -6.5,-9.5 -2,-11.5 C 3,-13.5 8,-10 9.5,-4.5 C 10,-1.5 9,0.5 7.5,1.2
           C 2.5,2.2 -4,2 -9,0.5 Z"
        fill={pal.landDark}
      />
      <path
        d="M -6.5,-2.5 C -6.5,-6.5 -4,-10 -1,-11.4 C 1.5,-10 2,-6 1,-2 C -1.5,-1.2 -4,-1.4 -6.5,-2.5 Z"
        fill={pal.landLight}
        opacity={0.55}
      />
      <path d={blob(6, 1.5, 3.4, seed + 2)} fill={pal.landDark} />
      <path
        d="M -4,-8 C -1,-9 1.5,-8.5 3.5,-6.5"
        fill="none"
        stroke={pal.land}
        strokeWidth={0.9}
        opacity={0.6}
      />
    </g>
  );
}

function IceShard({ pal, seed }: ShapeProps) {
  return (
    <g>
      <path d={blob(1, 1, 9, seed)} fill={pal.landDark} opacity={0.22} />
      <path
        d="M -8.5,1 C -9,-6 -6,-16 -2.5,-25.5 C -1.4,-28.5 0.4,-28.5 1.4,-25.5
           C 4,-17 6,-8 6.5,1 C 1.5,2.2 -3.5,2.2 -8.5,1 Z"
        fill={pal.foliage}
      />
      <path
        d="M -1.6,-26 C -3.6,-17 -5.4,-8 -5.8,0.6 C -3.6,1.4 -1.6,1.6 0.2,1.4
           C -0.2,-8 -0.8,-17.5 -1.6,-26 Z"
        fill={pal.accent}
        opacity={0.85}
      />
      <path
        d="M 8,1 C 8.5,-4 10,-9.5 12,-13.5 C 13,-15.5 14.4,-15 15,-12.5
           C 16,-8 16.5,-3.5 16.4,1.2 C 13.5,2 10.5,2 8,1 Z"
        fill={pal.foliage}
        opacity={0.9}
      />
      <path
        d="M 12.6,-13 C 11.8,-8 11.2,-3.5 11.2,1.4 C 12.6,1.8 13.8,1.8 15,1.4
           C 14.4,-3.5 13.6,-8.5 12.6,-13 Z"
        fill={pal.accent}
        opacity={0.6}
      />
      <path d={blob(-3, -18, 2.4, seed + 3)} fill="#FFFFFF" opacity={0.5} />
    </g>
  );
}

function BlossomTree({ pal, seed }: ShapeProps) {
  return (
    <g>
      <path d={blob(1.5, 1, 9.5, seed)} fill={pal.landDark} opacity={0.22} />
      <path
        d="M -2,1 C -1.6,-6 -1,-12 0,-17 C 1.4,-17.4 2.8,-17.4 3.8,-17 C 3,-11 2.8,-5 2.8,1 Z"
        fill={pal.landDark}
      />
      <path
        d="M 0.8,-12.5 C -3,-15.5 -5.5,-17.5 -7.5,-19.5 M 2.4,-13.5 C 5.5,-16.5 8,-18.5 10,-20.5"
        fill="none"
        stroke={pal.landDark}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <path d={blob(-7.5, -22, 8, seed + 1)} fill={pal.foliage} />
      <path d={blob(8, -23, 8.5, seed + 2)} fill={pal.foliage} />
      <path d={blob(0, -29.5, 11, seed + 3)} fill={pal.foliage} />
      <path d={blob(-2.5, -32, 7, seed + 4)} fill={pal.accent} opacity={0.75} />
      <path d={blob(6.5, -26, 5.2, seed + 5)} fill={pal.accent} opacity={0.6} />
      <path d={blob(-8, -24, 4.4, seed + 6)} fill={pal.accent} opacity={0.55} />
      <path d={blob(2, -20, 3.6, seed + 7)} fill={pal.landLight} opacity={0.5} />
      <path d={blob(-13, -19, 2, seed + 8)} fill={pal.accent} opacity={0.7} />
      <path d={blob(14, -18.5, 1.8, seed + 9)} fill={pal.accent} opacity={0.6} />
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Sprite scattering
 * ------------------------------------------------------------------ */

type SpriteKind =
  | 'cactus'
  | 'agave'
  | 'palm'
  | 'leafBush'
  | 'acacia'
  | 'tuft'
  | 'flowers'
  | 'bareConifer'
  | 'conifer'
  | 'roundTree'
  | 'rock'
  | 'iceShard'
  | 'blossomTree';

const SHAPES: Record<SpriteKind, (p: ShapeProps) => JSX.Element> = {
  cactus: Cactus,
  agave: Agave,
  palm: Palm,
  leafBush: LeafBush,
  acacia: Acacia,
  tuft: Tuft,
  flowers: FlowerPatch,
  bareConifer: BareConifer,
  conifer: Conifer,
  roundTree: RoundTree,
  rock: Rock,
  iceShard: IceShard,
  blossomTree: BlossomTree,
};

/** [kind, x, y, scale] — placed by hand so everything lands on the island. */
type Placement = [SpriteKind, number, number, number];

const BIOME_SPRITES: Record<IslandBiome, Placement[]> = {
  desert: [
    ['cactus', 284, 220, 0.62],
    ['agave', 128, 214, 0.6],
    ['cactus', 162, 170, 0.46],
    ['agave', 206, 198, 0.58],
    ['rock', 330, 240, 0.6],
    ['cactus', 88, 256, 0.85],
    ['agave', 108, 242, 0.76],
    ['agave', 306, 256, 0.8],
    ['rock', 72, 262, 0.7],
    ['cactus', 272, 274, 1.0],
    ['agave', 240, 290, 0.92],
    ['cactus', 116, 282, 1.15],
    ['agave', 150, 292, 1.0],
  ],
  jungle: [
    ['palm', 150, 194, 0.58],
    ['leafBush', 188, 182, 0.5],
    ['palm', 272, 212, 0.64],
    ['leafBush', 128, 210, 0.62],
    ['palm', 296, 238, 0.78],
    ['palm', 84, 252, 0.88],
    ['leafBush', 104, 264, 0.85],
    ['leafBush', 320, 252, 0.78],
    ['palm', 262, 272, 1.05],
    ['leafBush', 238, 288, 0.95],
    ['palm', 118, 280, 1.15],
    ['leafBush', 152, 290, 1.0],
  ],
  savanna: [
    ['tuft', 132, 206, 0.58],
    ['flowers', 170, 180, 0.52],
    ['acacia', 298, 228, 0.64],
    ['tuft', 326, 246, 0.78],
    ['flowers', 280, 250, 0.82],
    ['tuft', 84, 254, 0.88],
    ['flowers', 100, 272, 0.9],
    ['acacia', 266, 266, 1.05],
    ['tuft', 230, 290, 0.9],
    ['flowers', 196, 274, 0.95],
    ['acacia', 116, 278, 1.2],
    ['tuft', 154, 292, 1.0],
  ],
  tundra: [
    ['bareConifer', 156, 176, 0.5],
    ['rock', 188, 186, 0.55],
    ['bareConifer', 290, 226, 0.7],
    ['bareConifer', 132, 204, 0.6],
    ['rock', 104, 246, 0.78],
    ['bareConifer', 90, 254, 0.85],
    ['rock', 320, 250, 0.78],
    ['bareConifer', 268, 268, 1.0],
    ['rock', 234, 288, 0.9],
    ['bareConifer', 118, 280, 1.1],
    ['rock', 152, 292, 1.0],
  ],
  forest: [
    ['conifer', 150, 178, 0.5],
    ['roundTree', 186, 188, 0.54],
    ['conifer', 292, 224, 0.68],
    ['roundTree', 130, 206, 0.64],
    ['roundTree', 300, 244, 0.7],
    ['conifer', 86, 250, 0.88],
    ['roundTree', 110, 262, 0.88],
    ['roundTree', 322, 250, 0.8],
    ['conifer', 272, 266, 1.05],
    ['roundTree', 236, 288, 0.95],
    ['conifer', 110, 278, 1.15],
    ['roundTree', 152, 290, 1.05],
  ],
  glacier: [
    ['iceShard', 152, 178, 0.5],
    ['rock', 100, 240, 0.62],
    ['iceShard', 296, 234, 0.72],
    ['iceShard', 130, 206, 0.6],
    ['rock', 330, 246, 0.68],
    ['iceShard', 88, 254, 0.88],
    ['iceShard', 262, 272, 1.0],
    ['iceShard', 232, 290, 0.88],
    ['iceShard', 118, 282, 1.15],
  ],
  blossom: [
    ['blossomTree', 180, 180, 0.5],
    ['tuft', 206, 196, 0.58],
    ['blossomTree', 296, 232, 0.74],
    ['blossomTree', 128, 206, 0.62],
    ['tuft', 104, 264, 0.78],
    ['blossomTree', 86, 252, 0.9],
    ['blossomTree', 324, 250, 0.78],
    ['blossomTree', 262, 268, 1.05],
    ['blossomTree', 232, 290, 0.9],
    ['blossomTree', 114, 280, 1.2],
    ['blossomTree', 152, 290, 1.0],
  ],
};

function Foliage({ biome, pal }: { biome: IslandBiome; pal: IslandPalette }) {
  return (
    <g>
      {BIOME_SPRITES[biome].map(([kind, x, y, s], i) => {
        const Shape = SHAPES[kind];
        const flip = (Math.round(x) * 7 + Math.round(y)) % 3 === 0;
        return (
          <g
            key={`${kind}-${x}-${y}`}
            transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}
          >
            <Shape pal={pal} seed={i * 3 + 1} />
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Per-biome extras: water features, hanging details, airborne bits
 * ------------------------------------------------------------------ */

/** Points along the front edge, used to hang icicles / vines. */
const FRONT_EDGE: Array<[number, number]> = [
  [78, 300],
  [104, 314],
  [132, 324],
  [162, 333],
  [192, 338],
  [222, 336],
  [252, 329],
  [282, 318],
  [312, 302],
];

function Icicles({ pal, long }: { pal: IslandPalette; long: boolean }) {
  return (
    <g>
      {FRONT_EDGE.map(([x, y], i) => {
        const len = (long ? 20 : 10) + ((i * 7) % (long ? 22 : 9));
        const w = long ? 3.6 : 2.4;
        return (
          <path
            key={`${x}-${y}`}
            d={`M ${x - w},${y - 2} C ${x - w * 0.7},${y + len * 0.5} ${x - 0.6},${y + len * 0.85} ${x},${y + len}
                C ${x + 0.8},${y + len * 0.85} ${x + w * 0.8},${y + len * 0.5} ${x + w},${y - 2} Z`}
            fill={pal.accent}
            opacity={0.82}
          />
        );
      })}
      {FRONT_EDGE.filter((_, i) => i % 2 === 0).map(([x, y]) => (
        <path
          key={`hl-${x}`}
          d={`M ${x - 0.8},${y} C ${x - 0.6},${y + 8} ${x - 0.2},${y + 12} ${x},${y + (long ? 18 : 8)}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={0.9}
          opacity={0.65}
        />
      ))}
    </g>
  );
}

function Vines({ pal }: { pal: IslandPalette }) {
  const vines: Array<[number, number, number, number]> = [
    [96, 308, 14, 52],
    [138, 327, -10, 62],
    [176, 336, 8, 44],
    [214, 337, -12, 58],
    [252, 330, 10, 40],
    [292, 315, -8, 50],
  ];
  return (
    <g>
      {vines.map(([x, y, bend, len]) => (
        <g key={`${x}-${y}`}>
          <path
            d={`M ${x},${y} C ${x + bend},${y + len * 0.4} ${x - bend * 0.6},${y + len * 0.7} ${x + bend * 0.4},${y + len}`}
            fill="none"
            stroke={pal.foliage}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.9}
          />
          <path d={blob(x + bend * 0.5, y + len * 0.5, 2.4, x)} fill={pal.accent} opacity={0.7} />
          <path d={blob(x + bend * 0.4, y + len, 2.8, y)} fill={pal.foliage} />
        </g>
      ))}
    </g>
  );
}

function Waterfall({ uid }: { uid: string }) {
  return (
    <g>
      {/* falling ribbon */}
      <path
        d="M 312,246 C 322,241 338,244 345,251
           C 348,300 346,352 340,398
           C 331,405 319,405 310,398
           C 306,348 306,294 312,246 Z"
        fill={`url(#${uid}-fall)`}
      />
      <path
        d="M 322,252 C 326,300 327,350 325,392"
        fill="none"
        stroke="#EAF9FE"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
      />
      <path
        d="M 335,256 C 338,302 338,348 335,388"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.4}
      />
      {/* mist at the base */}
      <path d={blob(326, 396, 24, 2)} fill="#FFFFFF" opacity={0.4} />
      <path d={blob(304, 402, 16, 5)} fill="#FFFFFF" opacity={0.3} />
      <path d={blob(348, 400, 14, 8)} fill="#FFFFFF" opacity={0.28} />
      <path d={blob(330, 386, 11, 11)} fill="#FFFFFF" opacity={0.35} />
    </g>
  );
}

function CloudWisps() {
  return (
    <g opacity={0.55}>
      <g>
        <path d={blob(52, 336, 20, 1)} fill="#FFFFFF" opacity={0.6} />
        <path d={blob(74, 342, 13, 4)} fill="#FFFFFF" opacity={0.5} />
        <path d={blob(34, 344, 10, 7)} fill="#FFFFFF" opacity={0.45} />
      </g>
      <g>
        <path d={blob(336, 148, 15, 2)} fill="#FFFFFF" opacity={0.5} />
        <path d={blob(354, 154, 10, 6)} fill="#FFFFFF" opacity={0.4} />
      </g>
    </g>
  );
}

function Petals({ pal }: { pal: IslandPalette }) {
  const pts: Array<[number, number, number, number]> = [
    [46, 172, 3.2, -20],
    [66, 214, 2.4, 35],
    [30, 262, 2.8, 10],
    [88, 140, 2.2, -45],
    [130, 108, 3, 25],
    [186, 88, 2.6, -10],
    [242, 108, 3.2, 40],
    [292, 138, 2.4, -30],
    [340, 186, 3, 15],
    [366, 232, 2.6, -50],
    [352, 288, 3.2, 20],
    [318, 320, 2.4, -15],
    [268, 348, 2.8, 45],
    [214, 366, 3, 0],
    [148, 352, 2.4, -35],
    [96, 328, 2.8, 30],
    [60, 300, 2.2, -25],
    [172, 130, 2.4, 50],
    [228, 160, 2, -40],
    [116, 176, 2.2, 20],
  ];
  return (
    <g>
      {pts.map(([x, y, r, rot], i) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path
            d={`M 0,0 C ${r * 1.6},${-r * 0.9} ${r * 2.4},${r * 0.4} ${r * 1.2},${r * 1.1} C ${r * 0.2},${r * 1.5} ${-r * 0.4},${r * 0.6} 0,0 Z`}
            fill={i % 3 === 0 ? pal.foliage : pal.accent}
            opacity={i % 2 === 0 ? 0.85 : 0.6}
          />
        </g>
      ))}
    </g>
  );
}

function FrozenPool({ pal }: { pal: IslandPalette }) {
  return (
    <g>
      <g transform="translate(268 268) scale(1.4 0.66)">
        <path d={blob(0, 2, 26, 3)} fill={pal.landDark} opacity={0.4} />
        <path d={blob(0, 0, 24, 6)} fill={pal.accent} opacity={0.9} />
        <path d={blob(-5, -5, 14, 9)} fill="#FFFFFF" opacity={0.35} />
      </g>
      <path
        d="M 250,258 C 258,262 268,264 282,262"
        fill="none"
        stroke={pal.landLight}
        strokeWidth={1.4}
        opacity={0.9}
      />
      <path
        d="M 254,274 C 264,277 274,277 284,273"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.1}
        opacity={0.6}
      />
    </g>
  );
}

function Crevasses({ pal }: { pal: IslandPalette }) {
  return (
    <g opacity={0.5}>
      {[
        'M 74,252 C 96,262 122,268 148,270',
        'M 186,254 C 204,262 226,266 246,266',
        'M 292,238 C 310,246 326,254 340,258',
        'M 108,228 C 126,236 142,242 156,244',
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke={pal.landDark} strokeWidth={1.6} strokeLinecap="round" />
      ))}
      {[
        'M 76,248 C 98,258 124,264 150,266',
        'M 188,250 C 206,258 228,262 248,262',
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke="#FFFFFF" strokeWidth={1} opacity={0.6} />
      ))}
    </g>
  );
}

/** Extras drawn behind the island (airborne, back-most). */
function BackDecor({ biome }: { biome: IslandBiome }) {
  if (biome === 'jungle') return <CloudWisps />;
  return null;
}

/** Extras drawn in front of everything (airborne, nearest the viewer). */
function FrontDecor({ biome, pal }: { biome: IslandBiome; pal: IslandPalette }) {
  if (biome === 'blossom') return <Petals pal={pal} />;
  return null;
}

/** Extras drawn under the island's front edge. */
function HangingDecor({ biome, pal, uid }: { biome: IslandBiome; pal: IslandPalette; uid: string }) {
  switch (biome) {
    case 'jungle':
      return (
        <g>
          <Vines pal={pal} />
          <Waterfall uid={uid} />
        </g>
      );
    case 'tundra':
      return <Icicles pal={pal} long={false} />;
    case 'glacier':
      return <Icicles pal={pal} long />;
    default:
      return null;
  }
}

/** Extras drawn on the island surface, under the foliage. */
function SurfaceDecor({ biome, pal }: { biome: IslandBiome; pal: IslandPalette }) {
  if (biome === 'jungle') {
    // stream feeding the waterfall over the right-hand edge
    return (
      <g>
        <path
          d="M 286,232 C 300,238 312,246 322,258 C 328,266 332,274 334,282"
          fill="none"
          stroke={pal.landDark}
          strokeWidth={9}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 286,232 C 300,238 312,246 322,258 C 328,266 332,274 334,282"
          fill="none"
          stroke="#8FD8F2"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.92}
        />
        <path
          d="M 292,236 C 304,243 314,250 322,260"
          fill="none"
          stroke="#EAF9FE"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path d={blob(288, 232, 11, 4)} fill="#8FD8F2" opacity={0.9} />
        <path d={blob(286, 230, 6, 9)} fill="#D6F2FB" opacity={0.85} />
      </g>
    );
  }
  if (biome === 'glacier') {
    return (
      <g>
        <Crevasses pal={pal} />
        <FrozenPool pal={pal} />
      </g>
    );
  }
  if (biome === 'desert') {
    // sand ripples: short, soft arcs rather than long contour lines
    return (
      <g>
        {[
          'M 76,262 C 88,267 100,270 112,271',
          'M 96,276 C 108,281 120,284 132,285',
          'M 252,288 C 266,286 278,282 290,277',
          'M 268,272 C 280,270 292,266 302,261',
          'M 126,240 C 136,244 146,247 156,248',
          'M 220,278 C 232,278 242,276 252,273',
        ].map((d, i) => (
          <g key={d}>
            <path
              d={d}
              fill="none"
              stroke={pal.landLight}
              strokeWidth={2.6}
              strokeLinecap="round"
              opacity={0.3}
            />
            <path
              d={d}
              fill="none"
              stroke={pal.landDark}
              strokeWidth={1.1}
              strokeLinecap="round"
              opacity={i % 2 === 0 ? 0.2 : 0.14}
              transform="translate(0 2.4)"
            />
          </g>
        ))}
      </g>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

export default function FloatingIsland({
  biome,
  className,
}: {
  biome: IslandBiome;
  className?: string;
}): JSX.Element {
  // useId() guarantees uniqueness across simultaneously-mounted islands;
  // strip the colons React adds so the value is safe inside url(#...).
  const rawId = useId();
  const uid = `fi-${biome}-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const pal = BIOME_PALETTES[biome];

  return (
    <svg
      className={className}
      viewBox="0 0 400 420"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* painted-paper grain */}
        <filter id={`${uid}-grain`} x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" />
        </filter>

        <linearGradient id={`${uid}-under`} x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={pal.landDark} />
          <stop offset="0.45" stopColor={pal.underside} />
          <stop offset="1" stopColor={pal.underside} />
        </linearGradient>

        <linearGradient id={`${uid}-sheen`} x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={pal.landLight} stopOpacity="0.42" />
          <stop offset="0.55" stopColor={pal.landLight} stopOpacity="0" />
          <stop offset="1" stopColor={pal.landDark} stopOpacity="0.22" />
        </linearGradient>

        <radialGradient id={`${uid}-haze`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${uid}-fall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9E9F8" />
          <stop offset="0.3" stopColor="#8FD8F2" />
          <stop offset="1" stopColor="#CFF0FB" />
        </linearGradient>

        {/* grain is clipped to the island silhouette so it never dirties the page */}
        <clipPath id={`${uid}-clip`}>
          <path d={D_UNDER} />
          <path d={D_RIM} />
          <path d={D_TOP} />
          <path d={D_PEAK} />
        </clipPath>
        {/* shading/texture is clipped to the form it belongs to */}
        <clipPath id={`${uid}-underclip`}>
          <path d={D_UNDER} />
        </clipPath>
        <clipPath id={`${uid}-rimclip`}>
          <path d={D_RIM} />
        </clipPath>
        <clipPath id={`${uid}-topclip`}>
          <path d={D_TOP} />
          <path d={D_PEAK} />
        </clipPath>
      </defs>

      <BackDecor biome={biome} />

      {/* ---- underside: tapering rock mass ---- */}
      <g>
        {D_SPURS.map((d) => (
          <path key={d} d={d} fill={pal.underside} />
        ))}
        {D_SPURS.map((d) => (
          <path key={`s-${d}`} d={d} fill="#000000" opacity={0.16} transform="translate(2.5 0)" />
        ))}
        <path d={D_UNDER} fill={`url(#${uid}-under)`} />
        <g clipPath={`url(#${uid}-underclip)`}>
          <path
            d="M 188,402 C 216,392 250,368 280,338 C 312,306 344,282 356,250
               C 330,280 300,300 268,312 C 240,323 214,340 196,362 C 188,374 186,388 188,402 Z"
            fill="#000000"
            opacity={0.18}
          />
          <path
            d="M 40,244 C 42,282 58,318 84,348 C 100,368 120,382 142,392
               C 120,362 102,330 90,298 C 78,268 62,252 40,244 Z"
            fill={pal.landDark}
            opacity={0.3}
          />
          {/* broad rock facets so the mass does not read as a smooth dome */}
          <path
            d="M 96,270 C 118,292 132,320 140,352 C 122,342 104,320 90,294
               C 84,282 86,272 96,270 Z"
            fill={pal.landDark}
            opacity={0.22}
          />
          <path
            d="M 198,300 C 216,318 226,344 226,372 C 210,360 196,336 188,310
               C 186,302 190,298 198,300 Z"
            fill="#000000"
            opacity={0.12}
          />
          <path
            d="M 256,296 C 272,304 284,312 296,322 C 278,340 258,354 238,364
               C 244,340 250,316 256,296 Z"
            fill={pal.landDark}
            opacity={0.18}
          />
          {D_STRIAE.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={pal.landDark}
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.3}
            />
          ))}
          <path d={blob(146, 322, 13, 5)} fill={pal.landDark} opacity={0.2} />
          <path d={blob(232, 330, 10, 8)} fill={pal.landDark} opacity={0.16} />
        </g>
        {/* haze dissolving the very bottom tip */}
        <ellipse cx={186} cy={400} rx={48} ry={20} fill={`url(#${uid}-haze)`} opacity={0.6} />
        <ellipse cx={192} cy={410} rx={32} ry={12} fill={`url(#${uid}-haze)`} opacity={0.4} />
      </g>

      <HangingDecor biome={biome} pal={pal} uid={uid} />

      {/* ---- cliff band under the front edge ---- */}
      <g>
        <path d={D_RIM} fill={pal.landDark} />
        <path
          d="M 42,247 C 54,260 78,272 110,284 C 140,295 172,301 198,302
             C 214,303 238,300 268,293 C 304,284 336,268 358,250
             C 356,258 354,264 351,270 C 322,288 286,300 246,306
             C 212,311 178,309 146,301 C 106,291 68,272 44,254 C 43,251 42,249 42,247 Z"
          fill={pal.land}
          opacity={0.55}
        />
        <g clipPath={`url(#${uid}-rimclip)`}>
          <path
            d="M 56,287 C 84,311 122,329 162,337 C 186,342 210,343 236,339
               C 276,333 314,319 342,297 C 336,309 328,318 318,326
               C 288,342 254,352 220,354 C 184,356 148,348 116,332 C 90,319 70,304 56,287 Z"
            fill="#000000"
            opacity={0.15}
          />
          {/* vertical rock breaks in the cliff face */}
          {[
            'M 96,286 C 100,300 104,314 106,326',
            'M 152,306 C 154,320 156,332 156,342',
            'M 214,310 C 214,324 213,336 212,346',
            'M 274,300 C 272,314 269,326 265,338',
            'M 322,278 C 318,292 312,304 305,315',
          ].map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#000000"
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.12}
            />
          ))}
        </g>
      </g>

      {/* ---- top surface ---- */}
      <g>
        <path d={D_TOP} fill={pal.land} />
        <path d={D_BACKLIGHT} fill={pal.landLight} opacity={0.4} />
        <path d={D_FRONTSHADE} fill={pal.landDark} opacity={0.2} />
        <path d={D_TOP} fill={`url(#${uid}-sheen)`} />
        <g clipPath={`url(#${uid}-topclip)`}>
          <path d={blob(96, 262, 26, 2)} fill={pal.landDark} opacity={0.12} />
          <path d={blob(268, 276, 30, 6)} fill={pal.landDark} opacity={0.1} />
          <path d={blob(300, 232, 22, 9)} fill={pal.landLight} opacity={0.18} />
          <path d={blob(160, 268, 24, 12)} fill={pal.landLight} opacity={0.14} />
          {/* grass fringe scallops along the front edge */}
          <path
            d="M 46,250 C 60,264 82,275 108,284 C 138,294 170,300 198,301
               C 226,302 258,297 288,288 C 318,279 342,266 356,252
               C 350,264 336,274 318,283 C 288,297 250,306 210,306
               C 168,306 126,297 92,281 C 68,270 52,260 46,250 Z"
            fill={pal.landLight}
            opacity={0.22}
          />
        </g>
      </g>

      {/* ---- peak ---- */}
      <g>
        <path d={D_KNOLL} fill={pal.landDark} opacity={0.6} />
        <path d={D_KNOLL} fill={pal.landLight} opacity={0.2} transform="translate(-4 -3)" />
        <path d={blob(214, 250, 30, 4)} fill={pal.landDark} opacity={0.14} />
        <path d={D_PEAK} fill={pal.land} />
        <path d={D_PEAK_LIT} fill={pal.landLight} opacity={0.5} />
        <path d={D_PEAK_SHADE} fill={pal.landDark} opacity={0.5} />
        {/* soft ridge: a band of mid-tone rather than a hard seam */}
        <path
          d="M 150,127 C 148,166 149,212 156,255"
          fill="none"
          stroke={pal.land}
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d="M 149,130 C 141,140 132,153 123,167 C 111,185 98,207 87,227"
          fill="none"
          stroke={pal.landLight}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path d={blob(114, 214, 18, 7)} fill={pal.landDark} opacity={0.1} />
        <path d={blob(202, 218, 16, 10)} fill={pal.landDark} opacity={0.14} />
        <path d={blob(148, 137, 9, 13)} fill={pal.landLight} opacity={0.35} />
        <path
          d="M 88,240 C 108,249 132,254 156,255 C 186,255 214,247 242,232"
          fill="none"
          stroke={pal.landDark}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.22}
        />
      </g>

      <g clipPath={`url(#${uid}-topclip)`}>
        <SurfaceDecor biome={biome} pal={pal} />
      </g>

      {/* ---- trail ---- */}
      <g>
        <path d={D_TRAIL} fill={pal.landDark} opacity={0.26} transform="translate(3.5 3)" />
        <path d={D_TRAIL} fill={pal.path} />
        <path
          d="M 194,293 C 200,273 218,263 228,251 C 238,238 228,231 210,225
             C 190,218 172,210 163,195 C 155,180 152,160 149,147"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.24}
        />
        <path
          d="M 200,297 C 208,276 226,266 234,254 C 242,242 232,235 214,229
             C 194,222 176,214 167,199 C 159,184 156,162 153,148"
          fill="none"
          stroke={pal.landDark}
          strokeWidth={1.1}
          strokeLinecap="round"
          opacity={0.16}
        />
        <path d={blob(206, 284, 2.4, 3)} fill={pal.landDark} opacity={0.28} />
        <path d={blob(232, 258, 2, 6)} fill={pal.landDark} opacity={0.24} />
        <path d={blob(166, 202, 1.8, 9)} fill={pal.landDark} opacity={0.22} />
        <path d={blob(153, 166, 1.4, 11)} fill={pal.landDark} opacity={0.2} />
      </g>

      <Foliage biome={biome} pal={pal} />

      <FrontDecor biome={biome} pal={pal} />

      {/* ---- painted grain, composited over everything ---- */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect
          x={0}
          y={0}
          width={400}
          height={420}
          filter={`url(#${uid}-grain)`}
          opacity={0.15}
          style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }}
        />
        <rect
          x={0}
          y={0}
          width={400}
          height={420}
          filter={`url(#${uid}-grain)`}
          opacity={0.07}
          style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
        />
      </g>
    </svg>
  );
}
