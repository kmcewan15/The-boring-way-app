import type { Landscape } from './landscapes';

/* Hand-painted-style canyon backdrop for the Learn screen, composed for a wide
   desktop window (16:9).

   Every colour comes from the `palette` prop rather than being baked in, so the
   Learn screen can blend between two worlds as you cross a topic boundary and
   the landscape changes colour continuously instead of cutting.

   Composition note: the step card sits in the middle of the frame and the
   caption sheet covers the bottom band, so a centred trail would be completely
   hidden. Instead the trail sweeps in from the bottom left, passes under the
   card, and recedes to a notch in the rocks on the upper right, which keeps two
   large stretches of it in open view either side of the card.

   Layer order matters: ridge, valley floor and canyon walls go down first, then
   the trail is painted OVER them so it always reads as the brightest shape. */

/* -------------------------------------------------------------- path maths */

interface Pt {
  x: number;
  y: number;
}

/** Smooth polyline: quadratics through the midpoints of each segment. */
function smooth(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `L${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x} ${pts[i].y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last.x} ${last.y}`;
}

/** A tapering ribbon from a centre line of {x, y, hw} samples. */
function ribbon(spine: Array<{ x: number; y: number; hw: number }>): string {
  const left = spine.map((p) => ({ x: p.x - p.hw, y: p.y }));
  const right = spine.map((p) => ({ x: p.x + p.hw, y: p.y })).reverse();
  return `M${left[0].x} ${left[0].y} ${smooth(left)} ${smooth(right)} Z`;
}

/* The trail, sampled bottom (wide, front) to top (narrow, horizon). */
const TRAIL = [
  { x: 290, y: 940, hw: 310 },
  { x: 430, y: 820, hw: 244 },
  { x: 580, y: 730, hw: 192 },
  { x: 740, y: 655, hw: 150 },
  { x: 890, y: 583, hw: 111 },
  { x: 1020, y: 514, hw: 79 },
  { x: 1120, y: 453, hw: 51 },
  { x: 1180, y: 409, hw: 29 },
  { x: 1212, y: 376, hw: 14 },
];

/* A narrower shading ribbon hugging the trail's upper-right edge. */
const TRAIL_LIP = TRAIL.map((p) => ({
  x: p.x + p.hw * 0.62,
  y: p.y,
  hw: p.hw * 0.34,
}));

const TRAIL_D = ribbon(TRAIL);
const TRAIL_LIP_D = ribbon(TRAIL_LIP);

/* ------------------------------------------------------------------- mesas */

/** A rock finger with a soft, slightly lopsided top. `round` shifts the
    silhouette from a domed cap (1) to a flatter mesa top (0.2). Columns taper
    toward the top and bow very slightly, which reads as weathered rock rather
    than a rounded rectangle. */
export function mesaPath(
  x: number,
  w: number,
  top: number,
  round: number,
  lean: number,
  base: number,
) {
  const tw = w * 0.82;
  const off = (w - tw) / 2;
  const r = tw * round;
  const h = base - top;
  const l = x + off;
  const rt = x + off + tw;
  return `M${x} ${base}
    C${x + off * 0.3} ${top + r + h * 0.34} ${l - off * 0.22} ${top + r + h * 0.12} ${l} ${top + r}
    C${l} ${top - r * 0.16} ${l + tw * 0.22} ${top - 10} ${l + tw / 2 + lean} ${top}
    C${l + tw * 0.8} ${top + 9} ${rt} ${top - r * 0.12} ${rt} ${top + r}
    C${rt + off * 0.22} ${top + r + h * 0.12} ${x + w - off * 0.3} ${top + r + h * 0.34} ${x + w} ${base}
    Z`;
}

/* Widths, heights and cap shapes are all deliberately uneven, and a gap is left
   around x 1150-1280 for the trail to vanish into. */
