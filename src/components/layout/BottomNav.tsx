"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  {
    href: "/dashboard",
    label: "Board",
    exact: true,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <rect x="3" y="12" width="4.5" height="8" rx="1.5" fill={a ? "var(--accent)" : "currentColor"} opacity={a ? 1 : 0.3} />
        <rect x="9.75" y="7" width="4.5" height="13" rx="1.5" fill={a ? "var(--accent)" : "currentColor"} opacity={a ? 1 : 0.3} />
        <rect x="16.5" y="3" width="4.5" height="17" rx="1.5" fill={a ? "var(--accent)" : "currentColor"} opacity={a ? 1 : 0.3} />
      </svg>
    ),
  },
  {
    href: "/dashboard/feed",
    label: "Feed",
    exact: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <path d="M4 6h16M4 12h12M4 18h14" stroke={a ? "var(--accent)" : "currentColor"} strokeWidth="2" strokeLinecap="round" opacity={a ? 1 : 0.3} />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    exact: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <circle cx="12" cy="8" r="4" stroke={a ? "var(--accent)" : "currentColor"} strokeWidth="2" opacity={a ? 1 : 0.3} />
        <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={a ? "var(--accent)" : "currentColor"} strokeWidth="2" strokeLinecap="round" opacity={a ? 1 : 0.3} />
      </svg>
    ),
  },
];

export function BottomNav({ onLogWorkout }: { onLogWorkout: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="glass"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center justify-around px-3 h-[64px] max-w-lg mx-auto">
          {/* Left tabs */}
          {tabs.slice(0, 2).map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-1 min-w-[54px] py-2 rounded-xl transition-colors"
              >
                {tab.icon(active)}
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: active ? "var(--accent)" : "var(--text-3)" }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* FAB */}
          <button
            onClick={onLogWorkout}
            className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 btn-gradient"
            style={{
              boxShadow: "0 4px 24px rgba(255,107,44,0.3), 0 0 0 3px rgba(255,107,44,0.06)",
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M10 4v12M4 10h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Right tab */}
          {tabs.slice(2).map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-1 min-w-[54px] py-2 rounded-xl transition-colors"
              >
                {tab.icon(active)}
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: active ? "var(--accent)" : "var(--text-3)" }}
                >
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
