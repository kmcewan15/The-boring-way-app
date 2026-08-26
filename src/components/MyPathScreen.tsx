import DesertTrailThumb from '../art/DesertTrailThumb';
import { IconSparkles, IconStopwatch } from './Icons';

/* 'completed' used to be its own destination here, one tile below "My
   progress" telling a version of the same story. It's a section inside
   "My progress" now instead of a peer of it -- see CompletedSteps in
   MyPathDetails.tsx, folded into ProgressScreen. */
export type MyPathRoute = 'timebox' | 'progress' | 'notes';

export default function MyPathScreen({ onOpen }: { onOpen: (r: MyPathRoute) => void }) {
  return (
    <div className="myway">
      <button
        type="button"
        className="tile tile--pink tile--tall"
        onClick={() => onOpen('timebox')}
      >
        <span className="tile__label">Timebox</span>
        <span className="tile__art tile__art--timebox">
          <IconStopwatch size={132} />
        </span>
      </button>

      <button
        type="button"
        className="tile tile--brown tile--tall"
        onClick={() => onOpen('progress')}
      >
        <span className="tile__label">My progress</span>
        <span className="tile__art tile__art--progress">
          <DesertTrailThumb />
        </span>
      </button>

      <hr className="myway__rule" />

      <button
        type="button"
        className="tile tile--brown tile--row myway__wide"
        onClick={() => onOpen('notes')}
      >
        <span className="tile__label">My notes</span>
        <span className="tile__icon">
          <IconSparkles size={42} />
        </span>
      </button>
    </div>
  );
}
