import { Fragment, type CSSProperties } from "react";

interface LetterSplitProps {
  text: string;
  className?: string;
  wordClassName?: string;
  letterClassName?: string;
  /** Start index for `--i` (useful to chain several splits). */
  offset?: number;
}

/**
 * Splits a string into `.word > .letter` spans so CSS can animate each glyph.
 * Each letter gets `data-idx` and a `--i` custom property with its index.
 * The full text stays available to assistive tech via a visually-hidden span.
 */
export function LetterSplit({
  text,
  className,
  wordClassName = "word",
  letterClassName = "letter",
  offset = 0,
}: LetterSplitProps) {
  const words = text.split(" ");
  let idx = offset;
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <Fragment key={wi}>
            <span className={wordClassName} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {Array.from(word).map((ch, ci) => {
                const i = idx++;
                return (
                  <span
                    key={ci}
                    className={letterClassName}
                    data-idx={i}
                    style={{ "--i": i } as CSSProperties}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? <span className="space"> </span> : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
