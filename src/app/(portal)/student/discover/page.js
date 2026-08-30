"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { OpportunityCard, OpportunityCollection, OpportunityViewToggle } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getStudentMatches } from "../_lib/helpers";
import { getRecommendationsForStudent } from "@/lib/recommendationEngine";

function DiscoverSection({ title, description, opportunities, matches, reasonsById = {}, view, onMoreLikeThis, onNotInterested }) {
  if (!opportunities.length) return null;
  return (
    <section className="space-y-4">
      <SectionHeader title={title} description={description} />
      <OpportunityCollection view={view} showToolbar={false}>
        {opportunities.map((opp) => {
          const match = matches.find((m) => m.opportunityId === opp.id);
          const reason = reasonsById[opp.id];
          return (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              matchScore={match?.overallScore ?? reasonsById[`score-${opp.id}`]}
              view={view}
              actions={
                <>
                  {reason ? <p className="w-full text-xs text-secondary">{reason}</p> : null}
                  <Button size="sm" variant="soft" onClick={() => onMoreLikeThis(opp, match)}>
                    More like this
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onNotInterested(opp, match)}>
                    Not interested
                  </Button>
                </>
              }
            />
          );
        })}
      </OpportunityCollection>
    </section>
  );
}

export default function DiscoverPage() {
  const hydrated = useHydrated();
  const [view, setView] = useState("grid");
  const user = useCurrentUser();
  const state = useAppStore();
  const opportunities = state.opportunities;
  const matches = state.matches;
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

    const remote = published.filter((o) => o.workMode === "Remote" && o.type !== "International remote job" && o.geographicScope !== "international-remote").slice(0, 6);
    const internationalRemote = published.filter(
      (o) => o.type === "International remote job" || o.geographicScope === "international-remote"
    ).slice(0, 6);
    const languageLearning = published.filter((o) => String(o.type || "").toLowerCase().includes("language") || o.tags?.some((t) => String(t).toLowerCase().includes("language"))).slice(0, 6);
    const localJobs = published.filter(
      (o) =>
        ["Part-time job", "Full-time job", "Paid internship", "Campus job"].includes(o.type) &&
        o.geographicScope !== "international-remote"
    ).slice(0, 6);

    const skillsUnlock = published.filter((o) => {
      const match = matchMap.get(o.id);
      return (match?.missingRequirements?.length || 0) > 0 && (match?.overallScore || 0) >= 50;
    }).slice(0, 6);

    const deadlines = [...published]
      .filter((o) => o.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);

    const recommended = getRecommendationsForStudent(state, user, 6);

    return {
      recommended,
      bestMatches: byMatch(topIds),
      careerGoals,
      financial,
      nearYou,
      remote,
      internationalRemote,
      languageLearning,
      localJobs,
      skillsUnlock,
      deadlines,
    };
  }, [user, published, userMatches, matchMap, state]);

  const recommendedReasons = useMemo(() => {
    const map = {};
    (sections.recommended || []).forEach((r) => {
      map[r.opportunity.id] = r.reason;
      map[`score-${r.opportunity.id}`] = r.matchScore;
    });
    return map;
  }, [sections.recommended]);

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
        description="Local jobs in Bangladesh, international remote roles, language programmes, and short courses matched to your skills, education, and interests"
        actions={<OpportunityViewToggle view={view} onViewChange={setView} />}
      />

      <DiscoverSection
        title="Recommended for you"
        description="Personalized suggestions from the Nexus recommendation engine"
        opportunities={(sections.recommended || []).map((r) => r.opportunity)}
        matches={userMatches}
        reasonsById={recommendedReasons}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Best matches for you"
        description="Highest-scoring opportunities from the Nexus match engine"
        opportunities={sections.bestMatches || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Aligned with career goals"
        description={`Based on: ${(user?.careerGoals || []).join(", ") || "your profile"}`}
        opportunities={sections.careerGoals || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Financial support"
        description="UGC co-funding, scholarships, and paid roles"
        opportunities={sections.financial || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Near you"
        description={`Opportunities in ${user?.preferredLocation || "your area"}`}
        opportunities={sections.nearYou || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Local jobs & internships"
        description="Opportunities based in Bangladesh, matched to your education and skills"
        opportunities={sections.localJobs || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="International remote jobs"
        description="Remote roles abroad matched on skills, language proficiency, and career interests"
        opportunities={sections.internationalRemote || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Language programmes"
        description="Language courses and related opportunities for academic, professional, or international pathways"
        opportunities={sections.languageLearning || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Remote & flexible"
        description="Work-from-anywhere listings within the Nexus network"
        opportunities={sections.remote || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Skills unlock"
        description="Close a skill gap to unlock stronger matches"
        opportunities={sections.skillsUnlock || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
      <DiscoverSection
        title="Closing soon"
        description="Apply before these deadlines pass"
        opportunities={sections.deadlines || []}
        matches={userMatches}
        view={view}
        onMoreLikeThis={handleMoreLikeThis}
        onNotInterested={handleNotInterested}
      />
    </div>
  );
}
