"use client";

import { isDemoMode } from "@/lib/demo";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const demo = isDemoMode();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 w-full" style={{ background: "var(--bg-base)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-gradient">
              <span className="text-[#09090B] font-black text-lg">B</span>
            </div>
            <span className="app-display text-xl font-bold text-[var(--text-1)]">Battleboard</span>
          </div>
          <p className="text-[var(--text-2)] text-sm">7 days free. No card needed.</p>
        </div>
        {demo ? (
          <div className="text-center">
            <p className="text-sm text-[var(--text-2)] mb-4">Sign-up requires Clerk to be configured.</p>
            <a href="/dashboard" className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              View demo instead
            </a>
          </div>
        ) : (
          <SignUp />
        )}
      </div>
    </div>
  );
}
