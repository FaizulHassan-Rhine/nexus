"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { Badge, Select, Input, Pagination, EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { ORGANIZATION_TYPES, DIVISIONS } from "@/lib/constants";

const PAGE_SIZE = 12;

export default function OrganizationsPage() {
  const organizations = useAppStore((s) => s.organizations);
  const opportunities = useAppStore((s) => s.opportunities);
  const [type, setType] = useState("");
  const [industry, setIndustry] = useState("");
  const [verified, setVerified] = useState("");
  const [division, setDivision] = useState("");
  const [ugc, setUgc] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const industries = useMemo(() => [...new Set(organizations.map((o) => o.industry).filter(Boolean))].sort(), [organizations]);

  const filtered = useMemo(() => {
    let items = [...organizations];
    if (q) {
      const query = q.toLowerCase();
      items = items.filter((o) => o.name.toLowerCase().includes(query) || o.about?.toLowerCase().includes(query));
    }
    if (type) items = items.filter((o) => o.type === type);
    if (industry) items = items.filter((o) => o.industry === industry);
    if (verified === "yes") items = items.filter((o) => o.verificationStatus === "Verified");
    if (division) items = items.filter((o) => o.headquarters?.division === division || o.operatingLocations?.includes(division));
    if (ugc === "yes") items = items.filter((o) => o.ugcCoFundingEligible);
    items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return items;
  }, [organizations, q, type, industry, verified, division, ugc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearAll = () => {
    setType("");
    setIndustry("");
    setVerified("");
    setDivision("");
    setUgc("");
    setQ("");
    setPage(1);
  };

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Organizations" }]} />}
        title="Organization directory"
        description={`${filtered.length} verified and pending partners in the Nexus prototype network.`}
        actions={<button type="button" className="text-sm text-nexus-700 dark:text-nexus-300" onClick={clearAll}>Clear all</button>}
      />

      <FilterBar className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Search" placeholder="Organization name..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <Select label="Type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All types</option>
          {ORGANIZATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Industry" value={industry} onChange={(e) => { setIndustry(e.target.value); setPage(1); }}>
          <option value="">All industries</option>
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </Select>
        <Select label="Verification" value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }}>
          <option value="">Any</option>
          <option value="yes">Verified only</option>
        </Select>
        <Select label="Location" value={division} onChange={(e) => { setDivision(e.target.value); setPage(1); }}>
          <option value="">All divisions</option>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select label="UGC programme" value={ugc} onChange={(e) => { setUgc(e.target.value); setPage(1); }}>
          <option value="">Any</option>
          <option value="yes">UGC co-funding eligible</option>
        </Select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="No organizations found" description="Try adjusting your filters." icon={<Building2 className="h-8 w-8" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((org) => {
            const activeCount = opportunities.filter((o) => o.organizationId === org.id).length;
            return (
              <Link key={org.id} href={`/organizations/${org.slug}`} className="card-interactive block p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="teal">{org.type}</Badge>
                  {org.verificationStatus === "Verified" ? <Badge tone="green">Verified</Badge> : null}
                  {org.ugcCoFundingEligible ? <Badge tone="violet">UGC</Badge> : null}
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{org.name}</h3>
                <p className="mt-1.5 text-sm text-secondary">{org.industry} · {org.headquarters?.division}</p>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-200">★ {org.rating}</span>
                  <span>{activeCount} active</span>
                  <span>Risk: {org.riskLevel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-8" />
    </div>
  );
}
