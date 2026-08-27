"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";

export default function HelpArticlePage() {
  const params = useParams();
  const slug = params.slug;
  const helpArticles = useAppStore((s) => s.helpArticles);

  const article = (helpArticles || []).find((a) => a.slug === slug);
  const related = (helpArticles || [])
    .filter((a) => a.id !== article?.id && a.category === article?.category)
    .slice(0, 4);

  if (!article) {
    return (
      <div className="page-container py-20">
        <EmptyState title="Article not found" action={<Link href="/help"><Button>Back to help centre</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Help", href: "/help" },
          { label: article.title },
        ]}
      />

      <article className="mx-auto mt-6 max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">{article.category}</Badge>
          {(article.roles || []).map((r) => <Badge key={r} tone="slate">{r}</Badge>)}
        </div>
        <h1 className="mt-4 text-3xl font-semibold">{article.title}</h1>
        <p className="mt-2 text-secondary">{article.summary}</p>
        <p className="mt-1 text-xs text-secondary">Updated {formatDate(article.updatedAt || article.createdAt)}</p>

        <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
          {article.content.split("\n").map((line, idx) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <h3 key={idx} className="mt-4 font-semibold">{line.replace(/\*\*/g, "")}</h3>;
            }
            if (line.startsWith("- ")) {
              return <li key={idx} className="ml-4 text-secondary">{line.slice(2)}</li>;
            }
            if (line.match(/^\d+\./)) {
              return <li key={idx} className="ml-4 list-decimal text-secondary">{line.replace(/^\d+\.\s*/, "")}</li>;
            }
            if (!line.trim()) return <br key={idx} />;
            return <p key={idx} className="text-secondary">{line}</p>;
          })}
        </div>

        {related.length ? (
          <section className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
            <h2 className="font-semibold">Related articles</h2>
            <ul className="mt-3 space-y-2">
              {related.map((a) => (
                <li key={a.id}>
                  <Link href={`/help/articles/${a.slug}`} className="text-sm text-nexus-700 dark:text-nexus-300">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium">Still need help?</p>
          <p className="mt-1 text-sm text-secondary">Open a support ticket — 95% answered within 24 hours (prototype SLA).</p>
          <Link href="/contact" className="mt-3 inline-block">
            <Button size="sm">Contact support</Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