export const MESAS: Array<{
  x: number;
  w: number;
  top: number;
  tone: 0 | 1 | 2;
  round: number;
  lean: number;
}> = [
  { x: -30, w: 118, top: 356, tone: 0, round: 0.34, lean: 0 },
  { x: 66, w: 88, top: 286, tone: 1, round: 0.62, lean: -6 },
  { x: 138, w: 142, top: 338, tone: 0, round: 0.28, lean: 0 },
  { x: 258, w: 74, top: 252, tone: 2, round: 0.7, lean: 5 },
  { x: 316, w: 126, top: 316, tone: 1, round: 0.4, lean: 0 },
  { x: 424, w: 96, top: 268, tone: 0, round: 0.56, lean: -7 },
  { x: 504, w: 138, top: 348, tone: 2, round: 0.24, lean: 0 },
  { x: 626, w: 82, top: 282, tone: 1, round: 0.66, lean: 0 },
  { x: 692, w: 118, top: 330, tone: 0, round: 0.36, lean: 8 },
  { x: 792, w: 92, top: 240, tone: 2, round: 0.6, lean: -5 },
  { x: 866, w: 132, top: 312, tone: 1, round: 0.3, lean: 0 },
  { x: 980, w: 78, top: 272, tone: 0, round: 0.68, lean: 0 },
  { x: 1042, w: 122, top: 344, tone: 2, round: 0.26, lean: 6 },
  { x: 1264, w: 86, top: 300, tone: 1, round: 0.64, lean: -4 },
  { x: 1332, w: 130, top: 356, tone: 0, round: 0.3, lean: 0 },
  { x: 1444, w: 96, top: 288, tone: 2, round: 0.58, lean: 0 },
  { x: 1522, w: 118, top: 340, tone: 1, round: 0.34, lean: 0 },
];

/* --------------------------------------------------- vegetation placements */

const SAGUAROS = [
  { x: 126, y: 706, s: 2.5, flip: false },
  { x: 228, y: 764, s: 1.9, flip: true },
  { x: 1416, y: 730, s: 2.4, flip: true },
  { x: 1298, y: 664, s: 1.5, flip: false },
  { x: 1148, y: 534, s: 0.8, flip: false },
  { x: 330, y: 636, s: 0.9, flip: true },
];

const AGAVES = [
  { x: 306, y: 712, s: 2.2 },
  { x: 1330, y: 782, s: 2.0 },
  { x: 430, y: 756, s: 1.5 },
  { x: 1210, y: 630, s: 1.3 },
  { x: 510, y: 670, s: 0.95 },
  { x: 1094, y: 498, s: 0.6 },
];

const SPRIGS = [
  { x: 370, y: 790, s: 2.3, rot: 8, bloom: false },
  { x: 1256, y: 716, s: 2.0, rot: -10, bloom: false },
  { x: 196, y: 664, s: 1.7, rot: -8, bloom: true },
  { x: 484, y: 730, s: 1.6, rot: 10, bloom: false },
  { x: 1382, y: 654, s: 1.6, rot: 12, bloom: true },
  { x: 628, y: 742, s: 1.4, rot: -6, bloom: false },
  { x: 1160, y: 604, s: 1.2, rot: 6, bloom: false },
  { x: 556, y: 636, s: 1.1, rot: -12, bloom: true },
  { x: 1078, y: 556, s: 0.95, rot: -8, bloom: false },
  { x: 996, y: 492, s: 0.7, rot: 10, bloom: true },
  { x: 1152, y: 468, s: 0.55, rot: -6, bloom: false },
  { x: 1234, y: 432, s: 0.4, rot: 8, bloom: false },
];

const PEBBLES = [
  { x: 470, y: 812, s: 2.2, dark: true },
  { x: 1180, y: 686, s: 1.8, dark: false },
  { x: 654, y: 706, s: 1.3, dark: true },
  { x: 862, y: 640, s: 1.1, dark: false },
  { x: 1046, y: 534, s: 0.8, dark: true },
  { x: 1136, y: 492, s: 0.55, dark: false },
];

const SPRIG_LEAVES = [
  { cx: -6, cy: -9, rx: 5, ry: 3, r: -34 },
  { cx: 6, cy: -13, rx: 5, ry: 3, r: 34 },
  { cx: -6, cy: -19, rx: 4.4, ry: 2.7, r: -30 },
  { cx: 6, cy: -23, rx: 4.4, ry: 2.7, r: 30 },
  { cx: -4.5, cy: -29, rx: 3.6, ry: 2.3, r: -26 },
  { cx: 0, cy: -34, rx: 3.2, ry: 2.1, r: 0 },
];

const AGAVE_BLADES = [-74, -52, -30, -8, 14, 36, 58];

