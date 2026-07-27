import { Fragment } from "react";

/**
 * Splits a phrase into individually animatable word boxes.
 *
 * The space lives *between* the boxes as an ordinary text node, never inside
 * them. Both give you a wrap opportunity, but only a real space collapses at
 * the end of a line — a trailing `&nbsp;` inside each box keeps its width
 * there and pushes the last word of every line over, which costs the hero
 * headline an extra line at desktop widths.
 *
 * Deliberately never wrapped around `.text-gradient` text: that class clips a
 * single background across its own text, so slicing it into per-word boxes
 * would restart the honey→cinnamon ramp on every word instead of running it
 * once across the phrase. Gradient runs stay whole and animate as one unit.
 */
export default function Words({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      <span className={`${className} inline-block`}>{word}</span>{" "}
    </Fragment>
  ));
}
