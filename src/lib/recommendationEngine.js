import { scoreStudentOpportunity, scoreFacultyOpportunity, scoreResearcherOpportunity } from "./matchEngine.js";

function scoreForRole(candidate, opportunity) {
  if (candidate.role === "faculty" || candidate.role === "teacher") return scoreFacultyOpportunity(candidate, opportunity);
  if (candidate.role === "researcher") return scoreResearcherOpportunity(candidate, opportunity);
  return scoreStudentOpportunity(candidate, opportunity);
}

function daysUntil(deadline) {
  if (!deadline) return 999;
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function getSimilarOpportunities(opportunity, all = [], limit = 4) {
  if (!opportunity) return [];
  const skills = new Set((opportunity.requiredSkills || []).map((s) => s.toLowerCase()));
  const tags = new Set((opportunity.tags || []).map((t) => t.toLowerCase()));

  return all
    .filter((o) => o.id !== opportunity.id && o.status !== "Closed")
    .map((o) => {
      let score = 0;
      if (o.type === opportunity.type) score += 30;
      if (o.division === opportunity.division) score += 15;
      if (o.organizationId === opportunity.organizationId) score += 10;
      (o.requiredSkills || []).forEach((s) => {
        if (skills.has(String(s).toLowerCase())) score += 8;
      });
      (o.tags || []).forEach((t) => {
        if (tags.has(String(t).toLowerCase())) score += 5;
      });
      return { opportunity: o, score, reason: buildSimilarReason(opportunity, o) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildSimilarReason(base, candidate) {
  if (base.type === candidate.type) return `Same opportunity type: ${candidate.type}`;
  if ((base.requiredSkills || []).some((s) => (candidate.requiredSkills || []).includes(s))) {
    return "Overlapping required skills";
  }
  if (base.division === candidate.division) return `Also in ${candidate.division}`;
  return "Related programme area";
}

export function getRecommendationsForStudent(state, user, limit = 6) {
  const { opportunities, applications, savedOpportunityIds = [], matches } = state;
  const appliedIds = new Set(applications.filter((a) => a.applicantId === user.id).map((a) => a.opportunityId));
  const saved = new Set(savedOpportunityIds);

  return opportunities
    .filter((o) => o.status !== "Closed" && !appliedIds.has(o.id))
    .map((o) => {
      const match = scoreStudentOpportunity(user, o);
      const urgency = daysUntil(o.deadline) <= 14 ? 12 : daysUntil(o.deadline) <= 30 ? 6 : 0;
      const savedBoost = saved.has(o.id) ? 8 : 0;
      const popularity = (o.metrics?.applications || 0) > 20 ? 5 : (o.metrics?.saves || 0) > 10 ? 3 : 0;
      const featured = o.featured ? 6 : 0;
      const composite = match.total + urgency + savedBoost + popularity + featured;
      const reasons = [...match.reasons];
      if (urgency) reasons.push("Deadline approaching");
      if (saved.has(o.id)) reasons.push("Previously saved by you");
      if (featured) reasons.push("Featured on Nexus");
      return { opportunity: o, score: composite, matchScore: match.total, reason: reasons[0] || "Recommended for your profile" };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getRecommendationsForFaculty(state, user, limit = 6) {
  const { opportunities, applications } = state;
  const appliedIds = new Set(applications.filter((a) => a.applicantId === user.id).map((a) => a.opportunityId));
  const facultyTypes = ["Joint research", "Research grant", "Faculty exchange", "Consultancy", "Technology licensing"];

  return opportunities
    .filter((o) => facultyTypes.some((t) => o.type === t) && !appliedIds.has(o.id))
    .map((o) => {
      const match = scoreFacultyOpportunity(user, o);
      const grantBoost = o.type?.includes("grant") ? 8 : 0;
      const exchangeBoost = user.exchangePreference && o.type?.includes("exchange") ? 10 : 0;
      const composite = match.total + grantBoost + exchangeBoost;
      return {
        opportunity: o,
        score: composite,
        matchScore: match.total,
        reason: match.reasons[0] || "Collaboration opportunity for your research profile",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getRecommendationsForResearcher(state, user, limit = 6) {
  const { opportunities, applications } = state;
  const appliedIds = new Set(applications.filter((a) => a.applicantId === user.id).map((a) => a.opportunityId));
  const researcherTypes = ["Joint research", "Research grant", "Technology licensing", "Industry problem statement", "Fellowship"];

  return opportunities
    .filter((o) => researcherTypes.some((t) => o.type === t) && !appliedIds.has(o.id))
    .map((o) => {
      const match = scoreResearcherOpportunity(user, o);
      const datasetBoost = user.datasetPublishing && o.tags?.some((t) => /data|health|open/i.test(t)) ? 8 : 0;
      const collabBoost = (user.collaborationInterests || []).some((c) =>
        String(o.type).toLowerCase().includes(String(c).toLowerCase().split(" ")[0])
      )
        ? 6
        : 0;
      const composite = match.total + datasetBoost + collabBoost;
      return {
        opportunity: o,
        score: composite,
        matchScore: match.total,
        reason: match.reasons[0] || "Research collaboration aligned with your profile",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getRecommendationsForUser(state, user, limit = 6) {
  if (!user) return [];
  if (user.role === "faculty") return getRecommendationsForFaculty(state, user, limit);
  if (user.role === "researcher") return getRecommendationsForResearcher(state, user, limit);
  if (user.role === "student") return getRecommendationsForStudent(state, user, limit);
  return [];
}
