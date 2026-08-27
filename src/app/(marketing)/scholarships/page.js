"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Award } from "lucide-react";
import { Badge, Select, Input, Pagination, EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { MatchScoreRing } from "@/components/domain/Domain";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser } from "@/hooks/useApp";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { scoreStudentOpportunity } from "@/lib/matchEngine";

const PAGE_SIZE = 12;

export default function ScholarshipsPage() {
  const scholarships = useAppStore((s) => s.scholarships);
  const opportunities = useAppStore((s) => s.opportunities);
  const user = useCurrentUser();
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [funding, setFunding] = useState("");
  const [subject, setSubject] = useState("");
  const [langTest, setLangTest] = useState("");
  const [verified, setVerified] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const subjects = useMemo(() => [...new Set(scholarships.flatMap((s) => s.subjects || []))].sort(), [scholarships]);
  const countries = useMemo(() => [...new Set(scholarships.map((s) => s.country).filter(Boolean))].sort(), [scholarships]);

  const filtered = useMemo(() => {
    let items = scholarships.map((sch) => {
      const opp = opportunities.find((o) => o.id === sch.linkedOpportunityId);
      let matchScore = null;
      if (user?.role === "student" && opp) {
        matchScore = scoreStudentOpportunity(user, opp).total;
      }
      return { ...sch, linkedOpp: opp, matchScore };
    });
    if (q) {
      const query = q.toLowerCase();
      items = items.filter((s) => s.title.toLowerCase().includes(query) || s.providerName?.toLowerCase().includes(query));
    }
    if (country) items = items.filter((s) => s.country === country);
    if (level) items = items.filter((s) => s.degreeLevel === level);
    if (funding === "full") items = items.filter((s) => s.fundingType === "Full" || s.coverage?.tuition === 100);
    if (funding === "partial") items = items.filter((s) => s.fundingType === "Partial");
    if (subject) items = items.filter((s) => s.subjects?.includes(subject));
    if (langTest === "yes") items = items.filter((s) => s.languageTestRequired);
    if (langTest === "no") items = items.filter((s) => !s.languageTestRequired);
    if (verified === "yes") items = items.filter((s) => s.status === "Open");
    return items;
  }, [scholarships, opportunities, user, q, country, level, funding, subject, langTest, verified]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Scholarships" }]} />}
        title="Scholarships & grants"
        description={`${filtered.length} funding opportunities with eligibility match when signed in as a student.`}
      />

      <FilterBar className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <Select label="Country" value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select label="Degree level" value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">All levels</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Masters">Masters</option>
          <option value="PhD">PhD</option>
        </Select>
        <Select label="Funding" value={funding} onChange={(e) => { setFunding(e.target.value); setPage(1); }}>
          <option value="">Any coverage</option>
          <option value="full">Fully funded</option>
          <option value="partial">Partially funded</option>
        </Select>
        <Select label="Subject" value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }}>
          <option value="">All subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select label="Language test" value={langTest} onChange={(e) => { setLangTest(e.target.value); setPage(1); }}>
          <option value="">Any</option>
          <option value="yes">Required</option>
          <option value="no">Not required</option>
        </Select>
        <Select label="Status" value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }}>
          <option value="">Any</option>
          <option value="yes">Open & verified</option>
        </Select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="No scholarships found" icon={<Award className="h-8 w-8" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paginated.map((sch) => (
            <article key={sch.id} className="card-interactive p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="violet">{sch.fundingType || "Grant"}</Badge>
                    <Badge tone="slate">{sch.degreeLevel}</Badge>
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{sch.title}</h3>
                  <p className="mt-1.5 text-sm text-secondary">{sch.providerName} · {sch.country}</p>
                </div>
                {sch.matchScore != null ? <MatchScoreRing score={sch.matchScore} size={52} /> : null}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(sch.coverage?.totalBDT)} total coverage</p>
              <p className="mt-1 text-xs text-secondary">Deadline {formatDate(sch.deadline)} · Min CGPA {sch.minimumCgpa} · {(sch.requiredDocuments || []).length} documents</p>
              {sch.linkedOpp ? (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link href={`/opportunities/${sch.linkedOpp.slug}`} className="text-sm font-semibold text-nexus-700 dark:text-nexus-300">
                    View application →
                  </Link>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-8" />
    </div>
  );
}
