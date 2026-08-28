"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, EmptyState } from "@/components/ui";
import { MatchBreakdown, OpportunityCard, OpportunityCollection } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { toast } from "sonner";
import { getResearcherMatches } from "../_lib/helpers";

export default function ResearcherMatchesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const setMatchInterest = useAppStore((s) => s.setMatchInterest);
  const [view, setView] = useState("grid");
  const [selectedMatch, setSelectedMatch] = useState(null);
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
        <OpportunityCollection view={view} onViewChange={setView} count={userMatches.length} countLabel="matches">
          {userMatches.map((match) => {
            const opp = opportunities.find((o) => o.id === match.opportunityId);
            if (!opp) return null;
            return (
              <OpportunityCard
                key={match.id}
                opportunity={opp}
                matchScore={match.overallScore}
                view={view}
                onMatchBreakdown={() => setSelectedMatch(match)}
                actions={
                  <>
                    <Button size="sm" variant="outline" onClick={() => setSelectedMatch(match)}>
                      Breakdown
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
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
                  </>
                }
              />
            );
          })}
        </OpportunityCollection>
      )}

      {selectedMatch ? (
        <aside className="card-surface p-4">
          <h3 className="font-semibold">Match breakdown</h3>
          <MatchBreakdown
            className="mt-4"
            scoreResult={{
              total: selectedMatch.overallScore,
              breakdown: selectedMatch.scoreBreakdown,
              reasons: selectedMatch.reasons,
              gaps: selectedMatch.missingRequirements,
            }}
          />
        </aside>
      ) : null}
    </div>
  );
}
