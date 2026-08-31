import { useEffect, useRef } from 'react';
import type { Block } from '../data/curriculum';
import Rich from './Rich';
import RequestBuilder from './RequestBuilder';
import TokenCalc from './TokenCalc';
import { IconChevronDown, IconTerminal, IconWarning } from './Icons';

type FullscreenVideo = HTMLVideoElement & {
  webkitRequestFullscreen?: () => void;
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

/* iOS Safari has no element-level Fullscreen API, only this video-only one, so
   every path is tried in order and the rest is left to fail silently — a demo
   that plays inline is a fine fallback, not an error. */
function requestFullscreen(video: FullscreenVideo) {
  try {
    if (video.requestFullscreen) void video.requestFullscreen().catch(() => {});
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  } catch {
    /* Fullscreen needs a user gesture; play already came from one, but a
       browser can still refuse. Not worth surfacing. */
  }
}

function exitFullscreen(video: FullscreenVideo) {
  const doc = document as FullscreenDocument;
  try {
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
    else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.();
    else video.webkitExitFullscreen?.();
  } catch {
    /* Already out of fullscreen, or it never entered — fine either way. */
  }
}

/** A recorded demo. Plays inline, goes fullscreen on play and comes back out a
    beat after it ends. `src` is required by the Block union, so there is no
    unrecorded state to render. */
function VideoSlot({ title, src }: { title: string; src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const exitTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(exitTimer.current), []);

  return (
    <figure className="vid">
      <video
        ref={videoRef}
        className="vid__player"
        src={src}
        controls
        preload="metadata"
        onPlay={() => {
          if (videoRef.current) requestFullscreen(videoRef.current);
        }}
        onEnded={() => {
          window.clearTimeout(exitTimer.current);
          /* A beat after the clip ends, not instantly — an abrupt cut back to
             the lesson reads as the video having broken. */
          exitTimer.current = window.setTimeout(() => {
            if (videoRef.current) exitFullscreen(videoRef.current);
          }, 1500);
        }}
      />
      <figcaption className="vid__cap">{title}</figcaption>
    </figure>
  );
}

/** One content block. Split out from StepBody so a `track` can render the blocks
    nested inside it without duplicating the switch. */
function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'p':
      return (
        <p className="body__p">
          <Rich text={b.text} />
        </p>
      );

    case 'why':
      return (
        <div className="why">
          <h2 className="why__h">Why this matters</h2>
          <p className="why__p">
            <Rich text={b.text} />
          </p>
        </div>
      );

    /* Folded, the word is the summary and the definition is the payload — a
       reader who already knows the term skips it without scrolling past it. */
    case 'term':
      if (b.collapsed) {
        return (
          <details className="term term--fold">
            <summary className="term__sum">
              <span className="term__word">{b.word}</span>
              <IconChevronDown size={18} className="term__chev" />
            </summary>
            <p className="term__means">
              <Rich text={b.means} />
            </p>
          </details>
        );
      }
      return (
        <dl className="term">
          <dt className="term__word">{b.word}</dt>
          <dd className="term__means">
            <Rich text={b.means} />
          </dd>
        </dl>
      );

    /* h2 rather than h3: the other callout headings are h2, and a body with no
       why/warn ahead of it would otherwise jump h1 -> h3. */
    case 'panel':
      return (
        <section className="groupbox">
          <h2 className="groupbox__h">
            <Rich text={b.heading} />
          </h2>
          <div className="groupbox__body">
            {b.blocks.map((inner, i) => (
              <BlockView b={inner} key={i} />
            ))}
          </div>
        </section>
      );

    case 'list':
      return (
        <ul className="list">
          {b.items.map((item, i) => (
            <li className="list__item" key={i}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      );

    case 'do':
      return (
        <div className="do">
          <span className="do__label">
            <IconTerminal size={20} />
            {b.label}
          </span>
          <pre className="do__cmd">{b.cmd}</pre>
        </div>
      );

    case 'see':
      return (
        <p className="see">
          <span className="see__label">You should see</span>
          <Rich text={b.text} />
        </p>
      );

    case 'tip':
      return (
        <div className="tip">
          <h2 className="tip__h">Tip</h2>
          <p className="tip__p">
            <Rich text={b.text} />
          </p>
        </div>
      );

    case 'warn':
      return (
        <div className="warn">
          <h2 className="warn__h">
            <IconWarning size={19} className="warn__icon" />
            Careful
          </h2>
          <p className="warn__p">
            <Rich text={b.text} />
          </p>
        </div>
      );

    /* The wrapper is focusable and named because below 1180px it scrolls
       sideways, and a keyboard-only reader has to reach the last column. */
    case 'table':
      return (
        <div
          className="tbl"
          tabIndex={0}
          role="region"
          aria-label="Do and do not, by dimension. Scrolls sideways."
        >
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

    /* Two ways to do the same step. `details` is used rather than a hand-rolled
       toggle so it is keyboard-reachable for free. Closed by default: a reader
       follows only their own path, not both branches at once. */
    case 'track':
      return (
        <details className="track" open={b.open ?? false}>
          <summary className="track__sum">
            <span className="track__label">{b.label}</span>
            <IconChevronDown size={20} className="track__chev" />
          </summary>
          <div className="track__body">
            {b.blocks.map((inner, i) => (
              <BlockView b={inner} key={i} />
            ))}
          </div>
        </details>
      );

    case 'calc':
      return <TokenCalc />;

    case 'builder':
      return <RequestBuilder />;

    case 'video':
      return <VideoSlot title={b.title} src={b.src} />;

    /* Adding a block type without handling it here is a compile error,
       rather than content that silently fails to render. */
    default: {
      const unhandled: never = b;
      return unhandled;
    }
  }
}

/** The teaching content of a step. Each block is its own shape on the page, so a
    reader who is not a developer can tell prose, a thing to type, and a warning
    apart at a glance. */
export default function StepBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="body">
      {blocks.map((b, i) => (
        <BlockView b={b} key={i} />
      ))}
    </div>
  );
}
