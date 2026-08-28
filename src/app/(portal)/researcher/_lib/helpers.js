"use client";

export const RESEARCHER_OPPORTUNITY_TYPES = {
  research: ["Joint research", "Research assistantship", "Industry problem statement", "Research project"],
  grant: ["Research grant", "Fellowship", "Student project funding", "Startup support"],
  technology: ["Technology licensing"],
  collaboration: ["Joint research", "Industry problem statement", "Research assistantship", "Consultancy"],
};

export const APPLICATION_TABS = {
  Draft: ["Draft"],
  Active: [
    "Submitted",
    "University review",
    "Changes requested",
    "University approved",
    "Sent to organization",
    "Shortlisted",
    "In progress",
  ],
  Interviews: ["Interview scheduled"],
  Offers: ["Offered", "Accepted"],
  Completed: ["Completed"],
  Rejected: ["Rejected", "Withdrawn"],
};

export function getConversationParticipants(conversation) {
  return conversation.participantIds || conversation.participants || [];
}

export function getMessageTime(message) {
  return message.at || message.sentAt;
}

export function getNotificationLink(notification) {
  return notification.href || notification.link;
}

export function getResearcherMatches(matches, userId) {
  return matches
    .filter((m) => m.candidateId === userId)
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
}

export function getResearcherApplications(applications, userId) {
  return applications.filter((a) => a.applicantId === userId);
}

export function filterApplicationsByTab(applications, tab) {
  const statuses = APPLICATION_TABS[tab] || [];
  return applications.filter((a) => statuses.includes(a.status));
}

export function isResearcherOpportunity(opportunity) {
  if (!opportunity) return false;
  if (opportunity.targetRoles?.includes("researcher")) return true;
  const researcherTypes = Object.values(RESEARCHER_OPPORTUNITY_TYPES).flat();
  return researcherTypes.some((t) => opportunity.type === t);
}

export function filterResearcherOpportunities(opportunities, { category, q, department } = {}) {
  let items = opportunities.filter(isResearcherOpportunity);
  if (category && RESEARCHER_OPPORTUNITY_TYPES[category]) {
    const types = RESEARCHER_OPPORTUNITY_TYPES[category];
    items = items.filter((o) => types.includes(o.type));
  }
  if (department) {
    items = items.filter((o) => !o.departments?.length || o.departments.includes(department));
  }
  if (q) {
    const query = q.toLowerCase();
    items = items.filter(
      (o) =>
        o.title?.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }
  return items;
}

export function getResearcherProjects(projects, userId, user) {
  const linkedIds = new Set();
  (user?.currentProjects || []).forEach((p) => {
    const id = typeof p === "string" ? p : p.id;
    if (id) linkedIds.add(id);
  });
  return projects.filter(
    (p) =>
      p.ownerId === userId ||
      p.teamMembers?.includes(userId) ||
      p.team?.some((t) => t.userId === userId) ||
      linkedIds.has(p.id)
  );
}

export function getResearcherTechnologies(technologies, userId) {
  return technologies.filter((t) => t.facultyId === userId || t.ownerUserId === userId || t.researcherId === userId);
}

export function getResearcherDatasets(user, projects) {
  const entries = user?.datasets || [];
  return entries.map((ds) => {
    const project = projects.find((p) => p.id === ds.projectId);
    return {
      ...ds,
      projectTitle: project?.title || ds.projectTitle,
      department: user?.department,
      publishedAt: ds.publishedAt || ds.createdAt,
    };
  });
}

export function getResearcherCollaborations(matches, opportunities, applications, userId) {
  const userMatches = getResearcherMatches(matches, userId);
  const userApps = getResearcherApplications(applications, userId);
  const active = [];
  const pending = [];

  userMatches.forEach((m) => {
    const opp = opportunities.find((o) => o.id === m.opportunityId);
    if (!opp) return;
    const entry = { match: m, opportunity: opp, status: m.universityReviewStatus || "Pending" };
    if (["Approved", "Under review"].includes(m.organizationStatus) || m.universityReviewStatus === "Approved") {
      active.push(entry);
    } else {
      pending.push(entry);
    }
  });

  userApps
    .filter((a) => ["In progress", "University approved", "Sent to organization", "Shortlisted"].includes(a.status))
    .forEach((app) => {
      const opp = opportunities.find((o) => o.id === app.opportunityId);
      if (!opp) return;
      if (!active.some((c) => c.opportunity.id === opp.id)) {
        active.push({ application: app, opportunity: opp, status: app.status });
      }
    });

  return { active, pending };
}

export function grantDeadlines(opportunities, matches, limit = 5) {
  const grantTypes = RESEARCHER_OPPORTUNITY_TYPES.grant.concat(RESEARCHER_OPPORTUNITY_TYPES.research);
  const matchIds = new Set(matches.map((m) => m.opportunityId));
  return opportunities
    .filter((o) => (matchIds.has(o.id) || isResearcherOpportunity(o)) && grantTypes.includes(o.type) && o.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, limit);
}

export function matchDistribution(matches) {
  const bands = [
    { name: "90–100%", min: 90, max: 100, count: 0 },
    { name: "75–89%", min: 75, max: 89, count: 0 },
    { name: "60–74%", min: 60, max: 74, count: 0 },
    { name: "40–59%", min: 40, max: 59, count: 0 },
    { name: "0–39%", min: 0, max: 39, count: 0 },
  ];
  matches.forEach((m) => {
    const score = m.overallScore || 0;
    const band = bands.find((b) => score >= b.min && score <= b.max);
    if (band) band.count += 1;
  });
  return bands;
}

export function researcherCalendarEvents(user, applications, opportunities, projects) {
  const events = [];
  applications.forEach((app) => {
    if (app.interviewDetails?.date) {
      const opp = opportunities.find((o) => o.id === app.opportunityId);
      events.push({
        id: `int-${app.id}`,
        title: `Interview: ${opp?.title || "Application"}`,
        date: app.interviewDetails.date,
        type: "Interview",
      });
    }
    if (app.submittedAt) {
      const opp = opportunities.find((o) => o.id === app.opportunityId);
      events.push({
        id: `sub-${app.id}`,
        title: `Application: ${opp?.title || app.id}`,
        date: app.submittedAt,
        type: "Application",
      });
    }
  });
  opportunities
    .filter(isResearcherOpportunity)
    .forEach((o) => {
      if (o.deadline) {
        events.push({
          id: `deadline-${o.id}`,
          title: `Deadline: ${o.title}`,
          date: o.deadline,
          type: "Deadline",
        });
      }
    });
  projects.forEach((p) => {
    if (p.endDate) {
      events.push({
        id: `proj-end-${p.id}`,
        title: `Project milestone: ${p.title}`,
        date: p.endDate,
        type: "Research",
      });
    }
  });
  (user?.collaborationInterests || []).forEach((c, i) => {
    if (c.postedAt) {
      events.push({
        id: `collab-${i}`,
        title: `Collaboration: ${typeof c === "string" ? c : c.title || c}`,
        date: c.postedAt,
        type: "Collaboration",
      });
    }
  });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}
