"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, FilterBar } from "@/components/ui";
import { Input, Select, Button } from "@/components/ui";
import { OpportunityCard, MatchBreakdown } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { toast } from "sonner";
import { getRecommendationsForResearcher } from "@/lib/recommendationEngine";
import {
  RESEARCHER_OPPORTUNITY_TYPES,
  filterResearcherOpportunities,
  getResearcherMatches,
} from "../_lib/helpers";

const FILTER_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "research", label: "Research" },
  { value: "grant", label: "Grant" },
  { value: "technology", label: "Technology" },
  { value: "collaboration", label: "Collaboration" },
];

export default function ResearcherOpportunitiesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const state = useAppStore();
  const opportunities = state.opportunities;
  const matches = state.matches;
  const toggleSavedOpportunity = useAppStore((s) => s.toggleSavedOpportunity);

  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [applying, setApplying] = useState(null);

  const userMatches = useMemo(
    () => (user ? getResearcherMatches(matches, user.id) : []),
    [matches, user]
  );

  const recommendations = useMemo(
    () => (user ? getRecommendationsForResearcher(state, user, 4) : []),
    [state, user]
  );

  const filtered = useMemo(
    () => filterResearcherOpportunities(opportunities, { category: category || undefined, q, department: department || undefined }),
    [opportunities, category, q, department]
  );

  const apply = async (opp) => {
    setApplying(opp.id);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        applicantRole: "researcher",
        answers: { researchPlan: "Aligned with researcher profile and collaboration interests on Nexus." },
      });
      toast.success(`Applied to ${opp.title}`);
      router.push("/researcher/applications");
    } finally {
      setApplying(null);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research opportunities"
        description="Grants, joint research, technology licensing, and collaboration calls"
      />

      {recommendations.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <p className="text-sm text-secondary">Suggestions from the Nexus recommendation engine based on your research profile</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map(({ opportunity: o, reason, matchScore }) => {
              const match = userMatches.find((m) => m.opportunityId === o.id);
              return (
                <div key={o.id} className="space-y-2">
                  <OpportunityCard opportunity={o} matchScore={match?.overallScore ?? matchScore} />
                  <p className="px-1 text-xs text-secondary">{reason}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <FilterBar>
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={FILTER_OPTIONS}
        />
        <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, tags..." />
        <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Public Health" />
      </FilterBar>

      <p className="text-sm text-secondary">
        {filtered.length} opportunities · Categories: {Object.keys(RESEARCHER_OPPORTUNITY_TYPES).join(", ")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((o) => {
          const match = userMatches.find((m) => m.opportunityId === o.id);
          return (
            <div key={o.id} className="space-y-2">
              <OpportunityCard opportunity={o} matchScore={match?.overallScore} />
              <div className="flex flex-wrap gap-2 px-1">
                <Button size="sm" loading={applying === o.id} onClick={() => apply(o)}>Apply</Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    toggleSavedOpportunity(o.id);
                    toast.success("Saved to list");
                  }}
                >
                  Save
                </Button>
                {match ? (
                  <Button size="sm" variant="outline" onClick={() => setSelectedMatch(match)}>
                    Match breakdown
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
        {!filtered.length && <p className="text-secondary">No opportunities match your filters.</p>}
      </div>

      {selectedMatch ? (
        <aside className="card-surface p-4">
          <h3 className="font-semibold">Match breakdown</h3>
          <MatchBreakdown
            scoreResult={{
              total: selectedMatch.overallScore,
              breakdown: selectedMatch.scoreBreakdown,
              reasons: selectedMatch.reasons,
              gaps: selectedMatch.missingRequirements,
            }}
            className="mt-4"
          />
        </aside>
      ) : null}
    </div>
  );
}
