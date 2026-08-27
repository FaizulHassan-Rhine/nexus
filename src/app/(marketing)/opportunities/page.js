"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, Suspense } from "react";
import { Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Pagination,
  EmptyState,
  FilterBar,
  PageHeader,
  Drawer,
} from "@/components/ui";
import { OpportunityCard } from "@/components/domain/Domain";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser } from "@/hooks/useApp";
import { filterOpportunities, parseSearchParams, buildSearchQuery } from "@/lib/opportunityFilters";
import { OPPORTUNITY_TYPES, DIVISIONS, DISCIPLINES, WORK_MODES } from "@/lib/constants";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const compareIds = useAppStore((s) => s.compareOpportunityIds || []);
  const organizations = useAppStore((s) => s.organizations);
  const clearCompare = useCallback(() => {
    useAppStore.setState({ compareOpportunityIds: [] });
  }, []);

  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const [filterDrawer, setFilterDrawer] = useState(false);

  const allSkills = useMemo(() => {
    const set = new Set();
    opportunities.forEach((o) => {
      o.requiredSkills?.forEach((s) => set.add(s));
      o.preferredSkills?.forEach((s) => set.add(s));
    });
    return [...set].sort();
  }, [opportunities]);

  const filtered = useMemo(
    () => filterOpportunities(opportunities, filters, user),
    [opportunities, filters, user]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilters = (overrides) => {
    router.push(`/opportunities${buildSearchQuery(filters, { ...overrides, page: overrides.page ?? 1 })}`);
  };

  const clearAll = () => router.push("/opportunities");

  const compareItems = compareIds
    .map((id) => opportunities.find((o) => o.id === id))
    .filter(Boolean);

  const filterFields = (
    <div className="contents">
      <Input
        label="Keyword"
        placeholder="Search title, skill, tag..."
        value={filters.q}
        onChange={(e) => updateFilters({ q: e.target.value })}
      />
      <Select label="Type" value={filters.type} onChange={(e) => updateFilters({ type: e.target.value })}>
        <option value="">All types</option>
        {OPPORTUNITY_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>
      <Select label="Study stage" value={filters.studyStage} onChange={(e) => updateFilters({ studyStage: e.target.value })}>
        <option value="">Any stage</option>
        <option value="first-year">First year</option>
        <option value="middle-years">Second/third year</option>
        <option value="final-year">Final year</option>
        <option value="alumni">Alumni</option>
      </Select>
      <Select label="Department" value={filters.department} onChange={(e) => updateFilters({ department: e.target.value })}>
        <option value="">All departments</option>
        {DISCIPLINES.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Select label="Skill" value={filters.skill} onChange={(e) => updateFilters({ skill: e.target.value })}>
        <option value="">Any skill</option>
        {allSkills.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Select label="Location" value={filters.division} onChange={(e) => updateFilters({ division: e.target.value })}>
        <option value="">All divisions</option>
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Select label="Work mode" value={filters.workMode} onChange={(e) => updateFilters({ workMode: e.target.value })}>
        <option value="">Any mode</option>
        {WORK_MODES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </Select>
      <Select label="Compensation" value={filters.paid} onChange={(e) => updateFilters({ paid: e.target.value })}>
        <option value="">Any</option>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid / volunteer</option>
      </Select>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Checkbox
          label="Verified only"
          checked={filters.verifiedOnly === "true"}
          onChange={(e) => updateFilters({ verifiedOnly: e.target.checked ? "true" : "" })}
        />
        <Checkbox
          label="UGC-supported only"
          checked={filters.ugcOnly === "true"}
          onChange={(e) => updateFilters({ ugcOnly: e.target.checked ? "true" : "" })}
        />
      </div>
    </div>
  );

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Opportunities" }]} />}
        title="Opportunity marketplace"
        description={`${filtered.length} opportunities from verified organizations. ${user?.role === "student" ? "Match scores shown for your profile." : "Sign in as a student to see match scores."}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setFilterDrawer(true)} className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
          </div>
        }
      />

      <FilterBar className="mb-6 hidden lg:grid lg:grid-cols-4 lg:gap-3">
        {filterFields}
      </FilterBar>

      <Drawer open={filterDrawer} onClose={() => setFilterDrawer(false)} title="Filters">
        <div className="grid gap-3">{filterFields}</div>
        <Button className="mt-4 w-full" onClick={() => setFilterDrawer(false)}>Apply filters</Button>
      </Drawer>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-secondary">
          Showing {paginated.length} of {filtered.length} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.sort} onChange={(e) => updateFilters({ sort: e.target.value })} className="w-auto min-w-[160px]">
            <option value="relevance">Sort: Relevance</option>
            <option value="deadline">Deadline</option>
            <option value="newest">Newest</option>
            <option value="compensation">Compensation</option>
            {user?.role === "student" ? <option value="match">Match score</option> : null}
          </Select>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              aria-label="Grid view"
              className={`p-2 ${filters.view === "grid" ? "bg-ocean text-white" : ""}`}
              onClick={() => updateFilters({ view: "grid" })}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              className={`p-2 ${filters.view === "list" ? "bg-ocean text-white" : ""}`}
              onClick={() => updateFilters({ view: "list" })}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          title="No opportunities match your filters"
          description="Try clearing filters or broadening your search."
          action={<Button onClick={clearAll}>Clear filters</Button>}
          icon={<Filter className="h-8 w-8" />}
        />
      ) : (
        <div className={filters.view === "list" ? "space-y-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
          {paginated.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} matchScore={opp.matchScore} view={filters.view} />
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={(p) => updateFilters({ page: p })} className="mt-8" />

      {compareItems.length > 0 ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-[#d5e3df] bg-cream p-4 shadow-xl dark:border-nexus-700 dark:bg-nexus-900">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Compare ({compareItems.length}/3)</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { clearCompare(); toast.message("Compare tray cleared"); }}>
                Clear
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {compareItems.map((opp) => {
              const org = organizations.find((o) => o.id === opp.organizationId);
              return (
                <div key={opp.id} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs dark:bg-slate-800">
                  <span className="max-w-[140px] truncate">{opp.title}</span>
                  <span className="text-secondary">· {org?.name}</span>
                  <Link href={`/opportunities/${opp.slug}`} className="text-nexus-700 dark:text-nexus-300">View</Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="page-container py-20 text-center text-secondary">Loading marketplace...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
