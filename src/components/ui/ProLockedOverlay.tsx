"use client";

import Link from "next/link";

interface ProLockedOverlayProps {
  featureName: string;
  description?: string;
  children: React.ReactNode;
  compact?: boolean;
}

export function ProLockedOverlay({
  featureName,
  description,
  children,
  compact = false,
}: ProLockedOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred preview of the content */}
      <div
        className="pointer-events-none select-none blur-[6px] opacity-60"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-card/70 backdrop-blur-[2px] rounded-xl">
        <div
          className={
            compact
              ? "flex flex-col items-center gap-2 px-4 py-3 text-center"
              : "flex flex-col items-center gap-3 px-6 py-5 text-center max-w-xs"
          }
        >
          {/* Lock icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              compact
                ? "size-5 text-primary"
                : "size-7 text-primary"
            }
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <div className="space-y-1">
            <p
              className={
                compact
                  ? "font-heading text-xs font-semibold text-foreground"
                  : "font-heading text-sm font-semibold text-foreground"
              }
            >
              {featureName}
            </p>
            {description && (
              <p
                className={
                  compact
                    ? "text-[10px] leading-tight text-muted-foreground"
                    : "text-xs leading-relaxed text-muted-foreground"
                }
              >
                {description}
              </p>
            )}
          </div>

          <Link
            href="/subscription"
            className={
              compact
                ? "inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                : "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            }
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
