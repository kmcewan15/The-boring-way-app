/* One-click copy for anything written to be pasted into Claude. Follows the
   pattern already set by `RequestBuilder.tsx:58-76`: hide the button on an
   insecure origin rather than offer a dead one, reset the label from an effect
   so the timer is cleaned up, and only say "Copied" once the write resolves. */
import { useEffect, useState } from 'react';
import { IconCheckSmall, IconCopy } from './Icons';

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  /* Absent on an insecure origin. */
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard;

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  if (!canCopy) return null;

  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <button
      type="button"
      className={copied ? 'copybtn copybtn--done' : 'copybtn'}
      onClick={copy}
      aria-label={copied ? 'Copied' : `Copy ${label}`}
    >
      {copied ? <IconCheckSmall size={17} /> : <IconCopy size={17} />}
      <span className="copybtn__t">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
