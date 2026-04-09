"use client";

import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { LogWorkoutSheet } from "@/components/workout/LogWorkoutSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center relative bg-[var(--bg-base)]">
      <main className="flex-1 overflow-y-auto w-full max-w-[480px] pb-safe">
        {children}
      </main>
      <BottomNav onLogWorkout={() => setLogOpen(true)} />
      <LogWorkoutSheet open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
