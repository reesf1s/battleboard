"use client";

import { isDemoMode } from "@/lib/demo";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
          <p className="text-[var(--text-2)] text-sm">Welcome back. Let&apos;s get competing.</p>
        </div>
        {demo ? (
          <div className="text-center">
            <p className="text-sm text-[var(--text-2)] mb-4">Sign-in requires Clerk to be configured.</p>
            <a href="/dashboard" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
              View demo instead
            </a>
          </div>
        ) : (
          <SignIn />
        )}
      </div>
    </div>
  );
}
