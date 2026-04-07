"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
      {title && <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-3">{title}</p>}
      {children}
    </div>
  );
}

export default function GroupSettingsPage() {
  const { convexUser } = useCurrentUser();
  const groups = useQuery(api.groups.getUserGroups, convexUser ? { userId: convexUser._id } : "skip");
  const firstGroup = groups?.[0];
  const groupWithMembers = useQuery(api.groups.getGroupWithMembers, firstGroup ? { groupId: firstGroup._id } : "skip");

  const updateStakes = useMutation(api.groups.updateStakes);
  const leaveGroup = useMutation(api.groups.leaveGroup);
  const removeMember = useMutation(api.groups.removeMember);
  const updateGroup = useMutation(api.groups.updateGroup);

  const [stakes, setStakes] = useState(firstGroup?.weeklyStakes || "");
  const [groupName, setGroupName] = useState(firstGroup?.name || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!convexUser || !groupWithMembers) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const isOwner = groupWithMembers.ownerId === convexUser._id;
  const inviteCode = groupWithMembers.inviteCode;
  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isOwner) {
        await updateStakes({ groupId: groupWithMembers._id, weeklyStakes: stakes, userId: convexUser._id });
        await updateGroup({ groupId: groupWithMembers._id, name: groupName, userId: convexUser._id });
      }
    } finally { setSaving(false); }
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8 gap-4" style={{ background: "var(--bg-base)" }}>
      <div className="flex items-center gap-3 mb-2">
        <a href="/dashboard" className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-3)] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </a>
        <h1 className="text-lg font-bold text-[var(--text-1)]">Group Settings</h1>
      </div>

      {/* Invite link */}
      <Section title="Invite">
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono text-[var(--text-2)] overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            {inviteCode}
          </div>
          <button onClick={handleCopyInvite}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={copied
              ? { background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)" }
              : { background: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border)" }
            }>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </Section>

      {/* Settings (owner only) */}
      {isOwner && (
        <Section title="Group details">
          <div className="space-y-4">
            <Input label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} maxLength={30} />
            <div>
              <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2 block">
                Weekly Stakes
              </label>
              <input value={stakes} onChange={(e) => setStakes(e.target.value)}
                placeholder="e.g. Loser buys a round 🍺" maxLength={100}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-colors"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                onFocus={(e) => e.target.style.borderColor = "var(--border-strong)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            </div>
          </div>
          <Button onClick={handleSave} loading={saving} className="w-full mt-4" size="md">Save Changes</Button>
        </Section>
      )}

      {/* Members */}
      <Section title={`Members · ${groupWithMembers.memberCount}`}>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {groupWithMembers.members?.map((member: any) => (
            <div key={member._id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
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
                <button
                  onClick={() => removeMember({ groupId: groupWithMembers._id, targetUserId: member._id, requestingUserId: convexUser._id })}
                  className="text-xs text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Leave group */}
      {!isOwner && (
        <button
          onClick={async () => {
            if (confirm("Leave this group?")) {
              await leaveGroup({ groupId: groupWithMembers._id, userId: convexUser._id });
            }
          }}
          className="w-full py-3 text-sm font-semibold rounded-xl transition-colors hover:opacity-80"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "#F87171" }}>
          Leave Group
        </button>
      )}
    </div>
  );
}
