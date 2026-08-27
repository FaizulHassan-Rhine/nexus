export const metadata = {
  title: "Terms of Service",
  description: "Terms of use for the Nexus prototype demonstration platform.",
};

export default function TermsPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl prose prose-slate dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="lead text-secondary">
          By using the Nexus prototype, you agree to these demonstration terms. This is not a production service agreement.
        </p>

        <h2>1. Prototype nature</h2>
        <p>Nexus is a frontend-only prototype for design and workflow validation. All organizations, opportunities, users, and outcomes are simulated. No real employment, funding, or academic credit is offered or guaranteed.</p>

        <h2>2. Acceptable use</h2>
        <ul>
          <li>Use demo accounts and passwords provided for testing only</li>
          <li>Do not enter real sensitive personal data you would not want stored in browser localStorage</li>
          <li>Do not attempt to use the prototype for actual hiring, admissions, or financial decisions</li>
          <li>Do not misrepresent prototype metrics as official government statistics</li>
        </ul>

        <h2>3. Accounts</h2>
        <p>Demo accounts share a common password (demo123). Registration creates local-only profiles. UGC and helpdesk roles are invitation-only in the full design; demo access is provided via login cards.</p>

        <h2>4. Content and listings</h2>
        <p>Opportunity listings, organization profiles, and university data are seed content. Verification badges and ratings reflect demo states, not real-world due diligence.</p>

        <h2>5. Applications and funding</h2>
        <p>Submitting applications or funding requests in the prototype creates simulated records with status timelines. No organizations receive real applications through this demo.</p>

        <h2>6. Intellectual property</h2>
        <p>Technology marketplace listings describe fictional university IP for demonstration. Licensing terms shown are illustrative only.</p>

        <h2>7. Disclaimers</h2>
        <p>The prototype is provided &quot;as is&quot; without warranties. Match scores are algorithmic suggestions, not guarantees of selection. University review remains the authoritative gate for most workflows.</p>

        <h2>8. Changes</h2>
        <p>These terms may change as the prototype evolves. Continued use after updates constitutes acceptance of revised terms.</p>

        <h2>9. Contact</h2>
        <p>Questions about these terms: use the Contact page or Help centre in the prototype.</p>

        <p className="text-sm text-amber-800 dark:text-amber-200">Last updated: August 2026 · Prototype version 1</p>
      </div>
    </div>
  );
}
