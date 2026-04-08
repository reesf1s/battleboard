"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/dashboard",
    label: "Board",
    exact: true,
    icon: (a: boolean) => (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px]">
        <rect x="3" y="11" width="4" height="8" rx="1.5" fill={a ? "var(--accent)" : "var(--text-3)"} opacity={a ? 1 : 0.6} />
        <rect x="9" y="7"  width="4" height="12" rx="1.5" fill={a ? "var(--accent)" : "var(--text-3)"} opacity={a ? 1 : 0.6} />
        <rect x="15" y="3" width="4" height="16" rx="1.5" fill={a ? "var(--accent)" : "var(--text-3)"} opacity={a ? 1 : 0.6} />
      </svg>
    ),
  },
  {
    href: "/dashboard/feed",
    label: "Feed",
    exact: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px]">
        <path d="M3 6h16M3 11h11M3 16h13" stroke={a ? "var(--accent)" : "var(--text-3)"} strokeWidth="1.75" strokeLinecap="round" opacity={a ? 1 : 0.6} />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    exact: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px]">
        <circle cx="11" cy="7" r="3.5" stroke={a ? "var(--accent)" : "var(--text-3)"} strokeWidth="1.75" opacity={a ? 1 : 0.6} />
        <path d="M4 19c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={a ? "var(--accent)" : "var(--text-3)"} strokeWidth="1.75" strokeLinecap="round" opacity={a ? 1 : 0.6} />
      </svg>
    ),
  },
];

export function BottomNav({ onLogWorkout }: { onLogWorkout: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="backdrop-blur-xl"
        style={{
          background: "rgba(13,15,20,0.88)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-around px-2 h-[60px]">
          {/* Left tabs */}
          {tabs.slice(0, 2).map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-0.5 min-w-[52px] py-1.5 rounded-lg transition-colors"
              >
                {tab.icon(active)}
                <span
                  className="text-[10px] font-medium tracking-wide"
                  style={{ color: active ? "var(--accent)" : "var(--text-3)", opacity: active ? 1 : 0.6 }}
                >
                  {tab.label}
                </span>
                {active && (
                  <div
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            );
          })}

          {/* FAB */}
          <button
            onClick={onLogWorkout}
            className="flex items-center justify-center w-11 h-11 rounded-full transition-all active:scale-90"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 20px rgba(74,222,128,0.25), 0 0 0 3px rgba(74,222,128,0.08)",
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M10 4v12M4 10h12" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Right tab */}
          {tabs.slice(2).map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-0.5 min-w-[52px] py-1.5 rounded-lg transition-colors"
              >
                {tab.icon(active)}
                <span
                  className="text-[10px] font-medium tracking-wide"
                  style={{ color: active ? "var(--accent)" : "var(--text-3)", opacity: active ? 1 : 0.6 }}
                >
                  {tab.label}
                </span>
                {active && (
                  <div
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