/* -------------------------------------------------------------------------- */

export default function TrailScape({
  palette: p,
  className,
}: {
  palette: Landscape;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
      focusable={false}
      aria-hidden="true"
    >
      <defs>
        <filter id="ts-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves={3}
            stitchTiles="stitch"
            result="ts-noise"
          />
          <feColorMatrix
            in="ts-noise"
            type="matrix"
            values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0 1"
            result="ts-flat"
          />
        </filter>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="1600" height="900" fill={p.sky} />

      {/* Broad, weathered canyon silhouettes instead of repeated rock pillars.
          The open notch is the visual destination for the trail. */}
      <path
        d="M-20 610 L-20 382 C95 356 174 389 255 348 C332 309 417 337 502 374
           C581 408 649 384 722 338 C796 291 874 317 935 374 C1005 438 1066 449 1138 392
           C1202 341 1260 322 1317 343 C1401 375 1486 348 1620 378 L1620 690 Z"
        fill={p.mesaFar}
      />
      <path
        d="M-20 620 L-20 466 C105 433 217 459 315 429 C429 394 537 431 642 406
           C744 382 822 406 895 449 C965 491 1032 479 1093 418 C1150 362 1209 338 1268 362
           C1365 402 1468 398 1620 438 L1620 680 Z"
        fill={p.mesaFarShade}
        opacity={0.72}
      />
      {/* hero rock faces frame the route and create the depth seen in the references */}
      <path
        d="M-20 690 L-20 500 C82 479 167 465 270 474 C337 480 392 449 439 396
           C487 342 550 320 608 346 C650 365 669 411 654 464 C637 523 578 566 533 626
           C505 663 492 705 485 730 Z"
        fill={p.mesaMid}
      />
      <path
        d="M-20 688 L-20 570 C104 537 221 542 310 520 C374 504 427 476 469 428
           C473 492 444 549 396 591 C351 631 303 663 276 708 Z"
        fill={p.mesaMidShade}
        opacity={0.5}
      />
      <path
        d="M1620 675 L1620 412 C1514 387 1416 405 1342 461 C1297 495 1268 536 1249 582
           C1225 641 1167 676 1099 705 L1050 734 C1139 748 1238 744 1332 724 C1446 700 1534 700 1620 714 Z"
        fill={p.mesaMidShade}
      />
      <path
        d="M1620 474 C1510 441 1413 469 1359 520 C1310 567 1281 620 1261 671
           C1328 652 1394 637 1462 640 C1519 643 1570 653 1620 669 Z"
        fill={p.mesaFar}
        opacity={0.48}
      />

      {/* ridge closes the horizon but dips at the destination notch */}
      <path
        d="M-20 700 L-20 486 C160 452 300 496 470 470 C620 446 720 480 880 462
           C1010 448 1090 420 1180 392 C1250 414 1330 470 1450 452 C1530 440 1580 466 1620 452
           L1620 700 Z"
        fill={p.ridge}
      />
      <path
        d="M-20 700 L-20 596 C220 566 420 606 640 584 C860 562 1080 596 1300 572
           C1440 556 1540 578 1620 566 L1620 700 Z"
        fill={p.mesaMidShade}
        opacity={0.55}
      />

      {/* pale valley floor */}
      <path
        d="M-20 900 L-20 676 C240 650 470 690 700 668 C930 646 1160 686 1390 662
           C1490 652 1570 668 1620 658 L1620 900 Z"
        fill={p.basin}
      />

      {/* canyon walls (the trail is painted over them next) */}
      <path
        d="M-20 900 L-20 640 C120 632 232 676 286 750 C332 812 322 862 306 900 Z"
        fill={p.wallLeft}
      />
      <path
        d="M1620 900 L1620 636 C1420 626 1230 660 1096 716 C980 764 916 836 900 900 Z"
        fill={p.wallRight}
      />
      {/* a shoulder of rock pushing in from the right, above the trail */}
      <path
        d="M1620 660 C1450 650 1300 604 1180 556 C1096 522 1040 546 1010 592
           C980 640 1010 686 1080 712 C1200 758 1420 742 1620 754 Z"
        fill={p.wallRight}
        opacity={0.4}
      />

      {/* ---------------- the trail: brightest shape, drawn on top ---------- */}
      <path d={TRAIL_D} fill={p.path} />
      <path d={TRAIL_LIP_D} fill={p.pathShade} opacity={0.55} />

      {/* sand ripples running across the trail */}
      <g stroke={p.pathShade} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={0.6}>
        <path d="M60 878 C240 838 430 828 596 852" />
        <path d="M226 800 C384 768 546 762 672 782" />
        <path d="M410 726 C540 700 672 696 772 714" />
        <path d="M600 656 C704 636 810 634 890 648" />
        <path d="M790 584 C866 570 946 570 1000 580" />
        <path d="M952 512 C1006 502 1064 502 1098 510" />
      </g>

      {/* foreground rocks */}
      <path d="M-20 900 L-20 812 C90 806 168 844 196 900 Z" fill={p.fore} />
      <path d="M1620 900 L1620 800 C1500 794 1420 836 1396 900 Z" fill={p.fore} />

      {/* ------------------------------- vegetation ------------------------
          Kept to the outer thirds and the trail edges, which is where the card
          and the sheet leave open view. */}
      {SAGUAROS.map((c) => (
        <g
          key={`sg${c.x}`}
          transform={`translate(${c.x} ${c.y}) scale(${c.flip ? -c.s : c.s} ${c.s})`}
        >
          <path
            d="M0 0 C-7 0 -11 -5 -11 -13 L-11 -62 C-11 -71 -6 -76 0 -76 C6 -76 11 -71 11 -62 L11 -13 C11 -5 7 0 0 0 Z"
            fill={p.plant}
          />
          <path
            d="M11 -44 C20 -46 27 -41 27 -32 L27 -22 C27 -15 22 -11 17 -13 C13 -15 12 -19 12 -24 L12 -34 Z"
            fill={p.plant}
          />
          <path
            d="M-11 -33 C-21 -35 -29 -29 -29 -20 L-29 -13 C-29 -7 -24 -4 -20 -6 C-16 -8 -15 -12 -15 -16 L-15 -25 Z"
            fill={p.plant}
          />
          <path
            d="M-4 -70 C-6 -55 -6 -30 -4 -8"
            stroke={p.plantLit}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}

      {AGAVES.map((a) => (
        <g key={`ag${a.x}`} transform={`translate(${a.x} ${a.y}) scale(${a.s})`}>
          {AGAVE_BLADES.map((deg, i) => (
            <path
              key={deg}
              d="M0 0 C-3.5 -9 -3.5 -20 0 -30 C3.5 -20 3.5 -9 0 0 Z"
              fill={i % 2 === 0 ? p.plant : p.plantLit}
              transform={`rotate(${deg})`}
            />
          ))}
        </g>
      ))}

      {SPRIGS.map((s) => (
        <g
          key={`sp${s.x}`}
          transform={`translate(${s.x} ${s.y}) rotate(${s.rot}) scale(${s.s})`}
        >
          <path
            d="M0 0 C1 -12 0 -24 0 -33"
            stroke={p.plant}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
          {SPRIG_LEAVES.map((l, i) => (
            <ellipse
              key={i}
              cx={l.cx}
              cy={l.cy}
              rx={l.rx}
              ry={l.ry}
              fill={i % 2 === 0 ? p.plant : p.plantLit}
              transform={`rotate(${l.r} ${l.cx} ${l.cy})`}
            />
          ))}
          {s.bloom && (
            <>
              <circle cx={-7} cy={-20} r={2.4} fill={p.bloom} />
              <circle cx={7} cy={-26} r={2} fill={p.bloom} />
            </>
          )}
        </g>
      ))}

      {PEBBLES.map((b) => (
        <path
          key={`pb${b.x}`}
          d="M0 0 C-9 0 -14 -4 -14 -8 C-14 -13 -8 -17 0 -17 C8 -17 14 -13 14 -8 C14 -4 9 0 0 0 Z"
          fill={b.dark ? p.foreDeep : p.fore}
          transform={`translate(${b.x} ${b.y}) scale(${b.s})`}
        />
      ))}

      {/* pigment grain */}
      <rect
        x="0"
        y="0"
        width="1600"
        height="900"
        filter="url(#ts-grain)"
        opacity={0.13}
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  );
}
