"use client";

import { useEffect, useRef, useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

/* ─── tiny SVG icons for iPhone status bar ─── */
function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
      <rect x="0" y="6" width="3" height="6" rx="1" fill="white" fillOpacity="0.35"/>
      <rect x="4.5" y="4" width="3" height="8" rx="1" fill="white" fillOpacity="0.6"/>
      <rect x="9" y="2" width="3" height="10" rx="1" fill="white" fillOpacity="0.85"/>
      <rect x="13.5" y="0" width="3" height="12" rx="1" fill="white"/>
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M8 10.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" fill="white"/>
      <path d="M4.1 7.4a5.5 5.5 0 0 1 7.8 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1 4.2a9.7 9.7 0 0 1 14 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.55"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35"/>
      <rect x="2" y="2" width="16" height="8" rx="2" fill="white"/>
      <path d="M23 4v4a2 2 0 0 0 0-4Z" fill="white" fillOpacity="0.4"/>
    </svg>
  );
}

/* ─── iPhone shell ─── */
function IPhoneShell({
  children,
  rotateDeg = 0,
  floatClass = "lp-phone-float",
  zIndex = 1,
}: {
  children: React.ReactNode;
  rotateDeg?: number;
  floatClass?: string;
  zIndex?: number;
}) {
  return (
    <div
      className={floatClass}
      style={{
        width: 270,
        height: 590,
        borderRadius: 52,
        background: "#000",
        position: "relative",
        transform: `rotate(${rotateDeg}deg)`,
        zIndex,
        boxShadow: [
          "0 60px 120px rgba(0,0,0,0.85)",
          "0 20px 40px rgba(0,0,0,0.5)",
          "0 0 0 1px rgba(255,255,255,0.10)",
          "inset 0 0 0 1.5px rgba(255,255,255,0.04)",
        ].join(", "),
        flexShrink: 0,
      }}
    >
      {/* Screen */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10, bottom: 10,
        borderRadius: 44, background: "#000", overflow: "hidden",
      }}>
        {/* Dynamic Island */}
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          width: 108, height: 33, background: "#000", borderRadius: 100, zIndex: 20,
        }} />

        {/* Status bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 56,
          display: "flex", alignItems: "flex-end", paddingBottom: 8,
          paddingLeft: 22, paddingRight: 18, zIndex: 10,
        }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>9:41</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* Content */}
        <div style={{
          position: "absolute", top: 56, left: 0, right: 0, bottom: 30, overflow: "hidden",
        }}>
          {children}
        </div>

        {/* Home indicator */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          width: 128, height: 5, background: "rgba(255,255,255,0.28)", borderRadius: 100,
        }} />
      </div>
    </div>
  );
}

