"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/dashboard",
    label: "Leaderboard",
    exact: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <rect x="2" y="10" width="4" height="8" rx="1" fill={active ? "var(--accent)" : "var(--text-3)"} />
        <rect x="8" y="6"  width="4" height="12" rx="1" fill={active ? "var(--accent)" : "var(--text-3)"} />
        <rect x="14" y="2" width="4" height="16" rx="1" fill={active ? "var(--accent)" : "var(--text-3)"} />
      </svg>
    ),
  },
  {
    href: "/dashboard/feed",
    label: "Feed",
    exact: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M2 5h16M2 10h10M2 15h12" stroke={active ? "var(--accent)" : "var(--text-3)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    exact: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="6" r="3.5" stroke={active ? "var(--accent)" : "var(--text-3)"} strokeWidth="1.75"/>
        <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={active ? "var(--accent)" : "var(--text-3)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function BottomNav({ onLogWorkout }: { onLogWorkout: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}
    >
      {/* Border top */}
      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <div className="flex items-center justify-around px-2 pt-2 pb-3">

          {/* Left two tabs */}
          {tabs.slice(0, 2).map((tab) => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href}
                className="flex flex-col items-center gap-1 min-w-[56px] py-1 rounded-lg transition-colors hover:bg-[var(--bg-hover)]">
                {tab.icon(active)}
                <span className="text-[10px] font-medium" style={{ color: active ? "var(--accent)" : "var(--text-3)" }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* FAB */}
          <button
            onClick={onLogWorkout}
            className="flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95 hover:brightness-110"
            style={{ background: "var(--accent)", boxShadow: "0 4px 16px rgba(74,222,128,0.3)" }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M10 4v12M4 10h12" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Right tab */}
          {tabs.slice(2).map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href}
                className="flex flex-col items-center gap-1 min-w-[56px] py-1 rounded-lg transition-colors hover:bg-[var(--bg-hover)]">
                {tab.icon(active)}
                <span className="text-[10px] font-medium" style={{ color: active ? "var(--accent)" : "var(--text-3)" }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

        </div>
      </div>
    </div>
  );
}
