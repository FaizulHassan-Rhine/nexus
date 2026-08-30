import { universities } from "./universities.js";
import { organizations } from "./organizations.js";
import { users } from "./users.js";
import { opportunities } from "./opportunities.js";
import { courses } from "./courses.js";
import { scholarships } from "./scholarships.js";
import { projects } from "./projects.js";
import { technologies } from "./technologies.js";
import { applications } from "./applications.js";
import { matches } from "./matches.js";
import { fundingRequests, paymentRecords } from "./funding.js";
import { conversations } from "./messages.js";
import { tickets } from "./tickets.js";
import { disputes } from "./disputes.js";
import { notifications } from "./notifications.js";
import { auditEvents } from "./audit.js";
import { helpArticles } from "./helpArticles.js";
import { policies } from "./policies.js";
import { scoreStudentOpportunity, scoreFacultyOpportunity, scoreResearcherOpportunity } from "../lib/matchEngine.js";

export {
  universities,
  organizations,
  users,
  opportunities,
  courses,
  scholarships,
  projects,
  technologies,
  applications,
  matches,
  fundingRequests,
  paymentRecords,
  conversations,
  tickets,
  disputes,
  notifications,
  auditEvents,
  helpArticles,
  policies,
};

function computeMatches() {
  return matches.map((match) => {
    if (match.overallScore != null) return match;

    const candidate = users.find((u) => u.id === match.candidateId);
    const opportunity = opportunities.find((o) => o.id === match.opportunityId);
    if (!candidate || !opportunity) return match;

    const score =
      match.candidateRole === "faculty" || match.candidateRole === "teacher"
        ? scoreFacultyOpportunity(candidate, opportunity)
        : match.candidateRole === "researcher"
          ? scoreResearcherOpportunity(candidate, opportunity)
          : scoreStudentOpportunity(candidate, opportunity);

    return {
      ...match,
      overallScore: score.total,
      scoreBreakdown: score.breakdown,
      reasons: score.reasons,
      missingRequirements: score.gaps,
      suggestedCourses: score.recommendedActions,
      algorithmVersion: score.algorithmVersion,
    };
  });
}

export function buildSeedState() {
  const computedMatches = computeMatches();

  return {
    universities,
    organizations,
    users,
    opportunities,
    courses,
    scholarships,
    projects,
    technologies,
    applications,
    matches: computedMatches,
    funding: {
      requests: fundingRequests,
      payments: paymentRecords,
    },
    messages: conversations,
    tickets,
    disputes,
    notifications,
    audit: auditEvents,
    helpArticles,
    policies,
    erpIntegration: {
      connected: true,
      systemName: "BUET Mock ERP (simulated)",
      lastSync: "2026-08-27T06:00:00+06:00",
      syncStatus: "idle",
      mappings: [
        { nexusField: "studentId", erpField: "REG_NO", status: "mapped" },
        { nexusField: "programme", erpField: "PROG_CODE", status: "mapped" },
        { nexusField: "department", erpField: "DEPT_ID", status: "mapped" },
        { nexusField: "cgpa", erpField: "GPA_CUR", status: "mapped" },
        { nexusField: "facultyId", erpField: "EMP_ID", status: "mapped" },
      ],
      lastError: null,
      recordsSynced: 1247,
    },
    programmes: [
      { id: "prog-001", name: "50/50 Internship Co-Funding", status: "Active", budget: 50000000, used: 12500000 },
      { id: "prog-002", name: "Graduate Apprenticeship Support", status: "Active", budget: 20000000, used: 4200000 },
      { id: "prog-003", name: "Women in Technology Internship Support", status: "Active", budget: 15000000, used: 3100000 },
      { id: "prog-004", name: "Regional Talent Mobility Grant", status: "Active", budget: 10000000, used: 1800000 },
      { id: "prog-005", name: "Student Innovation Matching Grant", status: "Active", budget: 12000000, used: 2500000 },
      { id: "prog-006", name: "Certification and Employability Voucher", status: "Active", budget: 8000000, used: 1900000 },
      { id: "prog-007", name: "Faculty–Industry Research Grant", status: "Active", budget: 25000000, used: 6700000 },
    ],
    meta: {
      version: 1,
      generatedAt: new Date().toISOString(),
      counts: {
        universities: universities.length,
        organizations: organizations.length,
        users: users.length,
        opportunities: opportunities.length,
        courses: courses.length,
        scholarships: scholarships.length,
        projects: projects.length,
        technologies: technologies.length,
        applications: applications.length,
        matches: computedMatches.length,
        fundingRequests: fundingRequests.length,
        paymentRecords: paymentRecords.length,
        conversations: conversations.length,
        tickets: tickets.length,
        disputes: disputes.length,
        notifications: notifications.length,
        auditEvents: auditEvents.length,
        helpArticles: helpArticles.length,
      },
    },
  };
}
