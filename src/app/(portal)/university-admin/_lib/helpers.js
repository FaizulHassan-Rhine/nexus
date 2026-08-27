const INTERNSHIP_TYPES = ["Paid internship", "Unpaid internship", "Virtual internship", "Micro-internship", "Apprenticeship"];
const SCHOLARSHIP_TYPES = ["Scholarship", "Fellowship"];
const FACULTY_TYPES = ["Faculty exchange", "Consultancy", "Joint research", "Research grant"];

export function getUniversityId(user) {
  return user?.universityId || "uni-001";
}

export function filterByUniversity(items, uniId, key = "universityId") {
  return items.filter((item) => !item[key] || item[key] === uniId);
}

export function universityStudents(users, uniId) {
  return users.filter((u) => u.role === "student" && u.universityId === uniId);
}

export function universityFaculty(users, uniId) {
  return users.filter((u) => u.role === "faculty" && u.universityId === uniId);
}

export function pendingVerifications(users, uniId) {
  return users.filter(
    (u) => u.universityId === uniId && ["student", "faculty"].includes(u.role) && u.verificationStatus === "Pending"
  );
}

export function pendingMatches(matches, users, uniId) {
  const ids = new Set(universityStudents(users, uniId).concat(universityFaculty(users, uniId)).map((u) => u.id));
  return matches.filter((m) => ids.has(m.candidateId) && m.universityReviewStatus === "Pending");
}

