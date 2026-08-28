"use client";

import { useMemo, useState } from "react";
import { PageHeader, EmptyState } from "@/components/ui";
import { OpportunityCard, OpportunityCollection } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { getStudentMatches } from "../_lib/helpers";

export default function SavedPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const [view, setView] = useState("grid");
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const savedOpportunityIds = useAppStore((s) => s.savedOpportunityIds || []);

  const userMatches = useMemo(
    () => (user ? getStudentMatches(matches, user.id) : []),
    [matches, user]
  );

  const saved = useMemo(
    () => opportunities.filter((o) => savedOpportunityIds.includes(o.id)),
    [opportunities, savedOpportunityIds]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved opportunities"
        description={`${saved.length} opportunities in your watchlist`}
      />

      {saved.length ? (
        <OpportunityCollection view={view} onViewChange={setView} count={saved.length} countLabel="saved">
          {saved.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              matchScore={userMatches.find((m) => m.opportunityId === opp.id)?.overallScore}
              view={view}
            />
          ))}
        </OpportunityCollection>
      ) : (
        <EmptyState
          title="No saved opportunities"
          description="Save opportunities from Discover or Matches to review them later."
        />
      )}
    </div>
  );
}
