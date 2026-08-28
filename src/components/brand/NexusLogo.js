import Link from "next/link";
import { cn } from "@/lib/cn";

export function NexusMark({ className, size = 32 }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="nexus-mark-bg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3368A0" />
          <stop offset="100%" stopColor="#66A3BF" />
        </linearGradient>
        <linearGradient id="nexus-mark-shine" x1="8" y1="6" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8DFDB" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C8DFDB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#nexus-mark-bg)" />
      <rect width="40" height="40" rx="11" fill="url(#nexus-mark-shine)" />
      <circle cx="20" cy="20" r="3.25" fill="#F2EFE7" />
      <circle cx="11.5" cy="13" r="2.35" fill="#C8DFDB" />
      <circle cx="28.5" cy="13" r="2.35" fill="#C8DFDB" />
      <circle cx="11.5" cy="27" r="2.35" fill="#C8DFDB" />
      <circle cx="28.5" cy="27" r="2.35" fill="#C8DFDB" />
      <g stroke="#F2EFE7" strokeWidth="1.6" strokeLinecap="round" opacity="0.92">
        <line x1="20" y1="20" x2="11.5" y2="13" />
        <line x1="20" y1="20" x2="28.5" y2="13" />
        <line x1="20" y1="20" x2="11.5" y2="27" />
        <line x1="20" y1="20" x2="28.5" y2="27" />
      </g>
      <path
        d="M13.5 27V13.5L20 20.2L26.5 13.5V27"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NexusLogo({ className, href = "/", showWordmark = true, markSize = 32 }) {
  const content = (
    <>
      <NexusMark size={markSize} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[1.05rem] font-bold tracking-tight text-nexus-800 dark:text-nexus-50">Nexus</span>
          <span className="mt-0.5 hidden text-[0.625rem] font-semibold tracking-[0.14em] text-nexus-500 uppercase sm:block dark:text-nexus-300">
            Matchmaking Hub
          </span>
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <span className={cn("inline-flex items-center gap-2.5", className)}>{content}</span>;
  }

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}>
      {content}
    </Link>
  );
}
