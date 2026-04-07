"use client";

import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { LogWorkoutSheet } from "@/components/workout/LogWorkoutSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative">
      <main className="flex-1 pb-safe overflow-y-auto">
        {children}
      </main>
      <BottomNav onLogWorkout={() => setLogOpen(true)} />
      <LogWorkoutSheet open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
