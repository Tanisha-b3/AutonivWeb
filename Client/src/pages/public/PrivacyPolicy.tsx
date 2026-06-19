export function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: '#050d1a' }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
        <h1 style={{ color: '#e8f8ff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(148,175,210,0.6)', fontSize: 13, marginBottom: 40 }}>Last updated: June 13, 2026</p>

        <div style={{ color: 'rgba(148,175,210,0.8)', fontSize: 14.5, lineHeight: 1.8 }}>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Information We Collect</h2>
            <p style={{ marginBottom: 12 }}>When you use Autoniv, we may collect:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li><strong>Account Information:</strong> Name, email, phone number, company name when you register.</li>
              <li><strong>Usage Data:</strong> Call logs, transcripts, agent configurations, and analytics.</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through our payment partners.</li>
              <li><strong>Communications:</strong> Messages you send through our support or contact forms.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. How We Use Your Information</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>To provide and improve our AI voice agent services.</li>
              <li>To process calls and generate transcripts on your behalf.</li>
              <li>To send important updates about your account or service.</li>
              <li>To analyze usage patterns and improve performance.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Data Sharing</h2>
            <p style={{ marginBottom: 12 }}>We do not sell your personal data. We may share information with:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li><strong>Service Providers:</strong> Third-party services that help us operate (Vapi, OpenAI, ElevenLabs, etc.).</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Your Rights</h2>
            <p style={{ marginBottom: 12 }}>You have the right to:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Access, update, or delete your personal information.</li>
              <li>Export your data in a portable format.</li>
              <li>Opt out of non-essential communications.</li>
              <li>Request a copy of all data we hold about you.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Cookies</h2>
            <p>We use cookies to maintain your session and remember your preferences. Essential cookies are required for the service to function.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion at any time.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform.</p>
          </section>

          <section>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>9. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at: <span style={{ color: '#0077ff' }}>privacy@autoniv.com</span></p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
