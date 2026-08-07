import { ArrowDown } from "lucide-react";
import Roll from "@/components/ui/Roll";

/**
 * The "keep going" pill, and only the pill. Placement and the decision to show
 * it belong to the caller, because the two users answer both differently: the
 * hero parks one in its bottom padding for the whole time it is on screen,
 * Process drops one into the space under its dial and takes it away again the
 * moment the dial starts turning. Folding either rule in here would mean the
 * other one fighting it with a variant.
 *
 * With `href` it is a real control, and worth being one - on a phone it saves
 * the swipe it is asking for. `onClick` is the same thing where there is no
 * element to point at: Process is pinned, so its next "screen" is a scroll
 * distance rather than an anchor. Given neither it is decoration and hidden
 * from assistive tech: "scroll down" names a gesture a screen reader user is
 * not making, and the content it points at is the next thing in the document
 * anyway.
 *
 * Label type is Eyebrow's, deliberately - this is the same size of voice.
 */
export default function ScrollHint({
  href,
  onClick,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const label = (
    <>
      {/* Word only. The arrow keeps its own bob - see .scroll-hint-arrow. */}
      <Roll>Scroll</Roll>
      <ArrowDown className="scroll-hint-arrow h-4 w-4 shrink-0" aria-hidden="true" />
    </>
  );

  const base = `inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted ${className}`;
  const live = `${base} transition-colors hover:border-accent-primary hover:text-accent-primary`;

  if (href)
    return (
      <a href={href} className={live}>
        {label}
      </a>
    );

  if (onClick)
    return (
      <button type="button" onClick={onClick} className={live}>
        {label}
      </button>
    );

  return (
    <span aria-hidden="true" className={base}>
      {label}
    </span>
  );
}
