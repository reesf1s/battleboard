"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/dashboard",
    label: "Leaderboard",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path
          d="M12 2L9 9H2L7.5 13.5L5.5 21L12 17L18.5 21L16.5 13.5L22 9H15L12 2Z"
          stroke={active ? "var(--accent-primary)" : "var(--text-tertiary)"}
          strokeWidth="1.5"
          fill={active ? "var(--accent-primary)" : "none"}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/feed",
    label: "Feed",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke={active ? "var(--accent-primary)" : "var(--text-tertiary)"}
          strokeWidth="1.5"
          fill={active ? "var(--accent-primary)20" : "none"}
        />
        <path
          d="M7 9h10M7 13h7"
          stroke={active ? "var(--accent-primary)" : "var(--text-tertiary)"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke={active ? "var(--accent-primary)" : "var(--text-tertiary)"}
          strokeWidth="1.5"
          fill={active ? "var(--accent-primary)20" : "none"}
        />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={active ? "var(--accent-primary)" : "var(--text-tertiary)"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

interface BottomNavProps {
  onLogWorkout: () => void;
}

export function BottomNav({ onLogWorkout }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background:
          "linear-gradient(to top, var(--bg-primary) 60%, transparent)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-end justify-around px-4 pt-2 pb-4 max-w-md mx-auto relative">
        {tabs.slice(0, 2).map((tab) => {
          const active =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium"
                style={{
                  color: active ? "var(--accent-primary)" : "var(--text-tertiary)",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* FAB */}
        <button
          onClick={onLogWorkout}
          className="relative -top-4 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform active:scale-90"
          style={{
            background: "var(--accent-primary)",
            boxShadow: "0 4px 20px var(--accent-primary-glow)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
            <path
              d="M12 5v14M5 12h14"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {tabs.slice(2).map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium"
                style={{
                  color: active ? "var(--accent-primary)" : "var(--text-tertiary)",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
