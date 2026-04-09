"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isDemoMode } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Mode = "choose" | "create" | "join" | "created";

interface OnboardingGroupProps {
  userId: any;
  onComplete: () => void;
}

const GROUP_EMOJIS = ["⚔️", "🏆", "💪", "🔥", "⚡", "🎯", "👊", "🦁"];

const STAKES_SUGGESTIONS = [
  { label: "🍕 Loser buys pizza", value: "Loser buys pizza" },
  { label: "🏃 Loser runs an extra 5k", value: "Loser runs an extra 5k" },
  { label: "🥤 Loser buys post-gym shakes", value: "Loser buys post-gym shakes" },
  { label: "🎉 Winner picks the next group workout", value: "Winner picks the next group workout" },
  { label: "💸 Loser puts £5 in the group pot", value: "Loser puts £5 in the group pot" },
  { label: "📱 Loser posts embarrassing gym selfie", value: "Loser posts embarrassing gym selfie" },
];

export function OnboardingGroup({ userId, onComplete }: OnboardingGroupProps) {
  if (isDemoMode()) return <DemoOnboardingGroup onComplete={onComplete} />;
  return <RealOnboardingGroup userId={userId} onComplete={onComplete} />;
}

function DemoOnboardingGroup({ onComplete }: { onComplete: () => void }) {
  return <OnboardingGroupInner onComplete={onComplete} />;
}

