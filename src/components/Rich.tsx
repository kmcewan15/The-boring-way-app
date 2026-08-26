/* Splits on the two inline markups the curriculum uses, keeping the delimiters
   so the map below can tell them apart: `code` and [label](https://url). */
const INLINE = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

/** Renders `backticked` spans as inline code and [label](url) as a link. The
    curriculum is full of commands and filenames, so they need to look like
    commands rather than prose — and the install steps have to be reachable. */
export default function Rich({ text }: { text: string }) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
          return (
            <code className="code" key={i}>
              {part.slice(1, -1)}
            </code>
          );
        }

        const link = LINK.exec(part);
        if (link) {
          return (
            /* Opens away from the lesson: losing your place on the trail to read
               an install page is worse than a new tab. */
            <a
              className="link"
              href={link[2]}
              target="_blank"
              rel="noopener noreferrer"
              key={i}
            >
              {link[1]}
            </a>
          );
        }

        return part;
      })}
    </>
  );
}
