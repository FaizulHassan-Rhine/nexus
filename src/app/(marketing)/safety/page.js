export const metadata = {
  title: "Safety",
  description: "Safety guidelines, reporting paths, and escalation procedures for the Nexus prototype.",
};

export default function SafetyPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Safety & reporting</h1>
        <p className="mt-3 text-secondary">
          Nexus is designed with student safety as a priority. This prototype demonstrates reporting paths and escalation workflows using simulated data.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Immediate danger</h2>
          <p className="text-secondary">
            If you or someone else is in immediate physical danger, contact local emergency services (999 in Bangladesh) before using any platform reporting tool.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Report on Nexus</h2>
          <ol className="list-decimal space-y-2 pl-5 text-secondary">
            <li>Open a support ticket via the Contact page — select category &quot;Safety&quot; and priority &quot;Urgent&quot;.</li>
            <li>University administrators can escalate disputes from their portal review queue.</li>
            <li>UGC administrators receive escalated cases for programme-level oversight.</li>
            <li>Helpdesk tracks SLA compliance — 95% target within 24 hours.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Organization verification</h2>
          <p className="text-secondary">
            Organizations must pass verification before publishing opportunities. Risk levels and aggregated complaint counts are shown on organization profiles. Individual complaint details are not published to protect privacy while maintaining transparency.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Student protections</h2>
          <ul className="list-disc space-y-2 pl-5 text-secondary">
            <li>University approval required for most internships and scholarships</li>
            <li>Privacy controls on profile visibility and CGPA sharing</li>
            <li>Audit trail for applications, funding, and disputes</li>
            <li>No scoring based on religion, ethnicity, or political affiliation</li>
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Prototype limitation</h2>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            Safety workflows in this demo are simulated. No real investigations, law enforcement coordination, or emergency dispatch occurs through this prototype.
          </p>
        </section>
      </div>
    </div>
  );
}
