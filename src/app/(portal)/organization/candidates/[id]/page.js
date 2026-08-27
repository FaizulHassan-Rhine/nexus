"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, Textarea, Select, Badge, Avatar, StatusBadge } from "@/components/ui";
import { MatchBreakdown, ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  getOrgApplications,
  getOrgMatches,
  buildMatchScoreResult,
  patchApplication,
} from "../../_lib/helpers";

export default function CandidateDetailPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oppFilter = searchParams.get("opp");

  const users = useAppStore((s) => s.users);
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);

  const candidate = users.find((u) => u.id === params.id);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState(candidate?.orgNotes || {});

  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId).filter((a) => a.applicantId === params.id),
    [applications, opportunities, user, params.id]
  );
  const match = useMemo(() => {
    const orgMatches = getOrgMatches(matches, opportunities, user?.organizationId);
    const filtered = orgMatches.filter((m) => m.candidateId === params.id);
    if (oppFilter) return filtered.find((m) => m.opportunityId === oppFilter) || filtered[0];
    return filtered.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))[0];
  }, [matches, opportunities, user, params.id, oppFilter]);

  const updateStatus = async (appId, status) => {
    await applicationService.updateStatus(appId, status, notes || `Action by ${user?.name}`, user?.role);
    toast.success(`Status updated to ${status}`);
  };

  const saveNotes = () => {
    patchApplication(orgApps[0]?.id, { orgNotes: notes });
    setSavedNotes({ ...savedNotes, [params.id]: notes });
    toast.success("Notes saved");
  };

  if (!hydrated) return null;
  if (!candidate) {
    return (
      <div className="card-surface p-8 text-center">
        <p>Candidate not found or profile not shared.</p>
        <Button className="mt-4" onClick={() => router.push("/organization/candidates")}>Back</Button>
      </div>
    );
  }

  const passportStrength = Math.min(100, (candidate.profileCompletion || 0) + (candidate.skills?.length || 0) * 2);

  return (
    <div className="space-y-8">
      <PageHeader
        title={candidate.name}
        description={`${candidate.programme || candidate.role} · ${candidate.universityId ? "University verified" : ""}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/organization/messages")}>Message</Button>
            <Button onClick={() => orgApps[0] && updateStatus(orgApps[0].id, "Shortlisted")}>Shortlist</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-4 lg:col-span-1">
          <div className="flex items-center gap-4">
            <Avatar name={candidate.name} src={candidate.avatar} size="lg" />
            <div>
              <Badge tone={candidate.verificationStatus === "Verified" ? "green" : "amber"}>{candidate.verificationStatus}</Badge>
              <p className="mt-1 text-sm text-secondary">{candidate.email}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div><dt className="text-secondary">Programme</dt><dd>{candidate.programme || "—"}</dd></div>
            <div><dt className="text-secondary">Year</dt><dd>{candidate.currentYear || "—"}</dd></div>
            <div><dt className="text-secondary">Availability</dt><dd>{candidate.weeklyAvailability || 20} hours/week</dd></div>
            <div><dt className="text-secondary">Passport strength</dt><dd>{passportStrength}%</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-1">
            {(candidate.skills || []).map((s) => (
              <Badge key={s} tone="slate">{s}</Badge>
            ))}
          </div>
        </div>

        <div className="card-surface p-4 lg:col-span-2">
          <SectionHeader title="Match explanation" description={match ? `For ${opportunities.find((o) => o.id === match.opportunityId)?.title}` : "No match data"} />
          {match ? (
            <MatchBreakdown scoreResult={buildMatchScoreResult(match)} className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-secondary">Publish opportunities to generate match scores.</p>
          )}
        </div>
      </div>

      <section className="card-surface p-4">
        <SectionHeader title="Opportunity Passport preview" description="Privacy-safe fields shared with your organization" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="font-medium">Bio</p>
            <p className="text-secondary">{candidate.bio || "Not provided"}</p>
          </div>
          <div>
            <p className="font-medium">Certifications</p>
            <ul className="text-secondary">
              {(candidate.certifications || []).slice(0, 3).map((c) => (
                <li key={c.name}>{c.name} — {c.issuer}</li>
              ))}
              {!candidate.certifications?.length && <li>None listed</li>}
            </ul>
          </div>
          <div>
            <p className="font-medium">Permitted documents</p>
            <ul className="text-secondary">
              {(candidate.documents || []).filter((d) => d.sharedWithOrganizations !== false).map((d) => (
                <li key={d.name}>{d.name} ({d.type})</li>
              ))}
              {!candidate.documents?.length && <li>CV and transcript if application submitted</li>}
            </ul>
          </div>
          <div>
            <p className="font-medium">Projects</p>
            <ul className="text-secondary">
              {(candidate.projects || []).slice(0, 2).map((p) => (
                <li key={p.title || p}>{p.title || p}</li>
              ))}
              {!candidate.projects?.length && <li>—</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="card-surface p-4">
        <SectionHeader title="Applications to your organization" />
        {orgApps.length ? (
          <ul className="mt-4 space-y-4">
            {orgApps.map((app) => {
              const opp = opportunities.find((o) => o.id === app.opportunityId);
              return (
                <li key={app.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{opp?.title}</p>
                      <p className="text-xs text-secondary">Submitted {formatDate(app.submittedAt)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <ApplicationTimeline events={app.timeline || []} className="mt-4" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Select
                      label="Update status"
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      options={[
                        { value: "Shortlisted", label: "Shortlist" },
                        { value: "Interview scheduled", label: "Interview" },
                        { value: "Offered", label: "Offer" },
                        { value: "Rejected", label: "Reject" },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-secondary">No applications yet — invite from candidate pool.</p>
        )}
      </section>

      <section className="card-surface p-4">
        <SectionHeader title="Internal notes" />
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Recruiter notes (internal only)" />
        <Button className="mt-2" size="sm" onClick={saveNotes}>Save notes</Button>
      </section>
    </div>
  );
}
