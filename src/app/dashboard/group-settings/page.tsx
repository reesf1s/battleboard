"use client";

import { useState } from "react";
import { isDemoMode, DEMO_USER, DEMO_GROUPS } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ background: "var(--bg-surface)" }}>
      {title && <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-4">{title}</p>}
      {children}
    </div>
  );
}

export default function GroupSettingsPage() {
  if (isDemoMode()) return <DemoGroupSettings />;
  return <RealGroupSettings />;
}

function DemoGroupSettings() {
  const [copied, setCopied] = useState(false);
  const group = DEMO_GROUPS[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitness-ivory-omega.vercel.app";
  const inviteUrl = `${appUrl}/join/${group.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Join ${group.name} on Battleboard`,
          text: `Join my fitness group on Battleboard! Use code: ${group.inviteCode}`,
          url: inviteUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const members = [
    { _id: "1", name: "Rees", avatarUrl: undefined },
    { _id: "2", name: "Jake M", avatarUrl: undefined },
    { _id: "3", name: "Tom K", avatarUrl: undefined },
    { _id: "4", name: "Dave R", avatarUrl: undefined },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full px-4 pt-14 pb-8 gap-4" style={{ background: "var(--bg-base)" }}>
      <div className="flex items-center gap-3 mb-2">
        <a href="/dashboard" className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors"
          aria-label="Back to dashboard">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <h1 className="app-display text-xl font-bold text-[var(--text-1)]">Group Settings</h1>
      </div>

      <Section title="Invite">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-4 py-3 rounded-lg text-sm font-mono text-[var(--text-2)] tracking-widest truncate"
            style={{ background: "var(--bg-raised)" }}>
            {group.inviteCode}
          </div>
          <button onClick={handleCopy} aria-label="Copy invite code"
            className="px-4 py-3 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
            style={copied
              ? { background: "rgba(0,240,181,0.08)", color: "#00F0B5" }
              : { background: "var(--bg-raised)", color: "var(--text-2)" }
            }>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button onClick={handleShare}
          className="w-full py-3 rounded-xl text-sm font-semibold text-[#09090B] flex items-center justify-center gap-2 active:scale-[0.98] transition-all btn-gradient">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M4 8v5a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share Invite Link
        </button>
      </Section>

      <Section title={`Members · ${members.length}`}>
        {members.map((m, i) => (
          <div key={m._id} className="flex items-center gap-3 py-3"
            style={i < members.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}>
              {m.name?.[0] ?? "?"}
            </div>
            <span className="text-sm font-medium text-[var(--text-1)] truncate">{m.name}</span>
            {i === 0 && <span className="text-[10px] text-[var(--text-3)] ml-1 flex-shrink-0">Owner</span>}
          </div>
        ))}
      </Section>
    </div>
  );
}

function RealGroupSettings() {
  const { convexUser } = useCurrentUser();
  const groups = useQuery(api.groups.getUserGroups, convexUser ? { userId: convexUser._id } : "skip");
  const firstGroup = groups?.[0];
  const groupWithMembers = useQuery(api.groups.getGroupWithMembers, firstGroup ? { groupId: firstGroup._id } : "skip");

  const updateStakes = useMutation(api.groups.updateStakes);
  const leaveGroup = useMutation(api.groups.leaveGroup);
  const removeMember = useMutation(api.groups.removeMember);
  const updateGroup = useMutation(api.groups.updateGroup);

  const [stakes, setStakes] = useState("");
  const [groupName, setGroupName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (groupWithMembers && !initialized) {
    setStakes(groupWithMembers.weeklyStakes || "");
    setGroupName(groupWithMembers.name || "");
    setInitialized(true);
  }

  if (!convexUser || !groupWithMembers) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const isOwner = groupWithMembers.ownerId === convexUser._id;
  const inviteCode = groupWithMembers.inviteCode;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      if (isOwner) {
        await updateStakes({ groupId: groupWithMembers._id, weeklyStakes: stakes, userId: convexUser._id });
        await updateGroup({ groupId: groupWithMembers._id, name: groupName, userId: convexUser._id });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: any) {
      setError(e.message || "Failed to save changes. Please try again.");
    } finally { setSaving(false); }
  };

  const handleRemoveMember = async (memberId: any) => {
    setActionLoading(true);
    setError(null);
    try {
      await removeMember({ groupId: groupWithMembers._id, targetUserId: memberId as any, requestingUserId: convexUser._id });
      setConfirmingRemove(null);
    } catch (e: any) {
      setError(e.message || "Failed to remove member. Please try again.");
    } finally { setActionLoading(false); }
  };

  const handleLeaveGroup = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await leaveGroup({ groupId: groupWithMembers._id, userId: convexUser._id });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message || "Failed to leave group. Please try again.");
      setConfirmingLeave(false);
    } finally { setActionLoading(false); }
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitness-ivory-omega.vercel.app";
  const inviteUrl = `${appUrl}/join/${inviteCode}`;

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareInvite = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Join ${groupWithMembers.name} on Battleboard`,
          text: `Join my fitness group on Battleboard! Use code: ${inviteCode}`,
          url: inviteUrl,
        });
      } catch {}
    } else {
      handleCopyInvite();
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full px-4 pt-14 pb-8 gap-4" style={{ background: "var(--bg-base)" }}>
      <div className="flex items-center gap-3 mb-2">
        <a href="/dashboard" className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors"
          aria-label="Back to dashboard">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <h1 className="app-display text-xl font-bold text-[var(--text-1)]">Group Settings</h1>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in"
          style={{ background: "rgba(248,113,113,0.04)" }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: "#F87171" }}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[#F87171] flex-1 min-w-0">{error}</p>
          <button onClick={() => setError(null)} className="text-[#F87171] p-1 hover:opacity-70 flex-shrink-0" aria-label="Dismiss error">
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <Section title="Invite">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-4 py-3 rounded-lg text-sm font-mono text-[var(--text-2)] tracking-widest truncate"
            style={{ background: "var(--bg-raised)" }}>
            {inviteCode}
          </div>
          <button onClick={handleCopyInvite} aria-label="Copy invite code"
            className="px-4 py-3 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
            style={copied
              ? { background: "rgba(0,240,181,0.08)", color: "#00F0B5" }
              : { background: "var(--bg-raised)", color: "var(--text-2)" }
            }>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button onClick={handleShareInvite}
          className="w-full py-3 rounded-xl text-sm font-semibold text-[#09090B] flex items-center justify-center gap-2 active:scale-[0.98] transition-all btn-gradient">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M4 8v5a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share Invite Link
        </button>
      </Section>

      {isOwner && (
        <Section title="Group Details">
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Group Name</label>
              <Input value={groupName} onChange={(e: any) => setGroupName(e.target.value)} maxLength={30} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-2 block">Weekly Stakes</label>
              <input value={stakes} onChange={(e) => setStakes(e.target.value)}
                placeholder="e.g. Loser buys a round" maxLength={100}
                className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(0,240,181,0.08)] transition-all duration-200"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full mt-5" size="default">
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
          </Button>
        </Section>
      )}

      <Section title={`Members · ${groupWithMembers.memberCount}`}>
        {groupWithMembers.members?.map((member: any, i: number) => (
          <div key={member._id} className="flex items-center justify-between py-3"
            style={i < (groupWithMembers.members?.length || 0) - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
            <div className="flex items-center gap-3 min-w-0">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}>
                  {member.name?.[0] ?? "?"}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm font-medium text-[var(--text-1)] truncate block">{member.name}</span>
                {member._id === groupWithMembers.ownerId && (
                  <span className="text-[10px] text-[var(--text-3)]">Owner</span>
                )}
              </div>
            </div>
            {isOwner && member._id !== convexUser._id && (
              confirmingRemove === member._id ? (
                <div className="flex items-center gap-1.5 animate-fade-in flex-shrink-0">
                  <button onClick={() => handleRemoveMember(member._id)} disabled={actionLoading}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                    style={{ background: "rgba(248,113,113,0.06)", color: "#F87171" }}>
                    {actionLoading ? "..." : "Confirm"}
                  </button>
                  <button onClick={() => setConfirmingRemove(null)} disabled={actionLoading}
                    className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmingRemove(member._id)}
                  className="text-xs text-[#F87171] px-3 py-1.5 rounded-lg hover:bg-[#F87171]/8 transition-colors flex-shrink-0"
                  aria-label={`Remove ${member.name} from group`}>
                  Remove
                </button>
              )
            )}
          </div>
        ))}
      </Section>

      {!isOwner && (
        confirmingLeave ? (
          <div className="rounded-xl px-5 py-4 animate-fade-in"
            style={{ background: "rgba(248,113,113,0.04)" }}>
            <p className="text-sm text-[var(--text-1)] font-medium mb-3">Are you sure you want to leave this group?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmingLeave(false)} disabled={actionLoading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-[var(--text-2)] transition-colors hover:bg-[var(--bg-hover)]"
                style={{ background: "var(--bg-raised)" }}>
                Cancel
              </button>
              <button onClick={handleLeaveGroup} disabled={actionLoading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors hover:opacity-80"
                style={{ background: "rgba(248,113,113,0.06)", color: "#F87171" }}>
                {actionLoading ? "Leaving..." : "Leave Group"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingLeave(true)}
            className="w-full py-3.5 text-sm font-semibold rounded-xl transition-colors hover:opacity-80"
            style={{ background: "rgba(248,113,113,0.04)", color: "#F87171" }}>
            Leave Group
          </button>
        )
      )}
    </div>
  );
}