/* ─── Phone 1: Leaderboard screen ─── */
function LeaderboardScreen() {
  const members = [
    { rank: 1, initial: "JK", name: "Jake",  score: 312, sessions: 5, bar: 100, color: "#FFD60A", trend: "+3" },
    { rank: 2, initial: "RE", name: "Rees",  score: 298, sessions: 4, bar: 95,  color: "#BEFF0A", trend: "—" },
    { rank: 3, initial: "TM", name: "Tom",   score: 201, sessions: 3, bar: 64,  color: "#0A84FF", trend: "+1" },
    { rank: 4, initial: "DV", name: "Dave",  score: 38,  sessions: 1, bar: 12,  color: "#636366", trend: "-1" },
  ];
  const rankLabel = (r: number) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : "4";

  return (
    <div style={{ background: "#000", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>Gym Lads ⚔️</div>
            <div style={{ color: "#8E8E93", fontSize: 11, marginTop: 1 }}>Week 15 · Apr 7–13</div>
          </div>
          <div style={{
            background: "rgba(190,255,10,0.15)", borderRadius: 20, padding: "4px 10px",
            fontSize: 11, fontWeight: 600, color: "#BEFF0A",
          }}>Live</div>
        </div>
      </div>

      {/* Stakes */}
      <div style={{
        margin: "8px 12px", padding: "7px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11, color: "#8E8E93", textAlign: "center",
      }}>
        ⚔️ Loser buys a round 🍺
      </div>

      {/* Rows */}
      <div style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {members.map((m) => (
          <div key={m.name} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 10px", borderRadius: 12,
            background: m.rank === 1 ? "rgba(255,214,10,0.07)" : m.rank === 2 ? "rgba(190,255,10,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${m.rank === 1 ? "rgba(255,214,10,0.18)" : m.rank === 2 ? "rgba(190,255,10,0.15)" : "rgba(255,255,255,0.05)"}`,
            opacity: m.rank === 4 ? 0.6 : 1,
          }}>
            <span style={{ fontSize: m.rank <= 3 ? 16 : 12, width: 20, textAlign: "center", color: m.rank > 3 ? "#636366" : undefined }}>
              {rankLabel(m.rank)}
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: `${m.color}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: m.color, flexShrink: 0,
            }}>
              {m.initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>{m.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ width: `${m.bar}%`, height: "100%", borderRadius: 2, background: m.color }} />
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: m.color, letterSpacing: "-0.02em" }}>{m.score}</div>
              <div style={{ fontSize: 10, color: "#636366", marginTop: 1 }}>{m.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px 2px",
        display: "flex", justifyContent: "space-around", background: "rgba(18,18,18,0.95)",
      }}>
        {[
          { label: "Board", active: true, icon: "▦" },
          { label: "Feed",  active: false, icon: "◈" },
          { label: "+",     active: false, icon: "⊕", fab: true },
          { label: "Streaks", active: false, icon: "◉" },
          { label: "Me",    active: false, icon: "◎" },
        ].map((t) => (
          <div key={t.label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            color: t.active ? "#BEFF0A" : "#636366", fontSize: 18,
            padding: "4px 6px",
          }}>
            <span>{t.icon}</span>
            {!t.fab && <span style={{ fontSize: 9, fontWeight: 500 }}>{t.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Phone 2: Score reveal screen ─── */
function ScoreRevealScreen() {
  const bars = [
    { label: "Intensity",   value: 8.0, pct: 80, delay: 100 },
    { label: "Duration",    value: 6.5, pct: 65, delay: 200 },
    { label: "Pers. effort",value: 9.0, pct: 90, delay: 300 },
  ];

  return (
    <div style={{ background: "#000", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Back nav */}
      <div style={{ padding: "10px 16px 4px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#0A84FF", fontSize: 16 }}>‹</span>
        <span style={{ color: "#0A84FF", fontSize: 14, fontWeight: 500 }}>Feed</span>
        <div style={{ marginLeft: "auto", color: "#8E8E93", fontSize: 13 }}>Today · 9:22am</div>
      </div>

      {/* Title */}
      <div style={{ padding: "6px 16px 12px" }}>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>Boxing Session</div>
        <div style={{ color: "#8E8E93", fontSize: 12, marginTop: 2 }}>45 min · avg HR 163 · 8/10 RPE</div>
      </div>

      {/* Score */}
      <div style={{
        margin: "0 16px 14px", padding: "16px", borderRadius: 16,
        background: "rgba(190,255,10,0.08)", border: "1px solid rgba(190,255,10,0.2)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{
          fontSize: 56, fontWeight: 900, color: "#BEFF0A",
          lineHeight: 1, letterSpacing: "-0.04em",
        }}>85</div>
        <div style={{
          marginTop: 4, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
          color: "#BEFF0A", textTransform: "uppercase", opacity: 0.8,
        }}>Excellent</div>
      </div>

      {/* Breakdown */}
      <div style={{ margin: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {bars.map((b) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#8E8E93", fontSize: 11 }}>{b.label}</span>
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{b.value}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
              <div style={{
                width: `${b.pct}%`, height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg, rgba(190,255,10,0.6), #BEFF0A)",
              }} />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
          <span style={{ color: "#8E8E93", fontSize: 11 }}>Consistency bonus</span>
          <span style={{ color: "#BEFF0A", fontSize: 11, fontWeight: 700 }}>+1.0</span>
        </div>
      </div>

      {/* AI reasoning */}
      <div style={{
        margin: "0 16px 12px", padding: "10px 12px", borderRadius: 12,
        borderLeft: "2.5px solid rgba(190,255,10,0.5)",
        background: "rgba(255,255,255,0.03)",
      }}>
        <div style={{ color: "#fff", fontSize: 11, lineHeight: 1.55, opacity: 0.8 }}>
          "Stayed in zone 4 for 32 of 45 minutes — serious discipline. The late session got a small bump. Top tier effort this week."
        </div>
      </div>

      {/* Reactions */}
      <div style={{
        margin: "0 16px", display: "flex", gap: 8,
      }}>
        {[{ e: "🔥", n: 3, active: true }, { e: "💪", n: 5, active: false }, { e: "😂", n: 0, active: false }].map((r) => (
          <div key={r.e} style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "5px 10px", borderRadius: 100,
            background: r.active ? "rgba(190,255,10,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${r.active ? "rgba(190,255,10,0.3)" : "rgba(255,255,255,0.08)"}`,
            fontSize: 12,
          }}>
            <span>{r.e}</span>
            <span style={{ color: r.active ? "#BEFF0A" : "#8E8E93", fontWeight: 600 }}>{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Score breakdown card (editorial section) ─── */
function ScoreCard({ inView }: { inView: boolean }) {
  const bars = [
    { label: "Intensity",     val: 8.0, pct: 80,  delay: "0ms" },
    { label: "Duration",      val: 6.5, pct: 65,  delay: "100ms" },
    { label: "Personal effort",val: 9.0, pct: 90, delay: "200ms" },
    { label: "Consistency",   val: 1.0, pct: 50,  delay: "300ms" },
  ];

  return (
    <div style={{
      background: "#0E0E12", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, padding: "28px 28px 24px", maxWidth: 380,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Boxing Session · Today · 45 min
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: "#BEFF0A", lineHeight: 1, letterSpacing: "-0.04em" }}>85</span>
          <div>
            <div style={{ color: "#BEFF0A", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Excellent</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>avg HR 163 · 8/10 RPE</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 18 }} />

      {/* Breakdown bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {bars.map((b) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{b.label}</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>
                {b.label === "Consistency" ? `+${b.val}` : b.val}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
              <div style={{
                width: inView ? `${b.pct}%` : "0%",
                height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg, rgba(190,255,10,0.5), #BEFF0A)",
                transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${b.delay}`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI reasoning */}
      <div style={{
        padding: "12px 14px", borderRadius: 12, borderLeft: "3px solid rgba(190,255,10,0.4)",
        background: "rgba(190,255,10,0.04)",
      }}>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6 }}>
          "Stayed in zone 4 for 32 of 45 minutes — serious commitment. The late session got a small consistency bump. Top tier effort this week."
        </div>
      </div>
    </div>
  );
}

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

/* ─── Check icon ─── */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5 6.5-7" stroke="#BEFF0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Arrow icon ─── */
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════ */
export function LandingPage() {
  // Scroll reveal refs
  const hero = useReveal();
  const scoring = useReveal();
  const howitworks = useReveal();
  const features = useReveal();
  const cta = useReveal();

  return (
    <div className="lp">
      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        background: "rgba(8,8,10,0.75)",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", height: 60,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: "#BEFF0A",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#000", fontWeight: 900, fontSize: 14, fontFamily: "var(--font-sans-lp, system-ui)" }}>B</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em", fontFamily: "var(--font-sans-lp, system-ui)" }}>
              Battleboard
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginLeft: "auto" }}>
            <a href="#how" style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
              className="hidden md:block">
              How it works
            </a>
            <SignInButton mode="modal">
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 500 }}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{
                background: "#fff", color: "#000", border: "none", cursor: "pointer",
                padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                letterSpacing: "-0.01em", transition: "background 0.15s",
                fontFamily: "var(--font-sans-lp, system-ui)",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#BEFF0A")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
              >
                Start free trial
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100svh", display: "flex", alignItems: "center",
        padding: "100px 24px 60px", maxWidth: 1160, margin: "0 auto",
        gap: 48,
      }}>
        {/* Left: text */}
        <div ref={hero.ref} style={{ flex: "1 1 480px", minWidth: 0 }}>
          {/* Badge */}
          <div className={`lp-reveal ${hero.visible ? "visible" : ""}`} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            border: "1px solid rgba(190,255,10,0.2)", background: "rgba(190,255,10,0.06)",
            borderRadius: 100, padding: "5px 12px", marginBottom: 28,
          }}>
            <span className="lp-badge-dot" style={{ width: 6, height: 6, borderRadius: 3, background: "#BEFF0A", display: "block" }} />
            <span style={{ color: "#BEFF0A", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
              AI-powered fitness competition
            </span>
          </div>

          {/* H1 */}
          <h1
            className={`lp-display lp-reveal lp-delay-1 ${hero.visible ? "visible" : ""}`}
            style={{
              fontSize: "clamp(44px, 7vw, 76px)",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.95)",
              marginBottom: 24,
            }}
          >
            Compete with<br />
            your mates.<br />
            <em style={{ color: "#BEFF0A", fontStyle: "italic" }}>Any workout counts.</em>
          </h1>

          {/* Sub */}
          <p
            className={`lp-reveal lp-delay-2 ${hero.visible ? "visible" : ""}`}
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.65,
              maxWidth: 440,
              marginBottom: 36,
            }}
          >
            AI scores every workout fairly — whether you lift, run, box or do yoga.
            Weekly leaderboards. Real stakes. Get off the sofa.
          </p>

          {/* CTAs */}
          <div className={`lp-reveal lp-delay-3 ${hero.visible ? "visible" : ""}`}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <SignUpButton mode="modal">
              <button
                style={{
                  background: "#BEFF0A", color: "#000", border: "none", cursor: "pointer",
                  padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 800,
                  letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8,
                  fontFamily: "var(--font-sans-lp, system-ui)",
                  transition: "transform 0.15s, opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Start free trial
                <span style={{ opacity: 0.7 }}>→</span>
              </button>
            </SignUpButton>
            <a
              href="#how"
              style={{
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
                padding: "14px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)",
                letterSpacing: "-0.01em",
              }}
            >
              How it works
            </a>
          </div>

          <div className={`lp-reveal lp-delay-4 ${hero.visible ? "visible" : ""}`}
            style={{ color: "rgba(255,255,255,0.22)", fontSize: 13 }}>
            7-day free trial · £3.99/month · Cancel anytime
          </div>
        </div>

        {/* Right: phones */}
        <div style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          height: 640,
          width: 560,
          flexShrink: 0,
        }}
          className="hidden lg:flex"
        >
          {/* Ambient glow */}
          <div className="lp-glow-lime" style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(190,255,10,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Phone 1 (leaderboard) — left, back */}
          <div style={{ position: "absolute", left: 10, top: 20 }}>
            <IPhoneShell rotateDeg={-3} floatClass="lp-phone-float-slow" zIndex={1}>
              <LeaderboardScreen />
            </IPhoneShell>
          </div>

          {/* Phone 2 (score reveal) — right, front */}
          <div style={{ position: "absolute", right: 0, top: 40 }}>
            <IPhoneShell rotateDeg={2} floatClass="lp-phone-float" zIndex={2}>
              <ScoreRevealScreen />
            </IPhoneShell>
          </div>
        </div>

        {/* Mobile phone (single, centered) */}
        <div className="lg:hidden" style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 20 }}>
          <IPhoneShell rotateDeg={0} floatClass="lp-phone-float" zIndex={1}>
            <LeaderboardScreen />
          </IPhoneShell>
        </div>
      </section>

      {/* ── LOGO STRIP ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "18px 24px",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 40, flexWrap: "wrap",
        }}>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Syncs with
          </span>
          {["Strava", "Apple Health", "Garmin"].map((name) => (
            <span key={name} style={{
              color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 700,
              letterSpacing: "-0.01em",
            }}>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── AI SCORING ── */}
      <section style={{
        maxWidth: 1160, margin: "0 auto", padding: "120px 24px",
        display: "flex", gap: 80, alignItems: "flex-start",
      }}>
        {/* Left: copy */}
        <div ref={scoring.ref} style={{ flex: "1 1 400px", minWidth: 0 }}>
          <div
            className={`lp-reveal ${scoring.visible ? "visible" : ""}`}
            style={{
              fontSize: "clamp(72px, 10vw, 120px)", fontWeight: 900, lineHeight: 1,
              color: "rgba(255,255,255,0.04)", letterSpacing: "-0.04em",
              marginBottom: -20, userSelect: "none",
              fontFamily: "var(--font-display, Georgia, serif)",
            }}
          >01</div>

          <h2
            className={`lp-display lp-reveal lp-delay-1 ${scoring.visible ? "visible" : ""}`}
            style={{
              fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900,
              lineHeight: 1.05, letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.92)", marginBottom: 20,
            }}
          >
            Fair scoring.<br />Any sport.
          </h2>

          <p className={`lp-reveal lp-delay-2 ${scoring.visible ? "visible" : ""}`}
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
            Our AI evaluates actual effort — heart rate, duration, intensity, and your personal baseline.
            A hard yoga session will outscore an easy run. Every time.
          </p>

          <ul className={`lp-reveal lp-delay-3 ${scoring.visible ? "visible" : ""}`}
            style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Heart rate zones weighted by intensity",
              "Duration with diminishing returns",
              "Calibrated to your personal fitness level",
              "Personal bests earn a score bonus",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckIcon />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: score card */}
        <div className={`lp-reveal lp-delay-2 ${scoring.visible ? "visible" : ""}`}
          style={{ flex: "0 0 auto", flexShrink: 0 }}>
          <ScoreCard inView={scoring.visible} />
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="lp-display" style={{
            fontSize: 80, lineHeight: 0.8, color: "rgba(255,255,255,0.06)",
            marginBottom: 16, letterSpacing: "-0.05em",
          }}>"</div>
          <blockquote className="lp-display" style={{
            fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 400,
            color: "rgba(255,255,255,0.78)", lineHeight: 1.4,
            letterSpacing: "-0.02em", fontStyle: "italic", margin: "0 0 24px",
          }}>
            First time I've actually wanted to get to the gym on a Sunday.
            The leaderboard does things to you.
          </blockquote>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, letterSpacing: "0.04em" }}>
            — Jake T., Gym Lads
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" ref={howitworks.ref} style={{
        maxWidth: 1160, margin: "0 auto", padding: "120px 24px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80,
        alignItems: "start",
      }}>
        {/* Left: header */}
        <div>
          <div className={`lp-reveal ${howitworks.visible ? "visible" : ""}`}
            style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
            How it works
          </div>
          <h2
            className={`lp-display lp-reveal lp-delay-1 ${howitworks.visible ? "visible" : ""}`}
            style={{
              fontSize: "clamp(36px, 4.5vw, 56px)", fontWeight: 900,
              lineHeight: 1.0, letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.92)", marginBottom: 20,
            }}
          >
            Up and running<br />in three minutes.
          </h2>
          <p className={`lp-reveal lp-delay-2 ${howitworks.visible ? "visible" : ""}`}
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1.65, maxWidth: 380 }}>
            No complicated setup. Connect Strava, create a group, share the link. Your mates will be on the leaderboard before the weekend.
          </p>
        </div>

        {/* Right: timeline steps */}
        <div className={`lp-reveal lp-delay-2 ${howitworks.visible ? "visible" : ""}`}
          style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: 19, top: 24, bottom: 24, width: 1,
            background: "linear-gradient(to bottom, rgba(190,255,10,0.4), rgba(255,255,255,0.05))",
          }} />

          {[
            {
              n: "01",
              title: "Log your workout",
              desc: "Manual entry takes 30 seconds. Or connect Strava and it happens automatically whenever you finish.",
            },
            {
              n: "02",
              title: "AI evaluates your effort",
              desc: "GPT-4o-mini analyses your data against your history. No sport bias. Just honest effort.",
            },
            {
              n: "03",
              title: "Climb the leaderboard",
              desc: "Real-time rankings update as your mates log sessions. Weekly stakes keep it interesting.",
            },
          ].map((step, i) => (
            <div key={step.n} style={{ display: "flex", gap: 24, marginBottom: i < 2 ? 40 : 0 }}>
              {/* Node */}
              <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: i === 0 ? "#BEFF0A" : "#0E0E12",
                  border: `1px solid ${i === 0 ? "#BEFF0A" : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: i === 0 ? "#000" : "rgba(255,255,255,0.3)",
                  letterSpacing: "0.02em",
                }}>
                  {step.n}
                </div>
              </div>
              {/* Content */}
              <div style={{ paddingTop: 8 }}>
                <div style={{
                  fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.88)",
                  letterSpacing: "-0.02em", marginBottom: 6,
                }}>{step.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={features.ref} style={{
        maxWidth: 1160, margin: "0 auto", padding: "0 24px 120px",
      }}>
        <div
          className={`lp-reveal ${features.visible ? "visible" : ""}`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {[
            {
              title: "AI effort scoring",
              desc: "Cross-sport fairness. Running, lifting, boxing, yoga — all scored on the same scale.",
            },
            {
              title: "Live leaderboards",
              desc: "Scores update in real-time via Convex subscriptions. Refresh is never needed.",
            },
            {
              title: "Strava sync",
              desc: "Automatically imports and scores activities the moment you finish. No manual entry required.",
            },
            {
              title: "Weekly narrative",
              desc: "Every Sunday, an AI-written match report of the week's competition. Banter included.",
            },
            {
              title: "Habit streaks",
              desc: "12-week heatmap shows your consistency. Streaks are tracked across all activity types.",
            },
            {
              title: "Custom stakes",
              desc: "Set the weekly challenge — loser buys dinner, winner picks the film. Your rules.",
            },
          ].map((f, i) => (
            <div key={f.title} style={{
              background: "#0E0E12",
              padding: "28px 28px 24px",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowIcon />
                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em" }}>
                  {f.title}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section ref={cta.ref} style={{
        padding: "80px 24px 100px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow */}
        <div className="lp-glow-lime" style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%) translateY(-40%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(190,255,10,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <h2
            className={`lp-display lp-reveal ${cta.visible ? "visible" : ""}`}
            style={{
              fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 900,
              lineHeight: 1.0, letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.92)", marginBottom: 16,
            }}
          >
            Your mates are<br />already training.
          </h2>

          <p className={`lp-reveal lp-delay-1 ${cta.visible ? "visible" : ""}`}
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, lineHeight: 1.6, marginBottom: 36 }}>
            Start today. First 7 days free.
          </p>

          <div className={`lp-reveal lp-delay-2 ${cta.visible ? "visible" : ""}`}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <SignUpButton mode="modal">
              <button
                style={{
                  background: "#BEFF0A", color: "#000", border: "none", cursor: "pointer",
                  padding: "16px 36px", borderRadius: 10, fontSize: 16, fontWeight: 800,
                  letterSpacing: "-0.01em", fontFamily: "var(--font-sans-lp, system-ui)",
                  transition: "transform 0.15s, opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Start free trial →
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button style={{
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
                padding: "16px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                letterSpacing: "-0.01em", fontFamily: "var(--font-sans-lp, system-ui)",
              }}>
                Sign in
              </button>
            </SignInButton>
          </div>

          <p className={`lp-reveal lp-delay-3 ${cta.visible ? "visible" : ""}`}
            style={{ color: "rgba(255,255,255,0.18)", fontSize: 13, marginTop: 20 }}>
            £3.99/month after trial · Cancel anytime · No long-term commitment
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
        maxWidth: 1160, margin: "0 auto",
      }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
          © 2026 Battleboard
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {[["Privacy", "/privacy"], ["Terms", "/terms"]].map(([label, href]) => (
            <a key={label} href={href} style={{
              color: "rgba(255,255,255,0.22)", fontSize: 13, textDecoration: "none",
            }}>
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
