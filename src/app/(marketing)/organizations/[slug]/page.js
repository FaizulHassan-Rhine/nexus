"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, StatusBadge, EmptyState, StatCard } from "@/components/ui";
import { OpportunityCard } from "@/components/domain/Domain";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

export default function OrganizationDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const organizations = useAppStore((s) => s.organizations);
  const opportunities = useAppStore((s) => s.opportunities);
  const universities = useAppStore((s) => s.universities);

  const org = organizations.find((o) => o.slug === slug);
  const activeOpps = opportunities.filter((o) => o.organizationId === org?.id);
  const partners = (org?.partnerUniversities || [])
    .map((id) => universities.find((u) => u.id === id))
    .filter(Boolean);

  if (!org) {
    return (
      <div className="page-container py-20">
        <EmptyState title="Organization not found" action={<Link href="/organizations"><Button>Browse directory</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Organizations", href: "/organizations" }, { label: org.name }]} />

      <header className="mt-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">{org.type}</Badge>
          <StatusBadge status={org.verificationStatus} />
          {org.ugcCoFundingEligible ? <Badge tone="violet">UGC co-funding</Badge> : null}
          <Badge tone={org.riskLevel === "Low" ? "green" : "amber"}>Risk: {org.riskLevel}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{org.name}</h1>
        <p className="mt-2 text-secondary">{org.industry} · {org.size} employees · {org.headquarters?.address}</p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Rating" value={String(org.rating)} hint={`${org.complaintCount} complaints (aggregated)`} tone="amber" />
        <StatCard label="Interns hired" value={String(org.pastHiringMetrics?.internsHired || 0)} hint={`${Math.round((org.pastHiringMetrics?.conversionRate || 0) * 100)}% conversion`} tone="teal" />
        <StatCard label="Active listings" value={String(activeOpps.length)} hint="Published opportunities" tone="blue" />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="mt-3 max-w-3xl text-secondary">{org.about}</p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="font-semibold">Verification & safety</h3>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            <li>Status: {org.verificationStatus}</li>
            <li>Registration document: {org.registrationDocument?.name} ({org.registrationDocument?.status})</li>
            <li>Risk level: {org.riskLevel}</li>
            <li>Complaints: {org.complaintCount} (aggregated — individual cases not published)</li>
          </ul>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-semibold">Benefits & policies</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-secondary">
            {(org.benefits || []).map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </section>

      {partners.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Partner universities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {partners.map((u) => (
              <Link key={u.id} href={`/universities/${u.slug}`}>
                <Badge tone="slate">{u.shortName || u.name}</Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Active opportunities ({activeOpps.length})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {activeOpps.slice(0, 6).map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
        {activeOpps.length > 6 ? (
          <Link href={`/opportunities?q=${encodeURIComponent(org.name)}`} className="mt-4 inline-block text-sm text-nexus-700 dark:text-nexus-300">
            View all {activeOpps.length} listings →
          </Link>
        ) : null}
      </section>

      <section className="mt-10 card-surface p-5 text-sm">
        <h3 className="font-semibold">Contact</h3>
        <p className="mt-2 text-secondary">{org.email} · {org.phone}</p>
        <a href={org.website} className="text-nexus-700 dark:text-nexus-300" target="_blank" rel="noreferrer">{org.website}</a>
      </section>
    </div>
  );
}
