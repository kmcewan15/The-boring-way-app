import type { Block } from '../data/curriculum';
import Rich from './Rich';
import { IconPlay, IconTerminal } from './Icons';

/** A video that has not been recorded yet. Shows which video belongs here so the
    slot reads as deliberate rather than broken. */
function VideoSlot({ title, src }: { title: string; src?: string }) {
  if (src) {
    return (
      <figure className="vid">
        <video className="vid__player" src={src} controls preload="metadata" />
        <figcaption className="vid__cap">{title}</figcaption>
      </figure>
    );
  }
  return (
    <div className="vid vid--empty">
      <span className="vid__badge" aria-hidden="true">
        <IconPlay size={26} />
      </span>
      <div>
        <p className="vid__soon">Video coming soon</p>
        <p className="vid__cap">{title}</p>
      </div>
    </div>
  );
}

/** The teaching content of a step. Each block is its own shape on the page, so a
    reader who is not a developer can tell prose, a thing to type, and a warning
    apart at a glance. */
export default function StepBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="body">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p':
            return (
              <p className="body__p" key={i}>
                <Rich text={b.text} />
              </p>
            );

          case 'why':
            return (
              <div className="why" key={i}>
                <h2 className="why__h">Why this matters</h2>
                <p className="why__p">
                  <Rich text={b.text} />
                </p>
              </div>
            );

          case 'term':
            return (
              <dl className="term" key={i}>
                <dt className="term__word">{b.word}</dt>
                <dd className="term__means">
                  <Rich text={b.means} />
                </dd>
              </dl>
            );

          case 'do':
            return (
              <div className="do" key={i}>
                <span className="do__label">
                  <IconTerminal size={20} />
                  {b.label}
                </span>
                <pre className="do__cmd">{b.cmd}</pre>
              </div>
            );

          case 'see':
            return (
              <p className="see" key={i}>
                <span className="see__label">You should see</span>
                <Rich text={b.text} />
              </p>
            );

          case 'warn':
            return (
              <div className="warn" key={i}>
                <h2 className="warn__h">Careful</h2>
                <p className="warn__p">
                  <Rich text={b.text} />
                </p>
              </div>
            );

          case 'table':
            return (
              <div className="tbl" key={i}>
                <table className="tbl__grid">
                  <thead>
                    <tr>
                      <th scope="col">Dimension</th>
                      <th scope="col">Do</th>
                      <th scope="col">Don't</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r) => (
                      <tr key={r.dimension}>
                        <th scope="row">
                          <Rich text={r.dimension} />
                        </th>
                        <td className="tbl__do">
                          <Rich text={r.doThis} />
                        </td>
                        <td className="tbl__dont">
                          <Rich text={r.notThis} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'video':
            return <VideoSlot key={i} title={b.title} src={b.src} />;

          /* Adding a block type without handling it here is a compile error,
             rather than content that silently fails to render. */
          default: {
            const unhandled: never = b;
            return unhandled;
          }
        }
      })}
    </div>
  );
}
