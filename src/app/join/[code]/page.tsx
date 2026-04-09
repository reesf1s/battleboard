"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { Button } from "@/components/ui/Button";

export default function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const demo = isDemoMode();

  if (demo) return <DemoJoinPage code={code} />;
  return <RealJoinPage code={code} />;
}

function DemoJoinPage({ code }: { code: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center max-w-sm mx-auto"
      style={{ background: "var(--bg-base)" }}>
      <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: "var(--accent-dim)" }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: "var(--accent)" }}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-1.5">Join Group</h1>
      <p className="text-[var(--text-3)] text-sm mb-3">Invite code: {code.toUpperCase()}</p>
      <p className="text-[var(--text-2)] text-sm mb-6">Sign in to join this group and start competing.</p>
      <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg">Go to Dashboard</Button>
    </div>
  );
}

function RealJoinPage({ code }: { code: string }) {
  const { useCurrentUser } = require("@/hooks/useCurrentUser");
  const { useQuery, useMutation } = require("convex/react");
  const { api } = require("../../../../convex/_generated/api");

  const router = useRouter();
  const { convexUser, isSignedIn, isLoaded } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const group = useQuery(api.groups.getByInviteCode, { inviteCode: code.toUpperCase() });
  const joinGroup = useMutation(api.groups.join);

  if (!isLoaded || group === undefined) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
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
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center" style={{ background: "var(--bg-base)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(248,113,113,0.1)" }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: "#F87171" }}>
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="app-display text-xl font-bold text-[var(--text-1)] mb-2">Invalid invite code</h2>
        <p className="text-[var(--text-2)] text-sm mb-6">This link doesn't exist or has expired.</p>
        <Button onClick={() => router.push("/dashboard")} variant="secondary">Go to Dashboard</Button>
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
      const msg = e.message || "Failed to join";
      // Friendly message for common cases
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("member")) {
        setError("You're already a member of this group.");
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center max-w-sm mx-auto"
      style={{ background: "var(--bg-base)" }}>
      <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: "var(--accent-dim)" }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: "var(--accent)" }}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="app-display text-2xl font-bold text-[var(--text-1)] mb-1.5">Join {group.name}</h1>
      <p className="text-[var(--text-3)] text-sm mb-3">
        {group.memberCount} member{group.memberCount !== 1 ? "s" : ""} competing
      </p>

      {group.weeklyStakes && (
        <div className="rounded-2xl px-4 py-2.5 mb-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm text-[var(--text-2)]">{group.weeklyStakes}</p>
        </div>
      )}

      {error && <p className="text-sm text-[#F87171] mb-4">{error}</p>}

      <div className="w-full flex flex-col gap-3">
        <Button onClick={handleJoin} loading={loading} className="w-full" size="lg">Join the Battle</Button>
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="w-full">Cancel</Button>
      </div>
    </div>
  );
}
