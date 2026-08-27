export const metadata = {
  title: "Privacy Policy",
  description: "Privacy and data consent concepts for the Nexus prototype platform.",
};

export default function PrivacyPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="lead text-secondary">
          This privacy policy describes how the Nexus prototype handles data in a frontend-only demonstration environment.
        </p>

        <h2>Simulated data notice</h2>
        <p>All personal information in Nexus is fictional seed data or information you enter during the demo. Nothing is transmitted to external servers except what your browser stores locally.</p>

        <h2>Data stored locally</h2>
        <p>The prototype uses browser localStorage (via Zustand persist) to save:</p>
        <ul>
          <li>Login session and profile updates</li>
          <li>Saved and compared opportunities</li>
          <li>Applications, tickets, and notifications you create in the demo</li>
          <li>UI preferences (theme, language, sidebar state)</li>
        </ul>

        <h2>Consent concepts demonstrated</h2>
        <ul>
          <li><strong>Registration consent</strong> — checkboxes for terms and data sharing during sign-up</li>
          <li><strong>Privacy preferences</strong> — controls for CGPA visibility and organization sharing</li>
          <li><strong>TIGERfed mock SSO</strong> — simulated consent screen for federated identity attributes</li>
          <li><strong>Document uploads</strong> — metadata only; binary files are not stored</li>
        </ul>

        <h2>Matching fairness</h2>
        <p>Match scores use skills, eligibility, career fit, location, schedule, compensation alignment, and track record. Sensitive attributes are explicitly excluded from scoring.</p>

        <h2>Your controls</h2>
        <p>You can reset all demo data from portal settings or clear browser storage. Use the &quot;Reset demo data&quot; action to restore the original seed state.</p>

        <h2>Contact</h2>
        <p>For questions about this prototype policy, use the Contact page. In a production deployment, a data protection officer contact would be listed here.</p>

        <p className="text-sm text-amber-800 dark:text-amber-200">Last updated: August 2026 · Prototype version 1</p>
      </div>
    </div>
  );
}
