export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen px-6 py-12 max-w-2xl mx-auto"
      style={{ background: "var(--bg-base)", color: "var(--text-1)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-[var(--text-2)] mb-4">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">What We Collect</h2>
          <p>We collect your name, email address, and workout data (activity type, duration, distance, heart rate, and other fitness metrics) to provide our service. Workout data is sourced from your manual entries or connected fitness platforms (Strava, Garmin, Apple Health).</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">How We Use It</h2>
          <p>Your workout data is processed by AI (OpenAI) to generate effort scores and coaching recommendations. Scores and workouts are shared only within the groups you join — never publicly. We do not sell your data.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Clerk — authentication and identity management</li>
            <li>Convex — real-time database</li>
            <li>OpenAI — AI workout scoring and recommendations</li>
            <li>Stripe — payment processing</li>
            <li>Strava / Garmin — fitness data (only if you connect them)</li>
            <li>Vercel Analytics — anonymous usage analytics</li>
            <li>Sentry — crash reporting</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Your Rights</h2>
          <p>You can delete your account and all associated data at any time by contacting us at hello@battleboard.app. We comply with GDPR and UK data protection law.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Contact</h2>
          <p>Email us at hello@battleboard.app for any privacy-related questions.</p>
        </section>
      </div>
    </div>
  );
}
