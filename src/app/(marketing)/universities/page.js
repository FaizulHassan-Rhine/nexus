"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Badge, Select, Input, Pagination, EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { DIVISIONS } from "@/lib/constants";
import { INSTITUTION_TYPES, institutionTypeOf, institutionTypeValue } from "@/lib/ecosystem";

const PAGE_SIZE = 12;

export default function UniversitiesPage() {
  const universities = useAppStore((s) => s.universities);
  const opportunities = useAppStore((s) => s.opportunities);
  const [division, setDivision] = useState("");
  const [type, setType] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...universities];
    if (q) {
      const query = q.toLowerCase();
      items = items.filter((u) => u.name.toLowerCase().includes(query) || u.shortName?.toLowerCase().includes(query));
    }
    if (division) items = items.filter((u) => u.division === division);
    if (type) items = items.filter((u) => u.type === type);
    if (institutionType) items = items.filter((u) => institutionTypeValue(u) === institutionType);
    if (status) items = items.filter((u) => u.nexusStatus === status);
    return items;
  }, [universities, q, division, type, institutionType, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Universities" }]} />}
        title="Institution directory"
        description={`${filtered.length} educational institutions on the Nexus prototype — universities, colleges, schools, madrasas, polytechnics, and training centres.`}
      />

      <FilterBar className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" placeholder="Institution name..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <Select label="Institution type" value={institutionType} onChange={(e) => { setInstitutionType(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {INSTITUTION_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select label="Division" value={division} onChange={(e) => { setDivision(e.target.value); setPage(1); }}>
          <option value="">All divisions</option>
          {DIVISIONS.filter((d) => d !== "Remote").map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select label="Governance" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">Public & private</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </Select>
        <Select label="Nexus status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Any status</option>
          <option value="Active">Active</option>
          <option value="Onboarding">Onboarding</option>
        </Select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="No universities found" icon={<GraduationCap className="h-8 w-8" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((uni) => {
            const oppCount = opportunities.filter((o) =>
              o.departments?.some((d) => uni.departments?.includes(d))
            ).length;
            return (
              <Link key={uni.id} href={`/universities/${uni.slug}`} className="card-interactive block p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="teal">{institutionTypeOf(uni)}</Badge>
                  <Badge tone="slate">{uni.type}</Badge>
                  <Badge tone={uni.nexusStatus === "Active" ? "green" : "amber"}>{uni.nexusStatus}</Badge>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{uni.shortName || uni.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-secondary">{uni.name}</p>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  <span>{uni.division}</span>
                  <span>{uni.studentCount?.toLocaleString()} students</span>
                  <span>{oppCount}+ opportunities</span>
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
