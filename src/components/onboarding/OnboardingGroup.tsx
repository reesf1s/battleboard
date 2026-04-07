"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Mode = "choose" | "create" | "join";

interface OnboardingGroupProps {
  userId: Id<"users">;
  onComplete: () => void;
}

export function OnboardingGroup({ userId, onComplete }: OnboardingGroupProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create group fields
  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("⚔️");
  const [stakes, setStakes] = useState("");

  // Join group field
  const [inviteCode, setInviteCode] = useState("");

  const createGroup = useMutation(api.groups.create);
  const joinGroup = useMutation(api.groups.join);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    setError("");
    try {
      await createGroup({
        name: groupName.trim(),
        emoji: groupEmoji,
        weeklyStakes: stakes.trim() || undefined,
        userId,
      });
      onComplete();
    } catch (e: any) {
      setError(e.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      await joinGroup({ inviteCode: inviteCode.trim().toUpperCase(), userId });
      onComplete();
    } catch (e: any) {
      setError(e.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const GROUP_EMOJIS = ["⚔️", "🏆", "💪", "🔥", "⚡", "🎯", "👊", "🦁"];

  if (mode === "choose") {
    return (
      <div className="flex flex-col flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">
            Time to battle
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Create a group for your mates, or join one with an invite code.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMode("create")}
            className="glass-card p-5 flex flex-col items-center gap-3 text-center transition-all active:scale-[0.98]"
          >
            <span className="text-3xl">➕</span>
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-sm">
                Create a group
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Set the stakes, invite your crew
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("join")}
            className="glass-card p-5 flex flex-col items-center gap-3 text-center transition-all active:scale-[0.98]"
          >
            <span className="text-3xl">🔗</span>
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-sm">
                Join a group
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Enter the invite code
              </div>
            </div>
          </button>
        </div>

        <div className="mt-auto">
          <Button variant="ghost" onClick={onComplete} className="w-full">
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="flex flex-col flex-1">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-1 text-[var(--text-tertiary)] mb-6 text-sm"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-6">
          Create your group
        </h1>

        <div className="space-y-5 mb-8">
          {/* Emoji picker */}
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
              Group emoji
            </label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setGroupEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    groupEmoji === emoji
                      ? "bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40"
                      : "glass-card-sm"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Sector Three Gym Crew"
            maxLength={30}
          />

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
              Weekly stakes (optional)
            </label>
            <input
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              placeholder="e.g. Loser buys a round 🍺"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Displayed prominently on the leaderboard
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#FF453A] mb-4">{error}</p>
        )}

        <div className="mt-auto">
          <Button
            onClick={handleCreate}
            loading={loading}
            disabled={!groupName.trim()}
            className="w-full"
            size="lg"
          >
            Create Group →
          </Button>
        </div>
      </div>
    );
  }

  // Join mode
  return (
    <div className="flex flex-col flex-1">
      <button
        onClick={() => setMode("choose")}
        className="flex items-center gap-1 text-[var(--text-tertiary)] mb-6 text-sm"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">
        Join a group
      </h1>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Ask your mate to share the invite code from their group settings.
      </p>

      <Input
        label="Invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        placeholder="e.g. ABC123"
        maxLength={6}
        className="tracking-widest text-center text-xl font-bold uppercase"
      />

      {error && (
        <p className="text-sm text-[#FF453A] mt-3">{error}</p>
      )}

      <div className="mt-auto pt-6">
        <Button
          onClick={handleJoin}
          loading={loading}
          disabled={inviteCode.trim().length !== 6}
          className="w-full"
          size="lg"
        >
          Join Group →
        </Button>
      </div>
    </div>
  );
}
