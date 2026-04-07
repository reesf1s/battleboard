import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-primary)" }}
            >
              <span className="text-black font-black text-lg">B</span>
            </div>
            <span className="text-xl font-black text-[var(--text-primary)]">Battleboard</span>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Welcome back. Let's get competing.</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
