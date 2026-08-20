/** Renders `backticked` spans as inline code. The curriculum is full of commands
    and filenames, so they need to look like commands rather than prose. */
export default function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
          <code className="code" key={i}>
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
