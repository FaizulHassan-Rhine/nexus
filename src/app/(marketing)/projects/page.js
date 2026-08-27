"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderKanban } from "lucide-react";
import { Badge, Select, Input, Pagination, EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/lib/formatters";
import { DIVISIONS } from "@/lib/constants";

const PAGE_SIZE = 12;
const PROJECT_TYPES = [
  "Research project",
  "Industry challenge",
  "Innovation competition",
  "Startup opportunity",
  "Student project funding",
];

export default function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const universities = useAppStore((s) => s.universities);
  const organizations = useAppStore((s) => s.organizations);
  const [type, setType] = useState("");
  const [division, setDivision] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...projects];
    if (q) {
      const query = q.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
    }
    if (type) items = items.filter((p) => p.type === type);
    if (division) items = items.filter((p) => p.division === division);
    if (status) items = items.filter((p) => p.status === status);
    return items;
  }, [projects, q, type, division, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />}
        title="Projects & challenges"
        description="Student projects, industry challenges, research collaborations, competitions, and funding calls."
      />

      <FilterBar className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <Select label="Type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All types</option>
          {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          {[...new Set(projects.map((p) => p.type))].filter((t) => !PROJECT_TYPES.includes(t)).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select label="Division" value={division} onChange={(e) => { setDivision(e.target.value); setPage(1); }}>
          <option value="">All divisions</option>
          {DIVISIONS.filter((d) => d !== "Remote").map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Any status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </Select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="No projects found" icon={<FolderKanban className="h-8 w-8" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paginated.map((proj) => {
            const uni = universities.find((u) => u.id === proj.universityId);
            const org = organizations.find((o) => o.id === proj.organizationId);
            return (
              <article key={proj.id} className="card-interactive p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="teal">{proj.type}</Badge>
                  <Badge tone={proj.status === "Active" ? "green" : "slate"}>{proj.status}</Badge>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{proj.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-secondary">{proj.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  {uni ? <span>{uni.shortName}</span> : null}
                  {org ? <span>· {org.name}</span> : null}
                  <span>· {proj.division}</span>
                </div>
                {proj.fundingAmount ? (
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(proj.fundingAmount, proj.currency)} funding</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(proj.skills || []).slice(0, 4).map((s) => <Badge key={s} tone="slate">{s}</Badge>)}
                </div>
                {(proj.linkedOpportunityIds || []).length ? (
                  <Link href="/opportunities?type=Student%20project%20funding" className="mt-3 inline-block text-sm font-semibold text-nexus-700 dark:text-nexus-300">
                    View funding opportunity →
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-8" />
    </div>
  );
}
