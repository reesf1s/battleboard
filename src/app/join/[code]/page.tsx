"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { convexUser, isSignedIn, isLoaded } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const group = useQuery(api.groups.getByInviteCode, { inviteCode: code.toUpperCase() });
  const joinGroup = useMutation(api.groups.join);

  if (!isLoaded || group === undefined) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isSignedIn) {
    router.push(`/sign-up?redirect_url=/join/${code}`);
    return null;
  }

  if (group === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center"
        style={{ background: "var(--bg-base)" }}>
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-[var(--text-1)] mb-2">Invalid invite code</h2>
        <p className="text-[var(--text-2)] text-sm">This link doesn't exist or has expired.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6" variant="secondary">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleJoin = async () => {
    if (!convexUser) return;
    setLoading(true); setError("");
    try {
      await joinGroup({ inviteCode: code.toUpperCase(), userId: convexUser._id });
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center max-w-sm mx-auto"
      style={{ background: "var(--bg-base)" }}>

      <div className="text-5xl mb-4">{group.emoji || "⚔️"}</div>
      <h1 className="text-2xl font-black text-[var(--text-1)] mb-1.5">Join {group.name}</h1>
      <p className="text-[var(--text-3)] text-sm mb-3">
        {group.memberCount} member{group.memberCount !== 1 ? "s" : ""} competing
      </p>

      {group.weeklyStakes && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 mb-6">
          <p className="text-sm text-[var(--text-2)]">⚔️ {group.weeklyStakes}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="w-full flex flex-col gap-3">
        <Button onClick={handleJoin} loading={loading} className="w-full" size="lg">
          Join the Battle
        </Button>
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
