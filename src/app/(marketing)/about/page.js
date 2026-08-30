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
          A frontend prototype of Bangladesh&apos;s national digital education, research, skills, and opportunity hub — connecting students, teachers, faculty, researchers, educational institutions, companies, training providers, and regulators such as UGC.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-12">
        <section>
          <h2 className="text-xl font-semibold">Mission</h2>
          <p className="mt-3 text-secondary">
            Nexus aims to reduce friction between talent and opportunity by providing a unified, verified marketplace with intelligent matching, institutional oversight, and transparent funding — covering education, short courses, language learning, internships, local jobs, international remote work, research, and industry–academia partnerships.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">The problem</h2>
          <p className="mt-3 text-secondary">
            Students across universities, colleges, schools, madrasas, polytechnics, and training institutes often discover internships and scholarships through informal networks. Organizations struggle to reach verified candidates. Institutions lack centralized visibility into placements. UGC co-funding rules exist but are hard to operationalize at scale.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Vision</h2>
          <p className="mt-3 text-secondary">
            A nationally coordinated digital hub where learners, educators, researchers, companies, and regulators can exchange opportunities related to education, skills, internships, employment, remote international jobs, research collaboration, scholarships, and industry–academia partnerships.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Governance model</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-secondary">
            <li><strong className="text-slate-800 dark:text-slate-200">Students & teachers</strong> — maintain Opportunity Passports with skills, institution type, language proficiency, and identity documents (NID, birth certificate, or passport).</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Faculty & researchers</strong> — collaborate on grants, exchanges, datasets, and technology transfer.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Organizations & training providers</strong> — verified before publishing jobs, courses, and professional programmes.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Educational institutions</strong> — universities, colleges, schools, madrasas, polytechnics, and training institutes review matches and applications.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">UGC and regulators</strong> — oversee co-funding programmes, disputes, audits, and national analytics.</li>
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
