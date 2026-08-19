import DesertTrailThumb from '../art/DesertTrailThumb';
import { IconCheckCircle, IconSparkles, IconStopwatch } from './Icons';

export type MyPathRoute = 'timebox' | 'progress' | 'completed' | 'notes';

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
        className="tile tile--brown tile--row"
        onClick={() => onOpen('completed')}
      >
        <span className="tile__label">Completed steps</span>
        <span className="tile__icon">
          <IconCheckCircle size={42} />
        </span>
      </button>

      <button
        type="button"
        className="tile tile--brown tile--row"
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
