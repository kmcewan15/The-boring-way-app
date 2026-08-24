import { useEffect } from 'react';
import FloatingIsland from '../art/FloatingIsland';
import { LANDSCAPES } from '../art/landscapes';
import { TOPICS, TOTAL_TOPICS } from '../data/curriculum';
import { useApp } from '../state/useApp';
import { IconCircleCheck, IconClose } from './Icons';

/* The whole journey on one screen.

   Distinct from ExploreTopics on purpose: that shows one topic at a time and you
   scroll between them, which tells you about a topic but never about the shape of
   the thing. This shows all ten worlds at once, on one continuous path, so the
   curriculum reads as a route with a beginning and an end rather than a list.

   Topic 1 sits at the bottom and Topic 10 at the top, matching the trail's own
   sense of climbing. */

/* Hand-placed rather than generated: an even zigzag looks mechanical, and these
   are nudged so the path leans and recovers the way a real track would. Both the
   nodes and the connecting curve read from this one array, so they cannot drift
   apart. Coordinates are percentages of the stage. */
const NODES = [
  { x: 25, y: 94 },
  { x: 62, y: 84 },
  { x: 33, y: 75 },
  { x: 71, y: 65 },
  { x: 39, y: 56 },
  { x: 75, y: 46 },
  { x: 37, y: 36 },
  { x: 67, y: 26 },
  { x: 31, y: 16 },
  { x: 61, y: 6 },
];

/** Catmull-Rom through the nodes, emitted as cubic beziers -- a polyline through
    ten points reads as a chart, a curve reads as a path someone walked. */
function curveThrough(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';
  const at = (i: number) => points[Math.min(Math.max(i, 0), points.length - 1)];
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function JourneyMap({ onClose }: { onClose: () => void }) {
  const { cursor, jumpTo, isCompleted, topicQuizzes } = useApp();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* The journey's own colour progression, bottom to top. Reversed because a
     linear-gradient's stops run from the top down while Topic 1 is at the
     bottom -- and stop positions have to be non-decreasing or they get clamped. */
  const sky = `linear-gradient(180deg, ${TOPICS.slice()
    .reverse()
    .map((t, i) => `${LANDSCAPES[t.biome].sky} ${((i / (TOTAL_TOPICS - 1)) * 100).toFixed(1)}%`)
    .join(', ')})`;

  const here = Math.min(Math.max(cursor.topic - 1, 0), TOTAL_TOPICS - 1);
  /* Two paths rather than one with a dash offset: dashes are measured in user
     space, and this SVG is stretched with preserveAspectRatio="none", so a
     dash-based reveal lands in a different place at every window size. Ending the
     lit path at the node you have reached is exact at any size. */
  const walked = curveThrough(NODES.slice(0, here + 1));
  const whole = curveThrough(NODES);

  return (
    <div className="map" role="dialog" aria-modal="true" aria-label="Journey map" style={{ background: sky }}>
      <div className="map__head">
        <span className="map__label">The whole trail</span>
        <button type="button" className="map__close" onClick={onClose} aria-label="Close map">
          <IconClose size={32} />
        </button>
      </div>

      {/* preserveAspectRatio="none" lets one 0-100 coordinate space serve both the
          curve and the CSS percentages on the nodes, so they always agree.
          non-scaling-stroke keeps the line an even weight despite the stretch. */}
      <svg className="map__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="map__line" d={whole} vectorEffect="non-scaling-stroke" />
        <path className="map__line map__line--walked" d={walked} vectorEffect="non-scaling-stroke" />
      </svg>

      {TOPICS.map((topic, i) => {
        const node = NODES[i];
        const done = topic.steps.filter((s) => isCompleted(s.id)).length;
        const sealed = topicQuizzes[topic.number]?.passed === true;
        const current = i === here;
        /* Text goes on whichever side has room: nodes on the left half push their
           label right, and vice versa. */
        const side = node.x < 50 ? 'r' : 'l';

        return (
          <button
            key={topic.id}
            type="button"
            className={`mapnode mapnode--${side}${current ? ' mapnode--here' : ''}${
              sealed ? ' mapnode--sealed' : ''
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => {
              jumpTo({ topic: topic.number, step: 0 });
              onClose();
            }}
          >
            <span className="mapnode__art" aria-hidden="true">
              <FloatingIsland biome={topic.biome} />
            </span>

            <span className="mapnode__text">
              <span className="mapnode__no">Topic {topic.number}</span>
              <span className="mapnode__title">{topic.title}</span>
              <span className="mapnode__state">
                {sealed && <IconCircleCheck size={18} />}
                {sealed
                  ? 'Complete'
                  : current
                    ? 'You are here'
                    : `${done} of ${topic.steps.length} steps`}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
