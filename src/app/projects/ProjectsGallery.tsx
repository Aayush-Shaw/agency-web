"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PROJECTS, type Project } from "@/lib/projects";
import Roll from "@/components/ui/Roll";

type FilterCategory = "Website" | "AI Video" | "Video";

const FILTER_TABS: { id: FilterCategory; label: string }[] = [
  { id: "Website", label: "Website" },
  { id: "AI Video", label: "AI Video" },
  { id: "Video", label: "Video" },
];

const CAROUSEL_INTERVAL_MS = 3000;
const VIDEO_LOAD_MARGIN = "300px 0px";

function loadVideoSource(video: HTMLVideoElement) {
  if (!video.hasAttribute("poster") && video.dataset.posterSrc) {
    video.poster = video.dataset.posterSrc;
  }

  if (!video.hasAttribute("src") && video.dataset.src) {
    video.src = video.dataset.src;
    video.load();
  }
}

function unloadVideoSource(video: HTMLVideoElement) {
  video.pause();
  if (video.hasAttribute("src")) {
    video.removeAttribute("src");
    video.load();
  }
}

/**
 * Loads card videos shortly before they enter the viewport and cycles through
 * visible videos one at a time. Hovering a card temporarily takes precedence
 * over the automatic playback.
 */
function useGalleryVideoController(paused: boolean) {
  const videos = useRef<Map<string, HTMLVideoElement>>(new Map());
  const visible = useRef<Set<string>>(new Set());
  const observer = useRef<IntersectionObserver | null>(null);
  const loadObserver = useRef<IntersectionObserver | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentKey = useRef<string | null>(null);
  const hoveredKey = useRef<string | null>(null);
  const loadImmediately = useRef(false);
  const playNext = useRef<() => void>(() => {});
  const playbackQueued = useRef(false);

  const requestPlayback = useCallback(() => {
    if (playbackQueued.current) return;

    playbackQueued.current = true;
    queueMicrotask(() => {
      playbackQueued.current = false;
      playNext.current();
    });
  }, []);

  // Track which cards are visible enough for one-at-a-time playback.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.carouselKey;
          if (!key) continue;
          if (entry.isIntersecting) {
            visible.current.add(key);
            requestPlayback();
          } else {
            visible.current.delete(key);
          }
        }
      },
      { threshold: 0.3 },
    );

    videos.current.forEach((video) => observer.current?.observe(video));

    return () => {
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [requestPlayback]);

  // Attach media URLs only when a card is in or near the viewport.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      loadImmediately.current = true;
      videos.current.forEach(loadVideoSource);
      return;
    }

    loadObserver.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) loadVideoSource(video);
          else unloadVideoSource(video);
        }
      },
      { rootMargin: VIDEO_LOAD_MARGIN },
    );

    videos.current.forEach((video) => loadObserver.current?.observe(video));

    return () => {
      loadObserver.current?.disconnect();
      loadObserver.current = null;
    };
  }, []);

  // Register / unregister a video card
  const register = useCallback((key: string, el: HTMLVideoElement) => {
    videos.current.set(key, el);
    observer.current?.observe(el);
    loadObserver.current?.observe(el);
    if (loadImmediately.current) loadVideoSource(el);
  }, []);

  const unregister = useCallback((key: string, el: HTMLVideoElement) => {
    videos.current.delete(key);
    visible.current.delete(key);
    observer.current?.unobserve(el);
    loadObserver.current?.unobserve(el);
    unloadVideoSource(el);
    if (currentKey.current === key) currentKey.current = null;
    if (hoveredKey.current === key) hoveredKey.current = null;
  }, []);

  const hoverStart = useCallback((key: string) => {
    hoveredKey.current = key;

    if (currentKey.current && currentKey.current !== key) {
      const current = videos.current.get(currentKey.current);
      current?.pause();
      try { if (current) current.currentTime = 0; } catch { /* ignore */ }
      currentKey.current = null;
    }

    const video = videos.current.get(key);
    if (video) {
      loadVideoSource(video);
      void video.play().catch(() => {});
    }
  }, []);

  const hoverEnd = useCallback((key: string) => {
    if (hoveredKey.current !== key) return;

    const video = videos.current.get(key);
    video?.pause();
    try { if (video) video.currentTime = 0; } catch { /* ignore */ }
    hoveredKey.current = null;
    if (currentKey.current === key) currentKey.current = null;
    requestPlayback();
  }, [requestPlayback]);

  // Cycle visible videos on every device unless a card is being hovered.
  useEffect(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    if (paused) {
      // Pause the currently playing video
      if (currentKey.current) {
        videos.current.get(currentKey.current)?.pause();
        currentKey.current = null;
      }
      return;
    }

    function tick() {
      if (document.hidden || hoveredKey.current) return;

      // Pause current
      if (currentKey.current) {
        const prev = videos.current.get(currentKey.current);
        if (prev) {
          prev.pause();
          try { prev.currentTime = 0; } catch { /* ignore */ }
        }
      }

      // Pick next visible video sequentially
      const visibleKeys = [...visible.current].filter((k) =>
        videos.current.has(k),
      );
      if (visibleKeys.length === 0) {
        currentKey.current = null;
        return;
      }

      const curIdx = currentKey.current
        ? visibleKeys.indexOf(currentKey.current)
        : -1;
      const nextIdx = (curIdx + 1) % visibleKeys.length;
      const nextKey = visibleKeys[nextIdx];
      const nextVideo = videos.current.get(nextKey);

      if (nextVideo) {
        currentKey.current = nextKey;
        void nextVideo.play().catch(() => {});
      }
    }

    playNext.current = tick;

    // Play first one immediately, then cycle
    tick();
    intervalId.current = setInterval(tick, CAROUSEL_INTERVAL_MS);

    // Pause every card when the tab is hidden. The interval resumes playback.
    function onVisChange() {
      if (document.hidden) videos.current.forEach((video) => video.pause());
    }
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
      playNext.current = () => {};
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [paused]);

  return { register, unregister, hoverStart, hoverEnd };
}