export function buildReviewQueue(state, uniId) {
  const { users, matches, applications, opportunities, funding, technologies, scholarships } = state;
  const oppMap = Object.fromEntries(opportunities.map((o) => [o.id, o]));
  const items = [];

  pendingVerifications(users, uniId).forEach((u) => {
    items.push({
      key: `verification:${u.id}`,
      type: "verification",
      id: u.id,
      title: `${u.name} — profile verification`,
      subtitle: u.role,
      status: u.verificationStatus,
      priority: "Medium",
      createdAt: u.createdAt,
      entity: u,
    });
  });

  pendingMatches(matches, users, uniId).forEach((m) => {
    const candidate = users.find((u) => u.id === m.candidateId);
    const opp = oppMap[m.opportunityId];
    items.push({
      key: `match:${m.id}`,
      type: "match",
      id: m.id,
      title: `Match review — ${candidate?.name || m.candidateId}`,
      subtitle: opp?.title,
      status: m.universityReviewStatus,
      priority: (m.overallScore || 0) >= 85 ? "High" : "Medium",
      createdAt: m.createdAt,
      entity: m,
    });
  });

  applications
    .filter((a) => {
      const applicant = users.find((u) => u.id === a.applicantId);
      if (applicant?.universityId !== uniId) return false;
      const opp = oppMap[a.opportunityId];
      return INTERNSHIP_TYPES.includes(opp?.type) && ["University review", "Changes requested"].includes(a.status);
    })
    .forEach((a) => {
      items.push({
        key: `internship:${a.id}`,
        type: "internship",
        id: a.id,
        title: `Internship — ${oppMap[a.opportunityId]?.title || a.id}`,
        subtitle: users.find((u) => u.id === a.applicantId)?.name,
        status: a.status,
        priority: "High",
        createdAt: a.submittedAt || a.createdAt,
        entity: a,
      });
    });

  opportunities
    .filter((o) => o.universityId === uniId && o.verificationStatus === "Pending")
    .forEach((o) => {
      items.push({
        key: `opportunity:${o.id}`,
        type: "opportunity",
        id: o.id,
        title: o.title,
        subtitle: o.type,
        status: o.verificationStatus,
        priority: "Medium",
        createdAt: o.createdAt,
        entity: o,
      });
    });

  applications
    .filter((a) => {
      const applicant = users.find((u) => u.id === a.applicantId);
      if (applicant?.universityId !== uniId) return false;
      const opp = oppMap[a.opportunityId];
      return SCHOLARSHIP_TYPES.includes(opp?.type) && ["University review", "Changes requested"].includes(a.status);
    })
    .forEach((a) => {
      items.push({
        key: `scholarship:${a.id}`,
        type: "scholarship",
        id: a.id,
        title: `Scholarship docs — ${oppMap[a.opportunityId]?.title}`,
        subtitle: users.find((u) => u.id === a.applicantId)?.name,
        status: a.status,
        priority: "Medium",
        createdAt: a.submittedAt,
        entity: a,
      });
    });

  funding
    .filter((f) => f.universityId === uniId && ["University verification", "Submitted"].includes(f.status))
    .forEach((f) => {
      items.push({
        key: `funding:${f.id}`,
        type: "funding",
        id: f.id,
        title: `Funding — ${f.programme || f.id}`,
        subtitle: users.find((u) => u.id === f.studentId)?.name,
        status: f.status,
        priority: f.riskFlags?.length ? "High" : "Medium",
        createdAt: f.createdAt,
        entity: f,
      });
    });

  applications
    .filter((a) => {
      const applicant = users.find((u) => u.id === a.applicantId);
      if (applicant?.universityId !== uniId) return false;
      const opp = oppMap[a.opportunityId];
      return FACULTY_TYPES.includes(opp?.type) && ["University review", "Changes requested"].includes(a.status);
    })
    .forEach((a) => {
      items.push({
        key: `faculty-exchange:${a.id}`,
        type: "faculty-exchange",
        id: a.id,
        title: `Faculty — ${oppMap[a.opportunityId]?.title}`,
        subtitle: users.find((u) => u.id === a.applicantId)?.name,
        status: a.status,
        priority: "Medium",
        createdAt: a.submittedAt,
        entity: a,
      });
    });

  technologies
    .filter((t) => t.universityId === uniId && String(t.status).includes("review"))
    .forEach((t) => {
      items.push({
        key: `technology:${t.id}`,
        type: "technology",
        id: t.id,
        title: t.title,
        subtitle: t.type,
        status: t.status,
        priority: "Low",
        createdAt: t.createdAt,
        entity: t,
      });
    });

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function activeInternships(applications, opportunities, users, uniId) {
  const oppMap = Object.fromEntries(opportunities.map((o) => [o.id, o]));
  return applications.filter((a) => {
    const applicant = users.find((u) => u.id === a.applicantId);
    if (applicant?.universityId !== uniId) return false;
    const opp = oppMap[a.opportunityId];
    return INTERNSHIP_TYPES.includes(opp?.type) && ["Accepted", "In progress"].includes(a.status);
  });
}

export function collectSkillGaps(matches, users, uniId) {
  const ids = new Set(universityStudents(users, uniId).map((u) => u.id));
  const gaps = {};
  matches
    .filter((m) => ids.has(m.candidateId))
    .forEach((m) => {
      (m.missingRequirements || []).forEach((g) => {
        gaps[g] = (gaps[g] || 0) + 1;
      });
    });
  return Object.entries(gaps)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function universityDisputes(disputes, uniId) {
  return disputes.filter((d) => d.parties?.university === uniId && !["Resolved", "Closed"].includes(d.status));
}

export function mergeAssignment(item, assignments) {
  return { ...item, ...(assignments[item.key] || {}) };
}

export const REVIEW_TABS = [
  { id: "verification", label: "Verification" },
  { id: "match", label: "Match approval" },
  { id: "internship", label: "Internship" },
  { id: "opportunity", label: "Opportunity" },
  { id: "scholarship", label: "Scholarship docs" },
  { id: "funding", label: "Funding" },
  { id: "faculty-exchange", label: "Faculty exchange / consultancy" },
  { id: "technology", label: "Technology listing" },
];

export const DEFAULT_CHECKLIST = {
  verification: ["Identity document reviewed", "Institutional email confirmed", "Programme enrollment verified"],
  match: ["Score breakdown reviewed", "Sensitive attributes not used", "Student eligibility confirmed"],
  internship: ["Transcript verified", "Safety requirements checked", "Co-funding eligibility confirmed"],
  opportunity: ["Organization verified", "Compensation disclosed", "Role description appropriate"],
  scholarship: ["Financial need docs reviewed", "Academic standing confirmed", "Committee endorsement"],
  funding: ["Need-based documentation verified", "Split percentages valid", "Programme eligibility met"],
  "faculty-exchange": ["Faculty credentials verified", "Host institution confirmed", "MOU on file"],
  technology: ["IP status documented", "TRL assessment reviewed", "Faculty approval obtained"],
};