function RealOnboardingGroup({ userId, onComplete }: OnboardingGroupProps) {
  const createGroup = useMutation(api.groups.create);
  const joinGroup = useMutation(api.groups.join);

  return (
    <OnboardingGroupInner
      userId={userId}
      onComplete={onComplete}
      createGroup={createGroup}
      joinGroup={joinGroup}
    />
  );
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
  const [createdInviteCode, setCreatedInviteCode] = useState("");
  const [createdGroupName, setCreatedGroupName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    setError("");
    try {
      if (!createGroup) {
        onComplete();
        return;
      }
      const result = await createGroup({
        name: groupName.trim(),
        emoji: groupEmoji,
        weeklyStakes: stakes.trim() || undefined,
        userId,
      });
      setCreatedInviteCode(result.inviteCode);
      setCreatedGroupName(groupName.trim());
      setMode("created");
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
      if (!joinGroup) {
        onComplete();
        return;
      }
      await joinGroup({ inviteCode: inviteCode.trim().toUpperCase(), userId });
      onComplete();
    } catch (e: any) {
      setError(e.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(createdInviteCode);
    } catch {
      const el = document.createElement("textarea");
      el.value = createdInviteCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `Join my fitness group "${createdGroupName}" on Battleboard!\n\nInvite code: ${createdInviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join my Battleboard group", text: shareText });
      } catch {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  // ─── Choose mode ───
  if (mode === "choose") {
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="mb-8">
          <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">
            Time to battle
          </h1>
          <p className="text-[var(--text-2)] text-sm leading-relaxed">
            Create a group for your mates, or join one with an invite code.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              m: "create" as Mode,
              title: "Create a group",
              desc: "Set the stakes, invite your crew",
              icon: (
                <path
                  d="M10 4v12M4 10h12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              ),
            },
            {
              m: "join" as Mode,
              title: "Join a group",
              desc: "Got an invite code? Enter it here",
              icon: (
                <path
                  d="M13 7l-6 6M13 13H7V7"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ),
            },
          ].map((item) => (
            <button
              key={item.m}
              onClick={() => setMode(item.m)}
              className="rounded-xl bg-[var(--bg-surface)] p-5 flex flex-col gap-3 text-left transition-all active:scale-[0.97] hover:bg-[var(--bg-raised)]"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-5 h-5"
                  style={{ color: "var(--accent)" }}
                >
                  {item.icon}
                </svg>
              </div>
              <div>
                <div className="font-semibold text-[var(--text-1)] text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-[var(--text-3)] mt-1">
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <Button variant="ghost" onClick={onComplete} className="w-full">
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  // ─── Created ───
  if (mode === "created") {
    return (
      <div className="flex flex-col flex-1 items-center text-center w-full">
        <div className="mt-8 mb-6">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-4xl animate-fade-in"
            style={{ background: "var(--accent-dim)" }}
          >
            {groupEmoji}
          </div>
          <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">
            Group created!
          </h1>
          <p className="text-[var(--text-2)] text-sm leading-relaxed">
            Share the invite code with your mates to get them on the board.
          </p>
        </div>

        <div
          className="w-full rounded-xl bg-[var(--bg-surface)] p-6 mb-4"
        >
          <p className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">
            Invite code
          </p>
          <p
            className="text-3xl font-black tracking-[0.25em] text-[var(--text-1)] mb-4"
            style={{ fontFamily: "monospace" }}
          >
            {createdInviteCode}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
              style={{
                background: copied ? "rgba(0,240,181,0.1)" : "var(--bg-raised)",
                color: copied ? "#00F0B5" : "var(--text-2)",
              }}
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
            >
              Share invite
            </button>
          </div>
        </div>

        {stakes && (
          <div
            className="w-full rounded-xl bg-[var(--bg-surface)] px-4 py-3 mb-4 text-left"
          >
            <p className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-1">
              Weekly stakes
            </p>
            <p className="text-sm text-[var(--text-1)]">{stakes}</p>
          </div>
        )}

        <div className="mt-auto w-full">
          <Button onClick={onComplete} className="w-full btn-gradient text-[#09090B]" size="lg">
            Go to Battleboard
          </Button>
        </div>
      </div>
    );
  }

  // ─── Create mode ───
  if (mode === "create") {
    return (
      <div className="flex flex-col flex-1 w-full">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-1.5 text-[var(--text-3)] mb-6 text-sm hover:text-[var(--text-2)] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Back
        </button>

        <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-6">
          Create your group
        </h1>

        <div className="space-y-5 mb-6">
          {/* Emoji picker */}
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">
              Group emoji
            </p>
            <div className="flex gap-2 flex-wrap">
              {GROUP_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setGroupEmoji(emoji)}
                  className={cn(
                    "text-2xl p-2.5 rounded-lg transition-all",
                    groupEmoji === emoji
                      ? "bg-[var(--accent-dim)]"
                      : "bg-[var(--bg-raised)] hover:bg-[var(--bg-overlay)]"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Group name */}
          <Input
            label="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Saturday Soldiers"
            maxLength={30}
          />

          {/* Weekly stakes */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-2 block">
              Weekly stakes{" "}
              <span className="normal-case font-normal">(optional)</span>
            </label>
            <p className="text-xs text-[var(--text-3)] mb-3">
              What happens to the winner or loser each week?
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {STAKES_SUGGESTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStakes(s.value)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg transition-all active:scale-[0.97]",
                    stakes === s.value
                      ? "font-semibold"
                      : "hover:opacity-80"
                  )}
                  style={{
                    background: stakes === s.value ? "var(--accent-dim)" : "var(--bg-raised)",
                    color: stakes === s.value ? "var(--accent)" : "var(--text-2)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              placeholder="Or type your own..."
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-raised)] text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none focus:shadow-[0_0_0_3px_rgba(0,240,181,0.08)] transition-all duration-200"
            />
          </div>
        </div>

        {error && <p className="text-sm text-[#F87171] mb-4">{error}</p>}

        <div className="mt-auto">
          <Button
            onClick={handleCreate}
            loading={loading}
            disabled={!groupName.trim()}
            className="w-full btn-gradient text-[#09090B]"
            size="lg"
          >
            Create Group
          </Button>
        </div>
      </div>
    );
  }

  // ─── Join mode ───
  return (
    <div className="flex flex-col flex-1 w-full">
      <button
        onClick={() => setMode("choose")}
        className="flex items-center gap-1.5 text-[var(--text-3)] mb-6 text-sm hover:text-[var(--text-2)] transition-colors"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <path
            d="M10 4L6 8l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Back
      </button>

      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-2">
        Join a group
      </h1>
      <p className="text-[var(--text-2)] text-sm mb-8">
        Ask your mate to share their invite code from group settings.
      </p>

      <Input
        label="Invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        placeholder="e.g. ABC123"
        maxLength={6}
        className="tracking-widest text-center text-xl font-bold uppercase"
      />

      {error && <p className="text-sm text-[#F87171] mt-3">{error}</p>}

      <div className="mt-auto pt-6">
        <Button
          onClick={handleJoin}
          loading={loading}
          disabled={inviteCode.trim().length !== 6}
          className="w-full btn-gradient text-[#09090B]"
          size="lg"
        >
          Join Group
        </Button>
      </div>
    </div>
  );
}
