"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { Badge, Select, Input, Pagination, EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/lib/formatters";

const PAGE_SIZE = 12;

export default function CoursesPage() {
  const courses = useAppStore((s) => s.courses);
  const opportunities = useAppStore((s) => s.opportunities);
  const [pricing, setPricing] = useState("");
  const [provider, setProvider] = useState("");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState("");
  const [cert, setCert] = useState("");
  const [track, setTrack] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const providers = useMemo(() => [...new Set(courses.map((c) => c.providerName).filter(Boolean))].sort(), [courses]);
  const tracks = useMemo(() => [...new Set(courses.flatMap((c) => c.careerTracks || []))].sort(), [courses]);

  const filtered = useMemo(() => {
    let items = [...courses];
    if (q) {
      const query = q.toLowerCase();
      items = items.filter((c) => c.title.toLowerCase().includes(query) || c.skills?.some((s) => s.toLowerCase().includes(query)));
    }
    if (pricing === "free") items = items.filter((c) => !c.price?.amount);
    if (pricing === "paid") items = items.filter((c) => c.price?.amount > 0 && !c.price?.subsidizedAmount);
    if (pricing === "subsidized") items = items.filter((c) => c.price?.subsidizedAmount != null);
    if (provider) items = items.filter((c) => c.providerName === provider);
    if (level) items = items.filter((c) => c.skillLevel === level);
    if (mode) items = items.filter((c) => c.deliveryMode === mode);
    if (cert === "yes") items = items.filter((c) => c.certification);
    if (track) items = items.filter((c) => c.careerTracks?.includes(track));
    return items;
  }, [courses, q, pricing, provider, level, mode, cert, track]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Courses" }]} />}
        title="Course discovery"
        description="Free, paid, and subsidized courses with skill-gap relevance and linked opportunities."
      />

      <FilterBar className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Title or skill..." />
        <Select label="Pricing" value={pricing} onChange={(e) => { setPricing(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
          <option value="subsidized">Subsidized</option>
        </Select>
        <Select label="Provider" value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }}>
          <option value="">All providers</option>
          {providers.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Select label="Skill level" value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">Any level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </Select>
        <Select label="Delivery" value={mode} onChange={(e) => { setMode(e.target.value); setPage(1); }}>
          <option value="">Any mode</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </Select>
        <Select label="Certification" value={cert} onChange={(e) => { setCert(e.target.value); setPage(1); }}>
          <option value="">Any</option>
          <option value="yes">Certified programmes</option>
        </Select>
        <Select label="Career track" value={track} onChange={(e) => { setTrack(e.target.value); setPage(1); }}>
          <option value="">All tracks</option>
          {tracks.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState title="No courses found" icon={<BookOpen className="h-8 w-8" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((course) => {
            const linked = (course.linkedOpportunityIds || [])
              .map((id) => opportunities.find((o) => o.id === id))
              .filter(Boolean);
            return (
              <article key={course.id} className="card-interactive flex flex-col p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="teal">{course.type}</Badge>
                  {course.certification ? <Badge tone="green">Certificate</Badge> : null}
                  {!course.price?.amount ? <Badge tone="blue">Free</Badge> : course.price?.subsidizedAmount ? <Badge tone="violet">Subsidized</Badge> : null}
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{course.title}</h3>
                <p className="mt-1.5 text-sm text-secondary">{course.providerName} · {course.deliveryMode} · {course.duration}</p>
                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {course.price?.amount
                    ? course.price.subsidizedAmount
                      ? `${formatCurrency(course.price.subsidizedAmount)} (was ${formatCurrency(course.price.amount)})`
                      : formatCurrency(course.price.amount)
                    : "Free"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(course.skills || []).slice(0, 4).map((s) => <Badge key={s} tone="slate">{s}</Badge>)}
                </div>
                {linked.length ? (
                  <p className="mt-3 text-xs leading-relaxed text-secondary">
                    Unlocks eligibility for:{" "}
                    {linked.map((o) => (
                      <Link key={o.id} href={`/opportunities/${o.slug}`} className="font-medium text-nexus-700 dark:text-nexus-300">
                        {o.title}
                      </Link>
                    ))}
                  </p>
                ) : null}
                <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link href={`/opportunities?type=${encodeURIComponent(course.type)}&q=${encodeURIComponent(course.title)}`}>
                    <span className="inline-block text-sm font-semibold text-nexus-700 dark:text-nexus-300">View related listing →</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} className="mt-8" />
    </div>
  );
}
