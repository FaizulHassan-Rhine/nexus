"use client";

import { useEffect, useId, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/hooks/useApp";
import { NexusMark } from "@/components/brand/NexusLogo";

function SpinnerRings({ size = 88 }) {
  const goldId = `lux-gold-${useId().replace(/:/g, "")}`;

  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.15" className="text-sage/50 dark:text-nexus-400/25" />
      </svg>
      <svg viewBox="0 0 100 100" width={size} height={size} className="lux-spin absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3e6c4" />
            <stop offset="45%" stopColor="#d4bc7d" />
            <stop offset="100%" stopColor="#b8893d" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="68 220"
        />
        <circle cx="50" cy="4" r="1.85" fill="#d4bc7d" />
      </svg>
      <svg viewBox="0 0 100 100" width={size} height={size} className="lux-spin-rev absolute inset-0 h-full w-full">
        <circle
          cx="50"
          cy="50"
          r="38.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="3.5 6.5"
          className="text-nexus-400/50 dark:text-sky/35"
        />
      </svg>
    </div>
  );
}

export function LuxurySpinner({ className, size = 16 }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full border border-current opacity-20" />
      <span className="lux-spin absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-current border-r-current/40" />
    </span>
  );
}

export function LuxuryLoader({
  variant = "page",
  label = "Preparing your workspace",
  className,
}) {
  const isOverlay = variant === "overlay";
  const isFill = variant === "fill";
  const isCompact = variant === "compact";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "lux-loader relative flex flex-col items-center justify-center overflow-hidden",
        isOverlay && "h-full w-full",
        variant === "page" && "min-h-screen w-full",
        isFill && "min-h-[min(32rem,calc(100dvh-8rem))] w-full",
        isCompact && "min-h-[12rem] w-full py-10",
        !isCompact && "bg-cream dark:bg-nexus-950",
        className
      )}
    >
      {!isCompact ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(212,188,125,0.16),transparent_58%)] dark:bg-[radial-gradient(ellipse_at_50%_42%,rgba(184,137,61,0.18),transparent_56%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_88%,rgba(51,104,160,0.08),transparent_42%),radial-gradient(circle_at_86%_12%,rgba(200,223,219,0.28),transparent_36%)] dark:bg-[radial-gradient(circle_at_18%_88%,rgba(51,104,160,0.22),transparent_42%),radial-gradient(circle_at_86%_12%,rgba(102,163,191,0.12),transparent_36%)]" />
        </>
      ) : null}

      <div className="lux-rise relative flex flex-col items-center px-6">
        <div className="relative flex h-[5.75rem] w-[5.75rem] items-center justify-center">
          <div className="lux-glow absolute inset-[-18%] rounded-full bg-[#d4bc7d]/25 blur-2xl dark:bg-[#b8893d]/20" />
          <SpinnerRings size={92} />
          <div className="lux-breathe relative z-10 rounded-[1.05rem] shadow-[0_10px_30px_rgba(51,104,160,0.18)]">
            <NexusMark size={46} />
          </div>
        </div>

        <p className="mt-7 text-[0.7rem] font-semibold tracking-[0.34em] text-nexus-800 uppercase dark:text-cream">
          Nexus
        </p>
        <p className="mt-2 text-[11px] font-medium tracking-[0.18em] text-nexus-500/80 uppercase dark:text-nexus-300/70">
          {label}
        </p>

        <div className="relative mt-6 h-px w-36 overflow-hidden bg-nexus-200/80 dark:bg-nexus-700">
          <span className="lux-shimmer absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#d4bc7d] to-transparent" />
        </div>
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}

export function PageLoader() {
  return <LuxuryLoader variant="page" />;
}

export function SegmentLoader() {
  return <LuxuryLoader variant="fill" label="Loading" />;
}

export function HydrationOverlay() {
  const hydrated = useHydrated();
  const mountedAt = useRef(Date.now());
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!hydrated) return undefined;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(240, 640 - elapsed);
    const show = window.setTimeout(() => setExiting(true), wait);
    return () => window.clearTimeout(show);
  }, [hydrated]);

  useEffect(() => {
    if (!visible || exiting) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible, exiting]);

  useEffect(() => {
    if (!exiting) return undefined;
    const hide = window.setTimeout(() => setVisible(false), 520);
    return () => window.clearTimeout(hide);
  }, [exiting]);

  if (!visible) return null;

  return (
    <div
      className={cn("lux-overlay fixed inset-0 z-[90]", exiting && "lux-overlay-exit")}
      aria-hidden={exiting}
    >
      <LuxuryLoader variant="overlay" label="National Digital Matchmaking Hub" />
    </div>
  );
}

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const first = useRef(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setActive(true);
    const done = window.setTimeout(() => setActive(false), 720);
    return () => window.clearTimeout(done);
  }, [pathname, searchParams]);

  return (
    <div
      className={cn("lux-progress", active && "lux-progress-active")}
      aria-hidden
    >
      <span />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
