export default function TermsPage() {
  return (
    <div
      className="min-h-screen px-6 py-12 max-w-2xl mx-auto"
      style={{ background: "var(--bg-base)", color: "var(--text-1)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-[var(--text-2)] mb-4">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Service</h2>
          <p>Battleboard is a fitness competition platform. You must be 16 or older to use it. The service is provided "as is" — we aim for accuracy in AI scoring but cannot guarantee specific outcomes.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Subscriptions</h2>
          <p>Battleboard requires an active paid subscription after the 7-day free trial. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. To cancel, manage your subscription through your account settings or by emailing hello@battleboard.app.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Acceptable Use</h2>
          <p>Don't abuse the platform, log false workouts, or harass other group members. We reserve the right to terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Fitness Disclaimer</h2>
          <p>Battleboard is for entertainment and motivation — not medical advice. Consult a healthcare professional before beginning any fitness programme. We are not responsible for injuries sustained during exercise.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-2">Contact</h2>
          <p>hello@battleboard.app</p>
        </section>
      </div>
    </div>
  );
}
