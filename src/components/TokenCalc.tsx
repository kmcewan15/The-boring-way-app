import { useState } from 'react';

/* Price per million input tokens, from the cheapest current model to the most
   capable one. These two numbers are the only thing to change when Anthropic
   changes its pricing. */
const RATE_LOW = 1.0;
const RATE_HIGH = 10.0;

/** Rough English approximation. `/context` in Claude Code reports real counts. */
const CHARS_PER_TOKEN = 4;

/** A desk that is already well filled, for the comparison row. */
const FULL_DESK = 100_000;

/** Small money needs more decimal places than large money, or it reads as zero. */
function usd(n: number) {
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  if (n >= 0.0001) return `$${n.toFixed(5)}`;
  return `$${n.toFixed(7)}`;
}

function range(tokens: number) {
  return `${usd((tokens * RATE_LOW) / 1e6)} to ${usd((tokens * RATE_HIGH) / 1e6)}`;
}

/** Turns the abstract token into something the reader can poke at. The third row
    is the point of the whole topic: the same question costs far more once the
    desk is full, because Claude re-reads the desk on every turn. */
export default function TokenCalc() {
  const [text, setText] = useState('');
  const tokens = Math.ceil(text.trim().length / CHARS_PER_TOKEN);

  return (
    <div className="calc">
      <label className="calc__label" htmlFor="calc-in">
        Try it — type or paste anything
      </label>
      <textarea
        id="calc-in"
        className="calc__in"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Turn my rough notes into three bullets for each project."
      />

      {tokens > 0 && (
        <dl className="calc__out">
          <div className="calc__row">
            <dt>That is about</dt>
            <dd>
              {tokens.toLocaleString()} {tokens === 1 ? 'token' : 'tokens'}
            </dd>
          </div>
          <div className="calc__row">
            <dt>Asking it on a clear desk</dt>
            <dd>{range(tokens)}</dd>
          </div>
          <div className="calc__row calc__row--punch">
            <dt>Asking it on a desk already holding 100,000 tokens</dt>
            <dd>{range(tokens + FULL_DESK)}</dd>
          </div>
        </dl>
      )}

      <p className="calc__note">
        Estimates only, from the cheapest current model to the most capable one.
      </p>
    </div>
  );
}
