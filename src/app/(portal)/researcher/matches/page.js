"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { Button, Badge, EmptyState } from "@/components/ui";
import { MatchBreakdown, MatchScoreRing } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { getResearcherMatches } from "../_lib/helpers";

export default function ResearcherMatchesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const organizations = useAppStore((s) => s.organizations);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const setMatchInterest = useAppStore((s) => s.setMatchInterest);
  const [expanded, setExpanded] = useState(null);
  const [applying, setApplying] = useState(null);

  const userMatches = useMemo(
    () => (user ? getResearcherMatches(matches, user.id) : []),
    [matches, user]
  );

  const handleApply = async (match) => {
    const opp = opportunities.find((o) => o.id === match.opportunityId);
    if (!opp) return;
    const existing = applications.find(
      (a) => a.applicantId === user?.id && a.opportunityId === opp.id && a.status !== "Withdrawn"
    );
    if (existing) {
      toast.message("You already have an application for this opportunity");
      return;
    }
    setApplying(match.id);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        matchId: match.id,
        applicantRole: "researcher",
        answers: { researchPlan: "Collaboration aligned with researcher expertise on Nexus." },
      });
      setMatchInterest(match.id, "Applied");
      toast.success(`Applied to ${opp.title}`);
    } finally {
      setApplying(null);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your matches"
        description={`${userMatches.length} ranked opportunities based on your research profile`}
      />

      {!userMatches.length ? (
        <EmptyState title="No matches yet" description="Complete your profile and explore opportunities to generate matches." />
      ) : (
        <div className="space-y-4">
          {userMatches.map((match, idx) => {
            const opp = opportunities.find((o) => o.id === match.opportunityId);
            const org = organizations.find((o) => o.id === opp?.organizationId);
            if (!opp) return null;
            const isOpen = expanded === match.id;

            return (
              <article key={match.id} className="card-surface p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-100 text-sm font-bold text-nexus-800 dark:bg-nexus-950">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="teal">{opp.type}</Badge>
                        {match.universityReviewStatus && match.universityReviewStatus !== "Not reviewed" ? (
                          <Badge tone="violet">{match.universityReviewStatus}</Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold">
                        <Link href={`/opportunities/${opp.slug}`} className="hover:text-nexus-700">
                          {opp.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-secondary">{org?.name}</p>
                      <p className="mt-2 text-xs text-secondary">
                        {opp.location || opp.division} · {opp.workMode || "Flexible"} ·{" "}
                        {opp.deadline ? `Deadline ${formatDate(opp.deadline)}` : "Rolling"} ·{" "}
                        {opp.compensation?.amount ? formatCurrency(opp.compensation.amount) : opp.compensation?.label || "—"}
                      </p>
                      {match.fairnessNotes ? (
                        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{match.fairnessNotes}</p>
                      ) : null}
                    </div>
                  </div>
                  <MatchScoreRing score={match.overallScore ?? 0} size={72} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setExpanded(isOpen ? null : match.id)}>
                    {isOpen ? "Hide breakdown" : "View breakdown"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMatchInterest(match.id, "Interested");
                      toast.success("Marked as interested");
                    }}
                  >
                    Interested
                  </Button>
                  <Button size="sm" loading={applying === match.id} onClick={() => handleApply(match)}>
                    Apply now
                  </Button>
                </div>

                {isOpen ? (
                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <MatchBreakdown
                      scoreResult={{
                        total: match.overallScore,
                        breakdown: match.scoreBreakdown,
                        reasons: match.reasons,
                        gaps: match.missingRequirements,
                      }}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
