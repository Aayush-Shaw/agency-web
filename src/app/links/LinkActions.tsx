"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";

export default function LinkActions() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const goBack = () => {
    router.back();
  };

  const share = async () => {
    const data = {
      title: "Digi Bear",
      text: "Digi Bear — Design, Video & AI Studio",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // Dismissing the native dialog is an expected outcome.
      }
      return;
    }

    await navigator.clipboard?.writeText(data.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const buttonClass =
    "grid size-11 place-items-center rounded-full border border-border bg-bg/75 text-text shadow-sm backdrop-blur-sm transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";

  return (
    <div className="pointer-events-none absolute inset-x-5 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center justify-between">
      <button type="button" onClick={goBack} className={`${buttonClass} pointer-events-auto`} aria-label="Go back">
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={share} className={`${buttonClass} pointer-events-auto`} aria-label="Share this page">
        <Share2 className="size-5" aria-hidden="true" />
      </button>
      <span className="sr-only" role="status">{copied ? "Link copied to clipboard" : ""}</span>
    </div>
  );
}
