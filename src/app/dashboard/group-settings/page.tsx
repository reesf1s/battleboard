"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function GroupSettingsPage() {
  const { convexUser } = useCurrentUser();

  const groups = useQuery(
    api.groups.getUserGroups,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const firstGroup = groups?.[0];

  const groupWithMembers = useQuery(
    api.groups.getGroupWithMembers,
    firstGroup ? { groupId: firstGroup._id } : "skip"
  );

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
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
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
        await updateStakes({
          groupId: groupWithMembers._id,
          weeklyStakes: stakes,
          userId: convexUser._id,
        });
        await updateGroup({
          groupId: groupWithMembers._id,
          name: groupName,
          userId: convexUser._id,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard" className="text-[var(--text-tertiary)]">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Group Settings</h1>
      </div>

      {/* Invite */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Invite Link</h3>
        <div className="flex gap-2">
          <div
            className="flex-1 px-3 py-2 rounded-xl text-sm font-mono text-[var(--text-secondary)] overflow-hidden text-ellipsis"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}
          >
            {inviteCode}
          </div>
          <button
            onClick={handleCopyInvite}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
            style={{
              background: copied ? "rgba(50,215,75,0.15)" : "rgba(255,255,255,0.08)",
              color: copied ? "var(--accent-primary)" : "var(--text-primary)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Settings (owner only) */}
      {isOwner && (
        <div className="glass-card p-4 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Group Settings</h3>
          <div className="space-y-4">
            <Input
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={30}
            />
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">
                Weekly Stakes
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
            </div>
          </div>
          <Button onClick={handleSave} loading={saving} className="w-full mt-4" size="md">
            Save Changes
          </Button>
        </div>
      )}

      {/* Members */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Members ({groupWithMembers.memberCount})
        </h3>
        <div className="space-y-3">
          {groupWithMembers.members?.map((member: any) => (
            <div key={member._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    {member.name[0]}
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{member.name}</span>
                  {member._id === groupWithMembers.ownerId && (
                    <span className="ml-1.5 text-xs text-[var(--text-tertiary)]">Owner</span>
                  )}
                </div>
              </div>
              {isOwner && member._id !== convexUser._id && (
                <button
                  onClick={() =>
                    removeMember({
                      groupId: groupWithMembers._id,
                      targetUserId: member._id,
                      requestingUserId: convexUser._id,
                    })
                  }
                  className="text-xs text-[#FF453A] px-2 py-1 rounded-lg hover:bg-red-500/10"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave group */}
      {!isOwner && (
        <button
          onClick={async () => {
            if (confirm("Leave this group?")) {
              await leaveGroup({ groupId: groupWithMembers._id, userId: convexUser._id });
            }
          }}
          className="w-full py-3 text-sm font-medium text-[#FF453A] glass-card-sm rounded-2xl"
        >
          Leave Group
        </button>
      )}
    </div>
  );
}
