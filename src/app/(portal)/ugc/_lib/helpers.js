export function nationalStats(state) {
  const { universities, organizations, opportunities, applications, funding, disputes, tickets, users } = state;
  const students = users.filter((u) => u.role === "student").length;
  const activeFunding = funding.filter((f) => ["Active", "Under UGC review"].includes(f.status)).length;
  const openDisputes = disputes.filter((d) => !["Resolved", "Closed"].includes(d.status)).length;
  const openTickets = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status)).length;
  return {
    universities: universities.length,
    organizations: organizations.length,
    opportunities: opportunities.filter((o) => o.status === "Published" || o.status === "Open").length,
    applications: applications.length,
    students,
    activeFunding,
    openDisputes,
    openTickets,
    verifiedOrgs: organizations.filter((o) => o.verificationStatus === "Verified").length,
  };
}

export function cofundingQueue(funding) {
  return funding.filter((f) => ["Under UGC review", "Submitted", "University verification"].includes(f.status));
}

export function computeRiskAlerts(state) {
  const { organizations, funding, disputes, opportunities, riskActions } = state;
  const alerts = [];

  organizations
    .filter((o) => o.verificationStatus !== "Verified" && o.nexusStatus !== "Suspended")
    .slice(0, 5)
    .forEach((o) => {
      alerts.push({
        id: `risk-org-unverified-${o.id}`,
        severity: "Medium",
        category: "Organization verification",
        title: `${o.name} — verification pending`,
        explanation: `Organization registered ${o.createdAt ? "recently" : ""} but verificationStatus is ${o.verificationStatus}. Rule ORG-001: unverified orgs cannot receive co-funding.`,
        entityType: "organization",
        entityId: o.id,
      });
    });

  organizations
    .filter((o) => (o.riskScore || 0) >= 70 || o.paymentDelayCount >= 2)
    .forEach((o) => {
      alerts.push({
        id: `risk-org-payment-${o.id}`,
        severity: "High",
        category: "Payment compliance",
        title: `${o.name} — payment delay pattern`,
        explanation: `Rule PAY-003: ${o.paymentDelayCount || 2}+ stipend delays triggers compliance review. Linked disputes may escalate to UGC.`,
        entityType: "organization",
        entityId: o.id,
      });
    });

  funding
    .filter((f) => f.universityVerification?.status === "Approved" && f.ugcReview?.status === "Under review")
    .slice(0, 4)
    .forEach((f) => {
      alerts.push({
        id: `risk-funding-review-${f.id}`,
        severity: "Low",
        category: "Co-funding queue",
        title: `Funding ${f.id} awaiting UGC decision`,
        explanation: `Rule FUND-002: university verified on ${f.universityVerification?.at}. UGC review SLA is 10 working days.`,
        entityType: "funding",
        entityId: f.id,
      });
    });

  disputes
    .filter((d) => d.issueType?.includes("Unsafe") || d.issueType?.includes("Safety"))
    .forEach((d) => {
      alerts.push({
        id: `risk-safety-${d.id}`,
        severity: "Critical",
        category: "Student safety",
        title: `Safety dispute ${d.id}`,
        explanation: `Rule SAF-001: safety disputes auto-escalate if unresolved after 72h at university level.`,
        entityType: "dispute",
        entityId: d.id,
      });
    });

  opportunities
    .filter((o) => o.ugcProgrammeId && o.verificationStatus !== "Verified")
    .slice(0, 3)
    .forEach((o) => {
      alerts.push({
        id: `risk-opp-ugc-${o.id}`,
        severity: "Medium",
        category: "Programme compliance",
        title: `UGC programme opportunity unverified — ${o.title}`,
        explanation: `Rule PROG-004: opportunities tagged with UGC programme must be verified before students apply for co-funding.`,
        entityType: "opportunity",
        entityId: o.id,
      });
    });

  return alerts
    .filter((a) => !riskActions[a.id] || riskActions[a.id].action === "escalate")
    .map((a) => ({ ...a, action: riskActions[a.id] }));
}

export const DISPUTE_STAGES = ["Intake", "Under university review", "Under UGC review", "Investigation", "Mediation", "Resolved", "Closed"];

export const UGC_TEAM_ROLES = [
  "Director, Digital Skills",
  "Deputy Director",
  "Programme Manager",
  "Compliance Officer",
  "Payments Analyst",
  "Policy Lead",
  "Data Analyst",
];
