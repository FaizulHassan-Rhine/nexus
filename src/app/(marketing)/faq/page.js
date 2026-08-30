"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Accordion, Input, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

const FAQ_ITEMS = [
  { id: "what-is-nexus", title: "What is Nexus?", content: "Nexus is a frontend prototype of Bangladesh's national digital education, skills, and opportunity hub — connecting students from universities, colleges, schools, madrasas, polytechnics and other institutions with teachers, faculty, researchers, companies, training providers, and UGC." },
  { id: "is-data-real", title: "Is the data real?", content: "No. All users, organizations, opportunities, and metrics in this prototype are simulated seed data for demonstration purposes." },
  { id: "match-scores", title: "How are match scores calculated?", content: "Scores use seven components: skills (30), eligibility (20), career fit (15), location (10), schedule (10), compensation (10), and track record (5). Sensitive attributes are never used. See the help article on match scores for details." },
  { id: "university-approval", title: "Why do applications need university approval?", content: "Most internships and scholarships require your university to review the match before it reaches the organization. This human-in-the-loop step protects students and maintains institutional oversight." },
  { id: "ugc-cofunding", title: "How does UGC co-funding work?", content: "Eligible paid internships split stipend costs 50/50 between the company and UGC. After university approval, a co-funding request is generated and milestone payments are released monthly upon verification." },
  { id: "demo-login", title: "How do I try the demo?", content: "Use demo123 as the password for any demo account on the login page — e.g. student@nexus.demo, faculty@nexus.demo, or company@nexus.demo." },
  { id: "tigerfed", title: "What is TIGERfed?", content: "TIGERfed is a mocked single sign-on flow simulating federated identity from Bangladeshi universities. It is clearly labeled as a simulation and does not connect to real systems." },
  { id: "helpdesk-sla", title: "What is the helpdesk SLA?", content: "The prototype targets 95% of support tickets answered within 24 hours, with escalation paths to university administrators and UGC for disputes." },
  { id: "report-safety", title: "How do I report a safety concern?", content: "Visit the Safety page for reporting paths. For urgent physical danger, contact local emergency services first." },
  { id: "identity-verify", title: "What identity documents are accepted?", content: "During registration you can submit a National ID Card, Birth Certificate, or Passport. Requirements follow age and account type: under-18 students typically use a birth certificate or passport; adult accounts use NID or passport. Documents in this prototype are metadata-only and not sent to a real verification bureau." },
  { id: "break-courses", title: "Can I study during vacations or semester breaks?", content: "Yes. The course catalogue includes year-round programmes plus short courses, workshops, bootcamps, language courses, and professional training scheduled for summer, winter, semester breaks, and other academic holidays." },
  { id: "remote-jobs", title: "Does Nexus list international remote jobs?", content: "Yes. Alongside jobs in Bangladesh, the marketplace includes international remote roles. Matching considers skills, education, experience, language proficiency, and career interests." },
];

export default function FaqPage() {
  const helpArticles = useAppStore((s) => s.helpArticles);
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    if (!q.trim()) return FAQ_ITEMS;
    const query = q.toLowerCase();
    return FAQ_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query)
    );
  }, [q]);

  const helpMatches = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    return (helpArticles || [])
      .filter((a) => a.title.toLowerCase().includes(query) || a.summary?.toLowerCase().includes(query))
      .slice(0, 5);
  }, [helpArticles, q]);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />}
        title="Frequently asked questions"
        description="Quick answers about the Nexus prototype. Search below or browse all topics."
      />

      <Input
        className="mx-auto mb-8 max-w-xl"
        placeholder="Search FAQ..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search FAQ"
      />

      {helpMatches.length ? (
        <div className="mb-8 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-sm font-medium">Matching help articles</p>
          <ul className="mt-2 space-y-1">
            {helpMatches.map((a) => (
              <li key={a.id}>
                <Link href={`/help/articles/${a.slug}`} className="text-sm text-nexus-700 dark:text-nexus-300">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Accordion items={items} />

      <div className="mt-10 text-center">
        <p className="text-secondary">Can&apos;t find your answer?</p>
        <Link href="/contact" className="mt-3 inline-block">
          <Button>Contact support</Button>
        </Link>
      </div>
    </div>
  );
}