function cardVariants(idx: number) {
  const dir = idx % 2 === 0 ? 1 : -1;
  return {
    hidden: {
      opacity: 0,
      scale: 0.6,
      y: 80,
      rotate: dir * (6 + (idx % 5) * 2),
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      y: -60,
      rotate: -dir * (8 + (idx % 4) * 3),
      filter: "blur(8px)",
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 1, 1] as const,
      },
    },
  };
}

export default function ProjectsGallery() {
  const [active, setActive] = useState<FilterCategory>("Website");
  const [selected, setSelected] = useState<Project | null>(null);
  const [animateFilterChange, setAnimateFilterChange] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected && !modal.current?.open) {
      modal.current?.showModal();
    }
  }, [selected]);

  // Keep the mobile controls fixed until the footer reaches the viewport, then
  // anchor them to the end of the projects section instead of covering it.
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsFooterVisible(entry.isIntersecting);
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(
    () => PROJECTS.filter((p) => p.cat === active),
    [active],
  );

  // Mobile: auto-cycle visible videos one at a time (paused when modal open)
  const carousel = useGalleryVideoController(Boolean(selected));

  return (
    <>
      {/* Sticky Navigation bar: Back button (Left) | 3 Filters (Middle / 2nd row on mobile) | Logo (Right) */}
      <header
        className="sticky top-0 z-40 -mx-5 px-5 py-3.5 md:-mx-8 md:px-8"
      >
        {/* Backdrop blur layer — fades out at the bottom, doesn't affect content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 backdrop-blur-xs"
          style={{
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          {/* Left: Back button (shows "< Back" on mobile, "< Back to Home" on larger screens) */}
          <Link
            href="/#work"
            className="order-1 group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3.5 text-sm font-semibold text-text shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-accent-primary hover:text-accent-primary sm:px-4 sm:gap-2"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="sm:hidden">
              <Roll>Back</Roll>
            </span>
            <span className="hidden sm:inline">
              <Roll>Back to Home</Roll>
            </span>
          </Link>

          {/* Right: Digi Bear logo matching Navbar design */}
          <Link
            href="/"
            className="order-2 sm:order-3 flex h-10 items-center gap-0 rounded-full border border-border bg-bg/20 px-3 font-display text-base font-bold tracking-tight backdrop-blur-xs transition-all duration-300 hover:border-accent-primary lg:gap-1 lg:text-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/digibear-logo.svg"
              alt=""
              className="h-7 w-auto"
              aria-hidden="true"
            />
            <Roll>
              DIGI <span className="text-gradient">BEAR</span>
            </Roll>
          </Link>

          {/* Middle: Three filters — hidden on mobile, shown in header on sm+ */}
          <div
            role="group"
            aria-label="Filter projects by category"
            className="order-3 sm:order-2 hidden sm:flex w-full sm:w-auto items-center justify-center gap-2 pt-1 sm:pt-0"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = active === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setAnimateFilterChange(true);
                    setActive(tab.id);
                  }}
                  className={`relative overflow-hidden inline-flex min-h-10 items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isSelected
                      ? "border-transparent text-bg"
                      : "border-border text-text-muted hover:border-accent-primary hover:text-text bg-surface/50 backdrop-blur-xs"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="filter-pill-desktop"
                      className="absolute inset-0 z-0 rounded-full brand-gradient shadow-lg"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 28,
                      }}
                    />
                  )}
                  <span className="relative z-1">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Floating bottom filter buttons — visible only on mobile, 3 separate buttons */}
      {/* Bottom backdrop blur layer — fades in from top to bottom */}
      <div
        aria-hidden="true"
        className={`pointer-events-none inset-x-0 bottom-0 z-40 h-24 backdrop-blur-xs sm:hidden ${
          isFooterVisible ? "absolute" : "fixed"
        }`}
        style={{
          maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
        }}
      />
      <div
        role="group"
        aria-label="Filter projects by category"
        className={`bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 sm:hidden ${
          isFooterVisible ? "absolute" : "fixed"
        }`}
      >
        {FILTER_TABS.map((tab, i) => {
          const isSelected = active === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: 0.3 + i * 0.08,
              }}
              whileTap={{ scale: 0.85 }}
              aria-pressed={isSelected}
              onClick={() => {
                setAnimateFilterChange(true);
                setActive(tab.id);
              }}
              className={`relative overflow-hidden whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm font-semibold shadow-xl backdrop-blur-md transition-colors duration-200 ${
                isSelected
                  ? "text-bg shadow-2xl"
                  : "border border-border/60 bg-surface/80 text-text-muted"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="filter-pill-mobile"
                  className="absolute inset-0 z-0 rounded-full brand-gradient shadow-2xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                />
              )}
              <span className="relative z-1">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Masonry Grid: 2 columns on mobile, 4 columns on PC screens for Video & AI Video, 3 columns for Website */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={animateFilterChange ? "hidden" : false}
          animate="visible"
          exit="exit"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.05,
              },
            },
            exit: {
              transition: {
                staggerChildren: 0.03,
                staggerDirection: -1,
              },
            },
          }}
          className={`mt-2 md:mt-4 pb-20 sm:pb-0 columns-2 gap-3 sm:gap-4 ${
            active === "Website" ? "lg:columns-3" : "lg:columns-4"
          }`}
        >
          {filtered.map((project, idx) => (
            <motion.div
              key={`${project.title}-${idx}`}
              variants={cardVariants(idx)}
              className="break-inside-avoid mb-3 sm:mb-5"
            >
              <ProjectCard
                project={project}
                onSelect={setSelected}
                isModalOpen={Boolean(selected)}
                carouselKey={`${project.title}-${idx}`}
                onRegister={carousel.register}
                onUnregister={carousel.unregister}
                onHoverStart={carousel.hoverStart}
                onHoverEnd={carousel.hoverEnd}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Video Popup Modal */}
      <dialog
        ref={modal}
        aria-label={selected ? `${selected.title} video` : "Video preview"}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/70"
      >
        {selected?.popupSrc && (
          <div className="relative">
            <video
              key={selected.popupSrc}
              src={selected.popupSrc}
              autoPlay
              controls
              playsInline
              className="max-h-[calc(100svh-2rem)] max-w-[calc(100vw-2rem)] rounded-xl bg-black object-contain"
            />
            <button
              type="button"
              aria-label="Close video"
              onClick={() => modal.current?.close()}
              className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-black/10 text-2xl leading-none text-white backdrop-blur-sm transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  isModalOpen: boolean;
  carouselKey: string;
  onRegister: (key: string, el: HTMLVideoElement) => void;
  onUnregister: (key: string, el: HTMLVideoElement) => void;
  onHoverStart: (key: string) => void;
  onHoverEnd: (key: string) => void;
}

function ProjectCard({
  project,
  onSelect,
  isModalOpen,
  carouselKey,
  onRegister,
  onUnregister,
  onHoverStart,
  onHoverEnd,
}: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Register the video for viewport loading and touch-device playback.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !project.video) return;
    onRegister(carouselKey, el);
    return () => onUnregister(carouselKey, el);
  }, [carouselKey, onRegister, onUnregister, project.video]);

  // Pause card video if the full-screen/dialog preview modal opens
  useEffect(() => {
    if (isModalOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isModalOpen]);

  const handleMouseEnter = () => {
    onHoverStart(carouselKey);
  };

  const handleMouseLeave = () => {
    onHoverEnd(carouselKey);
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      onMouseEnter={project.video ? handleMouseEnter : undefined}
      onMouseLeave={project.video ? handleMouseLeave : undefined}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:border-accent-primary hover:shadow-lg [corner-shape:squircle]"
    >
      {/* Media area with true, native aspect ratio */}
      <div
        style={{ aspectRatio: project.aspect }}
        className="relative w-full overflow-hidden bg-bg/50"
      >
        {project.video ? (
          <video
            ref={videoRef}
            data-carousel-key={carouselKey}
            data-src={project.src}
            data-poster-src={project.posterSrc}
            muted
            loop
            playsInline
            preload="metadata"
            className="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Plain img for website projects - no visit button overlay on hover */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.src}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {/* Card footer details */}
      <div className="flex flex-1 items-center justify-between p-2.5 sm:p-4">
        <div className="min-w-0 flex-1 pr-1.5 sm:pr-2">
          <h3 className="truncate font-display text-xs sm:text-base font-semibold text-text">
            {project.title}
          </h3>
          <p className="mt-0.5 truncate text-[11px] sm:text-xs text-text-muted">
            {project.video ? "Click to play preview" : "Click to view live site"}
          </p>
        </div>

        <div className="flex shrink-0 items-center text-text-muted transition-colors group-hover:text-accent-primary">
          {project.video ? (
            <div className="grid h-6 w-6 sm:h-8 sm:w-8 place-items-center rounded-full border border-border bg-bg/50">
              <Play className="ml-0.5 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 fill-current" />
            </div>
          ) : (
            <div className="grid h-6 w-6 sm:h-8 sm:w-8 place-items-center rounded-full border border-border bg-bg/50">
              <ExternalLink className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Click target overlay */}
      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open live site for ${project.title}`}
          className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-primary"
        />
      )}
      {project.popupSrc && (
        <button
          type="button"
          aria-label={`Play preview for ${project.title}`}
          onClick={() => onSelect(project)}
          className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-primary cursor-pointer"
        />
      )}
    </motion.div>
  );
}
