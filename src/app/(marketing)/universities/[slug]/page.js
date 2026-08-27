"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, EmptyState, StatCard } from "@/components/ui";
import { OpportunityCard } from "@/components/domain/Domain";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

export default function UniversityDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const universities = useAppStore((s) => s.universities);
  const opportunities = useAppStore((s) => s.opportunities);
  const technologies = useAppStore((s) => s.technologies);
  const organizations = useAppStore((s) => s.organizations);

  const uni = universities.find((u) => u.slug === slug);
  const relatedOpps = opportunities.filter((o) =>
    o.departments?.some((d) => uni?.departments?.includes(d))
  ).slice(0, 6);
  const techList = technologies.filter((t) => t.universityId === uni?.id);

  const partnerOrgs = organizations.filter((o) =>
    o.partnerUniversities?.includes(uni?.id)
  ).slice(0, 8);

  if (!uni) {
    return (
      <div className="page-container py-20">
        <EmptyState title="University not found" action={<Link href="/universities"><Button>Browse directory</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Universities", href: "/universities" }, { label: uni.shortName || uni.name }]} />

      <header className="mt-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">{uni.type}</Badge>
          <Badge tone={uni.nexusStatus === "Active" ? "green" : "amber"}>{uni.nexusStatus}</Badge>
          <Badge tone="slate">Est. {uni.established}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{uni.name}</h1>
        <p className="mt-2 text-secondary">{uni.address} · {uni.division}</p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={uni.studentCount?.toLocaleString()} hint="Demo metric" tone="teal" />
        <StatCard label="Faculty" value={String(uni.facultyCount)} hint="Demo metric" tone="blue" />
        <StatCard label="Partnerships" value={String(uni.activePartnerships)} hint="Active on Nexus" tone="violet" />
        <StatCard label="Opportunities" value={String(uni.activeOpportunities)} hint="Linked listings" tone="green" />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="mt-3 max-w-3xl text-secondary">{uni.description}</p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="font-semibold">Departments on Nexus</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(uni.departments || []).map((d) => <Badge key={d} tone="slate">{d}</Badge>)}
          </div>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-semibold">Research strengths</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-secondary">
            {(uni.researchStrengths || []).map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      </section>

      {partnerOrgs.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Active partnerships</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {partnerOrgs.map((o) => (
              <Link key={o.id} href={`/organizations/${o.slug}`}>
                <Badge tone="teal">{o.name}</Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {techList.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Technology listings</h2>
          <ul className="mt-4 space-y-2">
            {techList.map((t) => (
              <li key={t.id}>
                <Link href={`/technology-marketplace?q=${encodeURIComponent(t.title)}`} className="text-sm text-nexus-700 dark:text-nexus-300">
                  {t.title} — {t.sector}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Related opportunities</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {relatedOpps.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
        </div>
      </section>

      <section className="mt-10 card-surface p-5">
        <h3 className="font-semibold">Nexus focal point</h3>
        <p className="mt-2 text-sm text-secondary">
          {uni.focalPoint?.name} · {uni.focalPoint?.email} · {uni.focalPoint?.phone}
        </p>
        <a href={uni.website} className="mt-2 inline-block text-sm text-nexus-700 dark:text-nexus-300" target="_blank" rel="noreferrer">{uni.website}</a>
      </section>
    </div>
  );
}
