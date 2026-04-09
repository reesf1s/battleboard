"use client";

import { useState } from "react";
import { isDemoMode, DEMO_USER, DEMO_GROUPS } from "@/lib/demo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      {title && <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-4">{title}</p>}
      {children}
    </div>
  );
}

export default function GroupSettingsPage() {
  if (isDemoMode()) return <DemoGroupSettings />;
  return <RealGroupSettings />;
}

/* ── Demo version ── */
function DemoGroupSettings() {
  const [copied, setCopied] = useState(false);
  const group = DEMO_GROUPS[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://battleboard-rho.vercel.app";
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
      } catch {} // user cancelled
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
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8 gap-4" style={{ background: "var(--bg-base)" }}>
      <div className="flex items-center gap-3 mb-2">
        <a href="/dashboard" className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <h1 className="app-display text-xl font-bold text-[var(--text-1)]">Group Settings</h1>
      </div>

      <Section title="Invite">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-4 py-3 rounded-xl text-sm font-mono text-[var(--text-2)] tracking-widest"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            {group.inviteCode}
          </div>
          <button onClick={handleCopy}
            className="px-4 py-3 rounded-xl text-xs font-semibold transition-all"
            style={copied
              ? { background: "var(--accent-dim)", color: "var(--accent)" }
              : { background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }
            }>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button onClick={handleShare}
          className="w-full py-3 rounded-xl text-sm font-semibold text-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ background: "var(--accent)" }}>
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
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}>
              {m.name[0]}
            </div>
            <span className="text-sm font-medium text-[var(--text-1)]">{m.name}</span>
            {i === 0 && <span className="text-[10px] text-[var(--text-3)] ml-1">Owner</span>}
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ── Real version ── */
function RealGroupSettings() {
  const { useCurrentUser } = require("@/hooks/useCurrentUser");
  const { useQuery, useMutation } = require("convex/react");
  const { api } = require("../../../../convex/_generated/api");

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
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync form state once data loads
  if (groupWithMembers && !initialized) {
    setStakes(groupWithMembers.weeklyStakes || "");
    setGroupName(groupWithMembers.name || "");
    setInitialized(true);
  }

  if (!convexUser || !groupWithMembers) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const isOwner = groupWithMembers.ownerId === convexUser._id;
  const inviteCode = groupWithMembers.inviteCode;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isOwner) {
        await updateStakes({ groupId: groupWithMembers._id, weeklyStakes: stakes, userId: convexUser._id });
        await updateGroup({ groupId: groupWithMembers._id, name: groupName, userId: convexUser._id });
      }
    } finally { setSaving(false); }
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://battleboard-rho.vercel.app";
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
      } catch {} // user cancelled
    } else {
      handleCopyInvite();
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8 gap-4" style={{ background: "var(--bg-base)" }}>
      <div className="flex items-center gap-3 mb-2">
        <a href="/dashboard" className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <h1 className="app-display text-xl font-bold text-[var(--text-1)]">Group Settings</h1>
      </div>

      <Section title="Invite">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-4 py-3 rounded-xl text-sm font-mono text-[var(--text-2)] tracking-widest"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            {inviteCode}
          </div>
          <button onClick={handleCopyInvite}
            className="px-4 py-3 rounded-xl text-xs font-semibold transition-all"
            style={copied
              ? { background: "var(--accent-dim)", color: "var(--accent)" }
              : { background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }
            }>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button onClick={handleShareInvite}
          className="w-full py-3 rounded-xl text-sm font-semibold text-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ background: "var(--accent)" }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M4 8v5a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share Invite Link
        </button>
      </Section>

      {isOwner && (
        <Section title="Group Details">
          <div className="space-y-4">
            <Input label="Group Name" value={groupName} onChange={(e: any) => setGroupName(e.target.value)} maxLength={30} />
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-2 block">Weekly Stakes</label>
              <input value={stakes} onChange={(e) => setStakes(e.target.value)}
                placeholder="e.g. Loser buys a round" maxLength={100}
                className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          <Button onClick={handleSave} loading={saving} className="w-full mt-5" size="md">Save Changes</Button>
        </Section>
      )}

      <Section title={`Members · ${groupWithMembers.memberCount}`}>
        {groupWithMembers.members?.map((member: any, i: number) => (
          <div key={member._id} className="flex items-center justify-between py-3"
            style={i < (groupWithMembers.members?.length || 0) - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
            <div className="flex items-center gap-3">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--bg-overlay)", color: "var(--text-2)" }}>
                  {member.name[0]}
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-[var(--text-1)]">{member.name}</span>
                {member._id === groupWithMembers.ownerId && (
                  <span className="ml-2 text-[10px] text-[var(--text-3)]">Owner</span>
                )}
              </div>
            </div>
            {isOwner && member._id !== convexUser._id && (
              <button onClick={() => {
                if (confirm(`Remove ${member.name} from the group?`)) {
                  removeMember({ groupId: groupWithMembers._id, targetUserId: member._id, requestingUserId: convexUser._id });
                }
              }}
                className="text-xs text-[#F87171] px-3 py-1.5 rounded-lg hover:bg-[#F87171]/10 transition-colors">
                Remove
              </button>
            )}
          </div>
        ))}
      </Section>

      {!isOwner && (
        <button
          onClick={async () => {
            if (confirm("Leave this group?")) {
              await leaveGroup({ groupId: groupWithMembers._id, userId: convexUser._id });
            }
          }}
          className="w-full py-3.5 text-sm font-semibold rounded-2xl transition-colors hover:opacity-80"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "#F87171" }}>
          Leave Group
        </button>
      )}
    </div>
  );
}
