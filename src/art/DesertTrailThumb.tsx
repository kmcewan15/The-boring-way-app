/* Miniature desert vignette, used on the "My progress" tile and as a circular
   avatar in the trail strip. Background is transparent and the landforms define
   the silhouette, so it floats on whatever card colour it sits on rather than
   reading as a framed picture. */

const C = {
  mesaFar: '#E0B3A2',
  mesaMid: '#C08B77',
  mesaDark: '#AC7460',
  sand: '#EEDAC8',
  sandShade: '#DCC0A8',
  path: '#FDF7EF',
  plant: '#0F6D55',
  plantLit: '#1B8A6B',
  bloom: '#F7D8D1',
  rock: '#8A4527',
};

export default function DesertTrailThumb({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      focusable={false}
      aria-hidden="true"
    >
      {/* No grain overlay here, unlike TrailScape: this scene sits on a
          transparent background, so a full-bleed multiply rect would darken the
          card behind it and read as a framed square. */}

      {/* rock fingers, tapering slightly, standing behind the sand mound */}
      <path d="M28 88 L31 54 C31 45 35 41 40 41 C45 41 49 45 49 54 L52 88 Z" fill={C.mesaFar} />
      <path d="M50 88 L53 42 C53 32 57 27 63 27 C69 27 73 32 73 42 L76 88 Z" fill={C.mesaDark} />
      <path d="M72 88 L74 57 C74 48 78 44 82 44 C86 44 90 48 90 57 L93 88 Z" fill={C.mesaMid} />

      {/* sand mound the whole scene sits on */}
      <path
        d="M8 99 C8 88 19 81 33 78 C50 74 71 75 89 80 C103 84 112 90 112 99 Z"
        fill={C.sand}
      />
      <path
        d="M8 99 C8 93 16 88 28 86 C46 83 74 84 92 88 C104 91 112 94 112 99 Z"
        fill={C.sandShade}
        opacity={0.45}
      />

      {/* the trail, brightest shape, running down the mound */}
      <path
        d="M44 100 C42 93 47 87 53 83 C57 80 59 76 58 71 L68 71 C69 77 67 82 62 87 C57 91 55 95 56 100 Z"
        fill={C.path}
      />

      {/* saguaro on the left */}
      <g transform="translate(22 94) scale(0.42)">
        <path
          d="M0 0 C-7 0 -11 -5 -11 -13 L-11 -62 C-11 -71 -6 -76 0 -76 C6 -76 11 -71 11 -62 L11 -13 C11 -5 7 0 0 0 Z"
          fill={C.plant}
        />
        <path
          d="M11 -44 C20 -46 27 -41 27 -32 L27 -22 C27 -15 22 -11 17 -13 C13 -15 12 -19 12 -24 L12 -34 Z"
          fill={C.plant}
        />
        <path
          d="M-11 -33 C-21 -35 -29 -29 -29 -20 L-29 -13 C-29 -7 -24 -4 -20 -6 C-16 -8 -15 -12 -15 -16 L-15 -25 Z"
          fill={C.plant}
        />
        <path d="M-4 -70 C-6 -55 -6 -30 -4 -8" stroke={C.plantLit} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>

      {/* agave and sprigs on the right */}
      <g transform="translate(96 92) scale(0.62)">
        {[-70, -46, -22, 2, 26, 50].map((a) => (
          <path
            key={a}
            d="M0 0 C-3.5 -9 -3.5 -20 0 -30 C3.5 -20 3.5 -9 0 0 Z"
            fill={a % 3 === 0 ? C.plant : C.plantLit}
            transform={`rotate(${a})`}
          />
        ))}
      </g>

      {[
        { x: 84, y: 88, s: 0.9, bloom: true },
        { x: 34, y: 90, s: 0.72, bloom: false },
      ].map((p) => (
        <g key={p.x} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          <path d="M0 0 C1 -7 0 -13 0 -18" stroke={C.plant} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <ellipse cx={-4} cy={-6} rx={3.4} ry={2} fill={C.plant} transform="rotate(-32 -4 -6)" />
          <ellipse cx={4} cy={-9} rx={3.4} ry={2} fill={C.plantLit} transform="rotate(32 4 -9)" />
          <ellipse cx={-3.4} cy={-13} rx={2.8} ry={1.7} fill={C.plant} transform="rotate(-28 -3.4 -13)" />
          <ellipse cx={0} cy={-18} rx={2.2} ry={1.5} fill={C.plantLit} />
          {p.bloom && <circle cx={4} cy={-13} r={1.7} fill={C.bloom} />}
        </g>
      ))}

      {/* pebbles */}
      <path
        d="M72 95 C69 95 67 94 67 92 C67 90 69 88 72 88 C75 88 78 90 78 92 C78 94 76 95 72 95 Z"
        fill={C.rock}
      />
      <path
        d="M48 92 C46 92 44 91 44 90 C44 88 46 87 48 87 C50 87 52 88 52 90 C52 91 50 92 48 92 Z"
        fill={C.rock}
        opacity={0.75}
      />
    </svg>
  );
}
