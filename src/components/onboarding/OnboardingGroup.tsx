"use client";

import { useState } from "react";
import { isDemoMode } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Mode = "choose" | "create" | "join";

interface OnboardingGroupProps {
  userId: any;
  onComplete: () => void;
}

const GROUP_EMOJIS = ["⚔️", "🏆", "💪", "🔥", "⚡", "🎯", "👊", "🦁"];

export function OnboardingGroup({ userId, onComplete }: OnboardingGroupProps) {
  if (isDemoMode()) return <DemoOnboardingGroup onComplete={onComplete} />;
  return <RealOnboardingGroup userId={userId} onComplete={onComplete} />;
}

function DemoOnboardingGroup({ onComplete }: { onComplete: () => void }) {
  return <OnboardingGroupInner onComplete={onComplete} />;
}

function RealOnboardingGroup({ userId, onComplete }: OnboardingGroupProps) {
  const { useMutation } = require("convex/react");
  const { api } = require("../../../convex/_generated/api");
  const createGroup = useMutation(api.groups.create);
  const joinGroup = useMutation(api.groups.join);

  return <OnboardingGroupInner userId={userId} onComplete={onComplete} createGroup={createGroup} joinGroup={joinGroup} />;
}

function OnboardingGroupInner({
  userId,
  onComplete,
  createGroup,
  joinGroup,
}: {
  userId?: any;
  onComplete: () => void;
  createGroup?: any;
  joinGroup?: any;
}) {
  const [mode, setMode] = useState<Mode>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("⚔️");
  const [stakes, setStakes] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true); setError("");
    try {
      if (!createGroup) {
        // Demo mode — just complete
        onComplete();
        return;
      }
      await createGroup({ name: groupName.trim(), emoji: groupEmoji, weeklyStakes: stakes.trim() || undefined, userId });
      onComplete();
    } catch (e: any) {
      setError(e.message || "Failed to create group");
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true); setError("");
    try {
      if (!joinGroup) {
        onComplete();
        return;
      }
      await joinGroup({ inviteCode: inviteCode.trim().toUpperCase(), userId });
      onComplete();
    } catch (e: any) {
      setError(e.message || "Invalid code");
    } finally { setLoading(false); }
  };

  if (mode === "choose") {
    return (
      <div className="flex flex-col flex-1">
        <div className="mb-8">
          <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">Time to battle</h1>
          <p className="text-[var(--text-2)] text-sm">Create a group for your mates, or join one with an invite code.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { m: "create" as Mode, title: "Create a group", desc: "Set the stakes, invite your crew" },
            { m: "join" as Mode, title: "Join a group", desc: "Enter the invite code" },
          ].map((item) => (
            <button key={item.m} onClick={() => setMode(item.m)}
              className="rounded-2xl p-5 flex flex-col gap-3 text-left transition-all active:scale-[0.97] hover:bg-[var(--bg-hover)]"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)" }}>
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{ color: "var(--accent)" }}>
                  {item.m === "create"
                    ? <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                    : <path d="M13 7l-6 6M13 13H7V7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  }
                </svg>
              </div>
              <div>
                <div className="font-semibold text-[var(--text-1)] text-sm">{item.title}</div>
                <div className="text-xs text-[var(--text-3)] mt-1">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <Button variant="ghost" onClick={onComplete} className="w-full">Skip for now</Button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="flex flex-col flex-1">
        <button onClick={() => setMode("choose")}
          className="flex items-center gap-1.5 text-[var(--text-3)] mb-6 text-sm hover:text-[var(--text-2)] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Back
        </button>

        <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-6">Create your group</h1>

        <div className="space-y-5 mb-8">
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">Group emoji</p>
            <div className="flex gap-2 flex-wrap">
              {GROUP_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => setGroupEmoji(emoji)}
                  className={cn(
                    "text-2xl p-2.5 rounded-xl border transition-all",
                    groupEmoji === emoji
                      ? "border-[var(--accent)] bg-[var(--accent-dim)]"
                      : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                  )}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input label="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Saturday Soldiers" maxLength={30} />

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-2 block">
              Weekly stakes <span className="normal-case font-normal">(optional)</span>
            </label>
            <input value={stakes} onChange={(e) => setStakes(e.target.value)}
              placeholder="e.g. Loser buys post-gym shakes" maxLength={100}
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
            <p className="text-xs text-[var(--text-3)] mt-1.5">Displayed on the leaderboard</p>
          </div>
        </div>

        {error && <p className="text-sm text-[#F87171] mb-4">{error}</p>}

        <div className="mt-auto">
          <Button onClick={handleCreate} loading={loading} disabled={!groupName.trim()} className="w-full" size="lg">
            Create Group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <button onClick={() => setMode("choose")}
        className="flex items-center gap-1.5 text-[var(--text-3)] mb-6 text-sm hover:text-[var(--text-2)] transition-colors">
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Back
      </button>

      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">Join a group</h1>
      <p className="text-[var(--text-2)] text-sm mb-8">Ask your mate to share the invite code from their group settings.</p>

      <Input label="Invite code" value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        placeholder="e.g. ABC123" maxLength={6}
        className="tracking-widest text-center text-xl font-bold uppercase" />

      {error && <p className="text-sm text-[#F87171] mt-3">{error}</p>}

      <div className="mt-auto pt-6">
        <Button onClick={handleJoin} loading={loading} disabled={inviteCode.trim().length !== 6} className="w-full" size="lg">
          Join Group
        </Button>
      </div>
    </div>
  );
}
