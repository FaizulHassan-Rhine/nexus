"use client";

import { useMemo } from "react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { OpportunityCard } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getStudentMatches } from "../_lib/helpers";

function DiscoverSection({ title, description, opportunities, matches, onMoreLikeThis, onNotInterested }) {
  if (!opportunities.length) return null;
  return (
    <section className="space-y-4">
      <SectionHeader title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {opportunities.map((opp) => {
          const match = matches.find((m) => m.opportunityId === opp.id);
          return (
            <div key={opp.id} className="space-y-2">
              <OpportunityCard opportunity={opp} matchScore={match?.overallScore} />
              <div className="flex gap-2 px-1">
                <Button size="sm" variant="soft" onClick={() => onMoreLikeThis(opp, match)}>
                  More like this
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onNotInterested(opp, match)}>
                  Not interested
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function DiscoverPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const setMatchInterest = useAppStore((s) => s.setMatchInterest);
  const recalculateMatchesForUser = useAppStore((s) => s.recalculateMatchesForUser);

  const userMatches = useMemo(
    () => (user ? getStudentMatches(matches, user.id) : []),
    [matches, user]
  );

  const matchMap = useMemo(() => {
    const map = new Map();
    userMatches.forEach((m) => map.set(m.opportunityId, m));
    return map;
  }, [userMatches]);

  const published = useMemo(
    () => opportunities.filter((o) => ["Published", "Open", "Active"].includes(o.status) || !o.status),
    [opportunities]
  );

  const sections = useMemo(() => {
    if (!user) return {};
    const byMatch = (ids) => ids.map((id) => published.find((o) => o.id === id)).filter(Boolean);
    const topIds = userMatches.slice(0, 6).map((m) => m.opportunityId);

    const careerGoals = published.filter((o) =>
      (user.careerGoals || []).some((g) =>
        (o.careerTracks || []).some((t) => t.toLowerCase().includes(g.toLowerCase().split(" ")[0]))
      )
    ).slice(0, 6);

    const financial = published.filter(
      (o) =>
        user.financialSupportNeed &&
        (o.fundingModel?.includes("UGC") || o.ugcProgrammeId || o.type?.includes("Scholarship") || Number(o.compensation?.amount) > 0)
    ).slice(0, 6);

    const nearYou = published.filter(
      (o) =>
        o.workMode !== "Remote" &&
        (o.division === user.preferredLocation || o.location === user.preferredLocation || user.locationPreferences?.includes(o.division))
    ).slice(0, 6);

    const remote = published.filter((o) => o.workMode === "Remote").slice(0, 6);

    const skillsUnlock = published.filter((o) => {
      const match = matchMap.get(o.id);
      return (match?.missingRequirements?.length || 0) > 0 && (match?.overallScore || 0) >= 50;
    }).slice(0, 6);

    const deadlines = [...published]
      .filter((o) => o.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);

    return {
      bestMatches: byMatch(topIds),
      careerGoals,
      financial,
      nearYou,
      remote,
      skillsUnlock,
      deadlines,
    };
  }, [user, published, userMatches, matchMap]);

  const handleMoreLikeThis = (opp, match) => {
    if (match) setMatchInterest(match.id, "More like this");
    if (user) recalculateMatchesForUser(user.id);
    toast.success(`We'll show more opportunities like "${opp.title}"`);
  };

  const handleNotInterested = (opp, match) => {
    if (match) setMatchInterest(match.id, "Not interested");
    toast.message(`"${opp.title}" hidden from recommendations`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Discover"
        description="Personalized opportunity sections based on your profile, matches, and journey stage"
      />

      <DiscoverSection
        title="Best matches for you"
        description="Highest-scoring opportunities from the Nexus match engine"
        opportunities={sections.bestMatches || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Aligned with career goals"
        description={`Based on: ${(user?.careerGoals || []).join(", ") || "your profile"}`}
        opportunities={sections.careerGoals || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Financial support"
        description="UGC co-funding, scholarships, and paid roles"
        opportunities={sections.financial || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Near you"
        description={`Opportunities in ${user?.preferredLocation || "your area"}`}
        opportunities={sections.nearYou || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Remote & flexible"
        description="Work from anywhere opportunities"
        opportunities={sections.remote || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Skills unlock"
        description="Close a skill gap to unlock stronger matches"
        opportunities={sections.skillsUnlock || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Closing soon"
        description="Apply before these deadlines pass"
        opportunities={sections.deadlines || []}
        matches={userMatches}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
    </div>
  );
}
