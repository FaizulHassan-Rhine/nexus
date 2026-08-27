export const metadata = {
  title: "About Nexus",
  description: "Mission, governance, and trust principles of Bangladesh's National Digital Matchmaking Hub prototype.",
};

export default function AboutPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About Nexus</h1>
        <p className="mt-3 text-secondary">
          A frontend prototype of Bangladesh&apos;s national opportunity-matching ecosystem — connecting students, faculty, universities, organizations, and UGC.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-12">
        <section>
          <h2 className="text-xl font-semibold">Mission</h2>
          <p className="mt-3 text-secondary">
            Nexus aims to reduce friction between talent and opportunity by providing a unified, verified marketplace with intelligent matching, university oversight, and transparent funding mechanisms — starting with internships, scholarships, courses, research, and technology transfer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">The problem</h2>
          <p className="mt-3 text-secondary">
            Students often discover internships and scholarships through informal networks. Organizations struggle to reach verified candidates across divisions. Universities lack centralized visibility into placements and co-funded programmes. UGC co-funding rules exist but are hard to operationalize at scale.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Vision</h2>
          <p className="mt-3 text-secondary">
            A nationally coordinated digital hub where every eligible student can discover explainable matches, every verified organization can post opportunities with compliance built in, and every partner university maintains human-in-the-loop approval before candidates reach employers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Governance model</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-secondary">
            <li><strong className="text-slate-800 dark:text-slate-200">Students & faculty</strong> — maintain Opportunity Passports with skills, preferences, and documents.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Organizations</strong> — verified before publishing; subject to complaint aggregation and risk scoring.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Universities</strong> — review matches and applications; focal points for each institution.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">UGC</strong> — oversees co-funding programmes, disputes, audits, and national analytics.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Helpdesk</strong> — 95% SLA target within 24 hours with escalation paths.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Student lifecycle</h2>
          <p className="mt-3 text-secondary">
            Nexus supports learners from first year through alumni: financial support and part-time work early on; training, projects, and mentoring in middle years; internships, jobs, and scholarships in final year; reskilling, mentoring, and entrepreneurship for graduates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Human-in-the-loop matching</h2>
          <p className="mt-3 text-secondary">
            Algorithmic scores suggest fit — they do not auto-place candidates. University administrators review matches before organizations receive applications. Students see breakdowns, gaps, and recommended courses to improve eligibility.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">UGC role</h2>
          <p className="mt-3 text-secondary">
            UGC co-funding programmes (such as 50/50 internship stipends) are embedded in opportunity listings. Funding requests, milestone payments, and audit trails are simulated in this prototype to demonstrate end-to-end workflow.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Trust principles</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-secondary">
            <li>Verification before publication for organizations and sensitive roles</li>
            <li>Explainable match scores — no scoring on religion, ethnicity, or political affiliation</li>
            <li>Audit events for login, applications, funding, and disputes</li>
            <li>Aggregated complaint data — not individual smear listings</li>
            <li>Privacy controls on student profiles</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Prototype disclaimer</h2>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            This is a frontend-only demonstration. All users, organizations, opportunities, and metrics are simulated seed data. No real placements, payments, or government endorsements are implied.
          </p>
        </section>
      </div>
    </div>
  );
}
