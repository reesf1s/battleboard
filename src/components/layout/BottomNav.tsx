"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  {
    href: "/dashboard",
    label: "Board",
    exact: true,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <rect x="3" y="12" width="4.5" height="8" rx="1.5" fill={a ? "var(--primary)" : "currentColor"} />
        <rect x="9.75" y="7" width="4.5" height="13" rx="1.5" fill={a ? "var(--primary)" : "currentColor"} />
        <rect x="16.5" y="3" width="4.5" height="17" rx="1.5" fill={a ? "var(--primary)" : "currentColor"} />
      </svg>
    ),
  },
  {
    href: "/dashboard/feed",
    label: "Feed",
    exact: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M4 6h16M4 12h12M4 18h14" stroke={a ? "var(--primary)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    exact: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" stroke={a ? "var(--primary)" : "currentColor"} strokeWidth="2" />
        <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={a ? "var(--primary)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function TabItem({ href, label, icon, active }: {
  href: string;
  label: string;
  icon: (a: boolean) => React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-1 min-w-[56px] py-2 rounded-2xl transition-all"
    >
      {/* Active dot indicator */}
      {active && (
        <span
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{
            background: "var(--primary)",
            boxShadow: "0 0 6px rgba(0,240,181,0.4)",
          }}
        />
      )}
      <span
        className="transition-colors"
        style={{ color: active ? "var(--primary)" : "var(--text-3)", opacity: active ? 1 : 0.6 }}
      >
        {icon(active)}
      </span>
      <span
        className="text-[10px] font-semibold tracking-wide transition-colors"
        style={{ color: active ? "var(--primary)" : "var(--text-3)", opacity: active ? 1 : 0.5 }}
      >
        {label}
      </span>
    </Link>
  );
}

export function BottomNav({ onLogWorkout }: { onLogWorkout: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="glass-nav">
        <div className="flex items-center justify-around px-3 h-[64px] max-w-[480px] mx-auto">
          {/* Left tabs */}
          {tabs.slice(0, 2).map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            return (
              <TabItem
                key={tab.href}
                href={tab.href}
                label={tab.label}
                icon={tab.icon}
                active={active}
              />
            );
          })}

          {/* Center FAB */}
          <button
            onClick={onLogWorkout}
            className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all active:scale-90 btn-gradient"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5.5 h-5.5">
              <path d="M10 4v12M4 10h12" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Right tab */}
          {tabs.slice(2).map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <TabItem
                key={tab.href}
                href={tab.href}
                label={tab.label}
                icon={tab.icon}
                active={active}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
