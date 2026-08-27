"use client";

import { useAppStore } from "@/store/useAppStore";

export const PIPELINE_COLUMNS = [
  { id: "new", label: "New", statuses: ["Submitted", "Sent to organization"] },
  { id: "university", label: "University review", statuses: ["University review", "Changes requested"] },
  { id: "approved", label: "Approved", statuses: ["University approved"] },
  { id: "shortlisted", label: "Shortlisted", statuses: ["Shortlisted"] },
  { id: "interview", label: "Interview", statuses: ["Interview scheduled"] },
  { id: "offer", label: "Offer", statuses: ["Offered"] },
  { id: "hired", label: "Hired", statuses: ["Accepted", "Completed", "In progress"] },
  { id: "rejected", label: "Rejected", statuses: ["Rejected", "Withdrawn"] },
];

export const ORG_TEAM_ROLES = [
  { id: "owner", label: "Owner", permissions: ["all"] },
  { id: "recruiter", label: "Recruiter", permissions: ["candidates", "pipeline", "interviews", "offers"] },
  { id: "programme-manager", label: "Programme manager", permissions: ["courses", "projects", "partnerships"] },
  { id: "finance", label: "Finance officer", permissions: ["co-funding", "payments"] },
  { id: "viewer", label: "Viewer", permissions: ["read"] },
];

export const COURSE_TYPES = ["Free course", "Paid course", "Subsidized course", "Bootcamp"];
export const SCHOLARSHIP_TYPES = ["Scholarship", "Fellowship"];
export const PROJECT_TYPES = ["Industry problem statement", "Student project funding", "Research grant", "Freelance project"];

export function getOrg(organizations, orgId) {
  return organizations.find((o) => o.id === orgId) || null;
}

export function getOrgOpportunities(opportunities, orgId) {
  return opportunities.filter((o) => o.organizationId === orgId);
}

export function getOrgOpportunityIds(opportunities, orgId) {
  return new Set(getOrgOpportunities(opportunities, orgId).map((o) => o.id));
}

export function getOrgApplications(applications, opportunities, orgId) {
  const oppIds = getOrgOpportunityIds(opportunities, orgId);
  return applications.filter((a) => oppIds.has(a.opportunityId));
}

export function getOrgMatches(matches, opportunities, orgId) {
  const oppIds = getOrgOpportunityIds(opportunities, orgId);
  return matches.filter((m) => oppIds.has(m.opportunityId));
}

export function getOrgFunding(funding, orgId) {
  return funding.filter((f) => f.organizationId === orgId);
}

export function getOrgPayments(payments, orgId, funding) {
  const fundIds = new Set(getOrgFunding(funding, orgId).map((f) => f.id));
  return payments.filter((p) => p.organizationId === orgId || fundIds.has(p.fundingRequestId));
}

export function getOrgProjects(projects, orgId) {
  return projects.filter((p) => p.organizationId === orgId);
}

export function getOrgCourses(courses, orgId) {
  return courses.filter((c) => c.providerId === orgId || c.organizationId === orgId);
}

export function getOrgDisputes(disputes, orgId) {
  return disputes.filter((d) => d.parties?.organization === orgId);
}

export function pipelineColumnForStatus(status) {
  return PIPELINE_COLUMNS.find((c) => c.statuses.includes(status)) || PIPELINE_COLUMNS[0];
}

export function getConsentedCandidates(users) {
  return users.filter(
    (u) =>
      (u.role === "student" || u.role === "faculty") &&
      u.privacyPreferences?.shareWithOrganizations !== false &&
      u.verificationStatus !== "Suspended"
  );
}

export function updateOrganization(orgId, updates) {
  useAppStore.setState({
    organizations: useAppStore.getState().organizations.map((o) =>
      o.id === orgId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    ),
  });
}

export function patchApplication(applicationId, updates) {
  useAppStore.setState({
    applications: useAppStore.getState().applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : a
    ),
  });
}

export function pauseOpportunity(opportunityId) {
  useAppStore.getState().editOpportunity(opportunityId, { status: "Paused" });
}

export function archiveOpportunity(opportunityId) {
  useAppStore.getState().editOpportunity(opportunityId, { status: "Archived", archivedAt: new Date().toISOString() });
}

export function duplicateOpportunity(opportunity) {
  const user = useAppStore.getState().getCurrentUser();
  const { id, slug, createdAt, publishedAt, metrics, ...rest } = opportunity;
  return useAppStore.getState().createOpportunity({
    ...rest,
    title: `${opportunity.title} (Copy)`,
    status: "Draft",
    metrics: { views: 0, applications: 0, saves: 0 },
    ownerUserId: user?.id,
  });
}

export function applicationsByStage(applications) {
  const stages = {};
  PIPELINE_COLUMNS.forEach((col) => {
    stages[col.label] = applications.filter((a) => col.statuses.includes(a.status)).length;
  });
  return stages;
}

export function getPartnerUniversities(universities, org) {
  return (org?.partnerUniversities || []).map((id) => universities.find((u) => u.id === id)).filter(Boolean);
}

export function getConversationParticipants(conversation) {
  return conversation.participantIds || conversation.participants || [];
}

export function getMessageTime(message) {
  return message.at || message.sentAt;
}

export function getNotificationLink(notification) {
  return notification.href || notification.link;
}

export function buildMatchScoreResult(match) {
  if (!match) return null;
  return {
    total: match.overallScore,
    breakdown: match.scoreBreakdown,
    reasons: match.reasons,
    gaps: match.missingRequirements,
    algorithmVersion: match.algorithmVersion,
  };
}

export function defaultOfferFromApplication(application, opportunity, org) {
  const amount = opportunity?.compensation?.amount || 18000;
  return {
    role: opportunity?.title || "Intern",
    startDate: opportunity?.startDate || "",
    compensation: amount,
    currency: opportunity?.compensation?.currency || "BDT",
    companySharePercent: opportunity?.ugcProgrammeId ? 50 : 100,
    ugcSharePercent: opportunity?.ugcProgrammeId ? 50 : 0,
    terms: "Standard internship terms with university oversight.",
    acceptanceDeadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    applicationId: application.id,
    organizationId: org?.id,
    organizationName: org?.name,
  };
}

export function canOrgRole(user, area) {
  const role = user?.orgTeamRole || "owner";
  const def = ORG_TEAM_ROLES.find((r) => r.id === role) || ORG_TEAM_ROLES[0];
  if (def.permissions.includes("all")) return true;
  if (def.permissions.includes("read") && area === "read") return true;
  return def.permissions.includes(area);
}
