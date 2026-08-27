"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Cpu } from "lucide-react";
import { Badge, Select, Input, Pagination, EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";

const PAGE_SIZE = 12;

export default function TechnologyMarketplacePage() {
  const technologies = useAppStore((s) => s.technologies);
  const universities = useAppStore((s) => s.universities);
  const [sector, setSector] = useState("");
  const [readiness, setReadiness] = useState("");
  const [university, setUniversity] = useState("");
  const [collab, setCollab] = useState("");
  const [ip, setIp] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const sectors = useMemo(() => [...new Set(technologies.map((t) => t.sector).filter(Boolean))].sort(), [technologies]);
  const ipStatuses = useMemo(() => [...new Set(technologies.map((t) => t.ipStatus).filter(Boolean))].sort(), [technologies]);
  const collabTypes = useMemo(() => {
    const set = new Set();
    technologies.forEach((t) => t.collaborationTypes?.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [technologies]);

  const filtered = useMemo(() => {
    let items = [...technologies];
    if (q) {
      const query = q.toLowerCase();
      items = items.filter((t) => t.title.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    }
    if (sector) items = items.filter((t) => t.sector === sector);
    if (readiness) items = items.filter((t) => t.readinessLevel?.includes(readiness));
    if (university) items = items.filter((t) => t.universityId === university);
    if (collab) items = items.filter((t) => t.collaborationTypes?.includes(collab));
    if (ip) items = items.filter((t) => t.ipStatus === ip);
    return items;
  }, [technologies, q, sector, readiness, university, collab, ip]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Technology marketplace" }]} />}
        title="Technology marketplace"
        description="University technologies, patents, prototypes, and licensing opportunities."
      />

      <FilterBar className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Title, capability, tag..." />
        <Select label="Sector" value={sector} onChange={(e) => { setSector(e.target.value); setPage(1); }}>
          <option value="">All sectors</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select label="Readiness (TRL)" value={readiness} onChange={(e) => { setReadiness(e.target.value); setPage(1); }}>
          <option value="">Any TRL</option>
          <option value="TRL 3">TRL 3</option>
          <option value="TRL 4">TRL 4</option>
          <option value="TRL 5">TRL 5</option>
          <option value="TRL 6">TRL 6</option>
        </Select>
        <Select label="University" value={university} onChange={(e) => { setUniversity(e.target.value); setPage(1); }}>
          <option value="">All universities</option>
          {universities.map((u) => <option key={u.id} value={u.id}>{u.shortName || u.name}</option>)}
        </Select>
        <Select label="Collaboration type" value={collab} onChange={(e) => { setCollab(e.target.value); setPage(1); }}>
          <option value="">Any type</option>
          {collabTypes.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select label="IP status" value={ip} onChange={(e) => { setIp(e.target.value); setPage(1); }}>
          <option value="">Any status</option>
          {ipStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="No technologies found" icon={<Cpu className="h-8 w-8" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paginated.map((tech) => {
            const uni = universities.find((u) => u.id === tech.universityId);
            return (
              <article key={tech.id} className="card-interactive p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="teal">{tech.type}</Badge>
                  <Badge tone="violet">{tech.sector}</Badge>
                  <Badge tone="slate">{tech.ipStatus}</Badge>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{tech.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-secondary">{tech.description}</p>
                <p className="mt-3 text-xs text-secondary">{uni?.shortName} · {tech.readinessLevel}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(tech.collaborationTypes || []).map((c) => <Badge key={c} tone="blue">{c}</Badge>)}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-secondary">{tech.licensingTerms}</p>
                {uni ? (
                  <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <Link href={`/universities/${uni.slug}`} className="text-sm font-semibold text-nexus-700 dark:text-nexus-300">
                      Contact via {uni.shortName} →
                    </Link>
                  </div>
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
