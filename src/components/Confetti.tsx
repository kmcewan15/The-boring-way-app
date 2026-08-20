import { useMemo } from 'react';

/* One burst, then it stops. Colours come from the app's own palette so the
   celebration still looks like the rest of the product. */
const PIECES = 70;
const COLOURS = ['#dcef9c', '#f6e7da', '#d4a091', '#fdede8', '#1b8a6b', '#fbd9e3'];

type Bit = React.CSSProperties & Record<string, string | number>;

/** Purely decorative, so it is hidden from assistive tech and sits behind
    `pointer-events: none` — the buttons underneath stay clickable. */
export default function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const round = Math.random() < 0.3;
        const w = 7 + Math.random() * 6;
        return {
          id: i,
          round,
          style: {
            left: `${Math.random() * 100}%`,
            width: w,
            height: round ? w : 10 + Math.random() * 9,
            background: COLOURS[i % COLOURS.length],
            animationDelay: `${Math.random() * 1.2}s`,
            animationDuration: `${2.6 + Math.random() * 1.8}s`,
            '--drift': `${(Math.random() * 2 - 1) * 90}px`,
            '--spin': `${360 + Math.random() * 720}deg`,
          } as Bit,
        };
      }),
    [],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <i
          key={b.id}
          className={`confetti__bit${b.round ? ' confetti__bit--round' : ''}`}
          style={b.style}
        />
      ))}
    </div>
  );
}
