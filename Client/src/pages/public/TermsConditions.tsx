export function TermsConditions() {
  return (
    <div className="min-h-screen" style={{ background: '#050d1a' }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
        <h1 style={{ color: '#e8f8ff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terms & Conditions</h1>
        <p style={{ color: 'rgba(148,175,210,0.6)', fontSize: 13, marginBottom: 40 }}>Last updated: June 13, 2026</p>

        <div style={{ color: 'rgba(148,175,210,0.8)', fontSize: 14.5, lineHeight: 1.8 }}>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Acceptance of Terms</h2>
            <p>By accessing or using Autoniv, you agree to be bound by these Terms & Conditions. If you do not agree, do not use our services.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Description of Service</h2>
            <p>Autoniv provides AI-powered voice agent services for business communication. Our platform enables automated calling, lead qualification, appointment scheduling, and analytics.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Account Registration</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>You must provide accurate and complete information.</li>
              <li>You are responsible for maintaining account security.</li>
              <li>You must be at least 18 years old to use our services.</li>
              <li>One person or entity may not maintain more than one account.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Acceptable Use</h2>
            <p style={{ marginBottom: 12 }}>You agree not to:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Use the service for illegal or unauthorized purposes.</li>
              <li>Make calls without proper consent from recipients.</li>
              <li>Use the service for spam, harassment, or fraudulent activities.</li>
              <li>Attempt to reverse-engineer or exploit our systems.</li>
              <li>Resell or redistribute the service without authorization.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Payment & Billing</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Paid plans are billed in advance on a monthly or annual basis.</li>
              <li>All fees are non-refundable unless otherwise stated.</li>
              <li>We reserve the right to change pricing with 30 days notice.</li>
              <li>Overdue payments may result in service suspension.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Intellectual Property</h2>
            <p>All content, features, and technology on Autoniv are owned by us and protected by intellectual property laws. You retain ownership of any data you upload to the platform.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Service Availability</h2>
            <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance with reasonable advance notice.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Limitation of Liability</h2>
            <p>Autoniv shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>9. Termination</h2>
            <p>We may suspend or terminate your account at any time for violation of these terms. You may cancel your account at any time through your dashboard.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>11. Contact</h2>
            <p>For questions about these Terms, contact us at: <span style={{ color: '#0077ff' }}>legal@autoniv.com</span></p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default TermsConditions;
