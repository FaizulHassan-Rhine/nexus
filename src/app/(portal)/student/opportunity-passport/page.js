"use client";

import { PageHeader } from "@/components/ui";
import { Button, Switch, Badge } from "@/components/ui";
import { MatchScoreRing } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { computePassportStrength } from "../_lib/helpers";

export default function OpportunityPassportPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);

  const visibility = user?.passportVisibility || {
    publicProfile: true,
    showSkills: true,
    showProjects: true,
    showCgpa: user?.privacyPreferences?.showCgpa ?? false,
    showContact: user?.privacyPreferences?.showContact ?? true,
  };

  const strength = computePassportStrength(user);

  const setVisibility = (key, value) => {
    if (!user) return;
    const next = { ...visibility, [key]: value };
    updateProfile(user.id, {
      passportVisibility: next,
      privacyPreferences: {
        ...(user.privacyPreferences || {}),
        showCgpa: next.showCgpa,
        showContact: next.showContact,
      },
    });
    toast.success("Visibility updated");
  };

  const handlePrint = () => {
    window.print();
    toast.message("Opening print dialog");
  };

  if (!hydrated || !user) return null;

  return (
    <div className="space-y-6 print:space-y-4">
      <PageHeader
        title="Opportunity Passport"
        description="Your verified CV-style profile shared with organizations after university approval"
        actions={
          <>
            <Button variant="secondary" onClick={handlePrint}>Print / PDF</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 print:block">
        <aside className="card-surface space-y-4 p-4 print:hidden lg:col-span-1">
          <h3 className="font-semibold">Visibility controls</h3>
          <Switch label="Public profile" checked={visibility.publicProfile} onChange={(v) => setVisibility("publicProfile", v)} />
          <Switch label="Show skills" checked={visibility.showSkills} onChange={(v) => setVisibility("showSkills", v)} />
          <Switch label="Show projects" checked={visibility.showProjects} onChange={(v) => setVisibility("showProjects", v)} />
          <Switch label="Show CGPA" checked={visibility.showCgpa} onChange={(v) => setVisibility("showCgpa", v)} />
          <Switch label="Show contact" checked={visibility.showContact} onChange={(v) => setVisibility("showContact", v)} />
        </aside>

        <article className="card-surface p-6 lg:col-span-2 print:border-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-secondary">{user.programme}</p>
              <p className="text-sm text-secondary">{user.universityId?.replace("uni-", "").toUpperCase()} · {user.department}</p>
              {visibility.showContact ? (
                <p className="mt-2 text-sm">{user.email} · {user.phone}</p>
              ) : null}
            </div>
            <MatchScoreRing score={strength} size={80} />
          </div>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="mt-2 text-sm text-secondary">
              Final-year {user.department} student with interests in {(user.interests || []).slice(0, 3).join(", ")}.
              Seeking {((user.preferredOpportunityTypes || [])[0]) || "internship"} opportunities.
            </p>
          </section>

          {visibility.showSkills ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(user.skills || []).map((s) => (
                  <Badge key={s} tone="teal">{s} · {user.skillProficiency?.[s] || "—"}</Badge>
                ))}
              </div>
            </section>
          ) : null}

          {visibility.showCgpa && user.cgpa ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Academics</h3>
              <p className="text-sm">CGPA: {user.cgpa} · Expected graduation: {user.expectedGraduation}</p>
            </section>
          ) : null}

          {visibility.showProjects && user.projects?.length ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Projects</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {user.projects.map((p) => (
                  <li key={p.id}><strong>{p.title}</strong> — {p.role} ({p.year})</li>
                ))}
              </ul>
            </section>
          ) : null}

          {(user.certifications || []).length ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <ul className="mt-2 text-sm">
                {user.certifications.map((c, i) => (
                  <li key={i}>{c.name} — {c.issuer} ({formatDate(c.issuedAt)})</li>
                ))}
              </ul>
            </section>
          ) : null}

          {(user.awards || []).length ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Awards</h3>
              <ul className="mt-2 text-sm">
                {user.awards.map((a, i) => (
                  <li key={i}>{a.title} — {a.issuer} ({a.year})</li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </div>
  );
}
