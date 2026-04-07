"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Mode = "choose" | "create" | "join";

interface OnboardingGroupProps {
  userId: Id<"users">;
  onComplete: () => void;
}

const GROUP_EMOJIS = ["⚔️", "🏆", "💪", "🔥", "⚡", "🎯", "👊", "🦁"];

export function OnboardingGroup({ userId, onComplete }: OnboardingGroupProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("⚔️");
  const [stakes, setStakes] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const createGroup = useMutation(api.groups.create);
  const joinGroup = useMutation(api.groups.join);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true); setError("");
    try {
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
          <h1 className="text-2xl font-black text-[var(--text-1)] mb-2">Time to battle</h1>
          <p className="text-[var(--text-2)] text-sm">Create a group for your mates, or join one with an invite code.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { mode: "create" as Mode, icon: "➕", title: "Create a group", desc: "Set the stakes, invite your crew" },
            { mode: "join" as Mode, icon: "🔗", title: "Join a group", desc: "Enter the invite code" },
          ].map((item) => (
            <button key={item.mode} onClick={() => setMode(item.mode)}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col items-center gap-3 text-center transition-all active:scale-[0.97] hover:border-[var(--border-strong)]">
              <span className="text-3xl">{item.icon}</span>
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

        <h1 className="text-2xl font-black text-[var(--text-1)] mb-6">Create your group</h1>

        <div className="space-y-5 mb-8">
          <div>
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">Group emoji</p>
            <div className="flex gap-2 flex-wrap">
              {GROUP_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => setGroupEmoji(emoji)}
                  className={cn(
                    "text-2xl p-2 rounded-xl border transition-all",
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
            placeholder="e.g. Sector Three Gym Crew" maxLength={30} />

          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2 block">
              Weekly stakes <span className="normal-case font-normal">(optional)</span>
            </label>
            <input value={stakes} onChange={(e) => setStakes(e.target.value)}
              placeholder="e.g. Loser buys a round 🍺" maxLength={100}
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-colors"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
              onFocus={(e) => e.target.style.borderColor = "var(--border-strong)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            <p className="text-xs text-[var(--text-3)] mt-1.5">Displayed on the leaderboard</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="mt-auto">
          <Button onClick={handleCreate} loading={loading} disabled={!groupName.trim()} className="w-full" size="lg">
            Create Group →
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

      <h1 className="text-2xl font-black text-[var(--text-1)] mb-2">Join a group</h1>
      <p className="text-[var(--text-2)] text-sm mb-8">Ask your mate to share the invite code from their group settings.</p>

      <Input label="Invite code" value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        placeholder="e.g. ABC123" maxLength={6}
        className="tracking-widest text-center text-xl font-bold uppercase" />

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

      <div className="mt-auto pt-6">
        <Button onClick={handleJoin} loading={loading} disabled={inviteCode.trim().length !== 6} className="w-full" size="lg">
          Join Group →
        </Button>
      </div>
    </div>
  );
}
