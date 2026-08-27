"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HelpCircle, LifeBuoy } from "lucide-react";
import { Badge, Input, Select, PageHeader, SectionHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

const TOPICS = ["Registration", "Profile", "Verification", "Matching", "UGC", "Applications", "Safety"];

export default function HelpPage() {
  const helpArticles = useAppStore((s) => s.helpArticles);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");

  const filtered = useMemo(() => {
    let items = [...(helpArticles || [])];
    if (q) {
      const query = q.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary?.toLowerCase().includes(query) ||
          a.content?.toLowerCase().includes(query)
      );
    }
    if (role) items = items.filter((a) => a.roles?.includes(role));
    if (topic) items = items.filter((a) => a.topics?.includes(topic));
    return items;
  }, [helpArticles, q, role, topic]);

  const popular = (helpArticles || []).filter((a) => a.popular);

  const categories = useMemo(() => {
    const map = {};
    (helpArticles || []).forEach((a) => {
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return Object.entries(map);
  }, [helpArticles]);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Help centre" }]} />}
        title="Help centre"
        description="Searchable knowledge base with role and topic filters. 95% SLA target within 24 hours."
      />

      <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
        <p className="text-sm font-medium text-green-900 dark:text-green-100">Emergency / safety escalation</p>
        <p className="mt-1 text-sm text-green-800 dark:text-green-200">
          If you are in immediate danger, contact local emergency services. For platform safety concerns, see{" "}
          <Link href="/safety" className="underline">Safety guidelines</Link> or{" "}
          <Link href="/contact" className="underline">contact support</Link>.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Input label="Search articles" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keywords..." />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="organization">Organization</option>
          <option value="university-admin">University admin</option>
          <option value="ugc">UGC</option>
        </Select>
        <Select label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <SectionHeader title="Popular articles" />
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popular.map((article) => (
          <Link key={article.id} href={`/help/articles/${article.slug}`} className="card-surface block p-4 transition hover:shadow-md">
            <Badge tone="teal">{article.category}</Badge>
            <h3 className="mt-2 font-semibold">{article.title}</h3>
            <p className="mt-1 text-sm text-secondary">{article.summary}</p>
          </Link>
        ))}
      </div>

      <SectionHeader title="Browse by category" />
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            type="button"
            onClick={() => setTopic("")}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {cat} ({count})
          </button>
        ))}
      </div>

      <SectionHeader
        title={`${filtered.length} articles`}
        actions={
          <Link href="/contact">
            <Button size="sm"><LifeBuoy className="h-4 w-4" />Open a ticket</Button>
          </Link>
        }
      />
      <ul className="space-y-3">
        {filtered.map((article) => (
          <li key={article.id}>
            <Link href={`/help/articles/${article.slug}`} className="card-surface flex items-start gap-3 p-4 transition hover:shadow-md">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-nexus-600" />
              <div>
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-secondary">{article.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(article.topics || []).map((t) => <Badge key={t} tone="slate">{t}</Badge>)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
