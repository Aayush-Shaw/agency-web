import type { ReactNode } from "react";

/** Small section label: the signature claw mark + uppercase tracked text. */
export default function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted ${className}`}
    >
      <span className="claw h-4 w-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
