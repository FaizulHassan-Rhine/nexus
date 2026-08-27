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
import {
  FACULTY_OPPORTUNITY_TYPES,
  filterFacultyOpportunities,
  getFacultyMatches,
} from "../_lib/helpers";

const FILTER_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "exchange", label: "Exchange" },
  { value: "visiting", label: "Visiting faculty" },
  { value: "research", label: "Research" },
  { value: "grant", label: "Grant" },
  { value: "consultancy", label: "Consultancy" },
  { value: "conference", label: "Conference funding" },
  { value: "attachment", label: "Industry attachment" },
  { value: "mentorship", label: "Mentorship" },
];

export default function FacultyOpportunitiesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const toggleSavedOpportunity = useAppStore((s) => s.toggleSavedOpportunity);

  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [applying, setApplying] = useState(null);

  const userMatches = useMemo(
    () => (user ? getFacultyMatches(matches, user.id) : []),
    [matches, user]
  );

  const filtered = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: category || undefined, q, department: department || undefined }),
    [opportunities, category, q, department]
  );

  const apply = async (opp) => {
    setApplying(opp.id);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        applicantRole: "faculty",
        answers: { researchPlan: "Aligned with faculty research profile on Nexus." },
      });
      toast.success(`Applied to ${opp.title}`);
      router.push("/faculty/applications");
    } finally {
      setApplying(null);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty opportunities"
        description="Exchange, research, grants, consultancy, conference funding, industry attachment, and mentorship"
      />

      <FilterBar>
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={FILTER_OPTIONS}
        />
        <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, tags..." />
        <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE" />
      </FilterBar>

      <p className="text-sm text-secondary">{filtered.length} opportunities · Categories: {Object.keys(FACULTY_OPPORTUNITY_TYPES).join(", ")}</p>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {filtered.map((o) => {
            const match = userMatches.find((m) => m.opportunityId === o.id);
            return (
              <div key={o.id} className="space-y-2">
                <OpportunityCard opportunity={o} matchScore={match?.overallScore} view="list" />
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

        <aside className="card-surface p-4">
          <h3 className="font-semibold">Match breakdown</h3>
          {selectedMatch ? (
            <MatchBreakdown
              scoreResult={{
                total: selectedMatch.overallScore,
                breakdown: selectedMatch.scoreBreakdown,
                reasons: selectedMatch.reasons,
                gaps: selectedMatch.missingRequirements,
              }}
              className="mt-4"
            />
          ) : (
            <p className="mt-3 text-sm text-secondary">Select an opportunity with a match score to view breakdown.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
