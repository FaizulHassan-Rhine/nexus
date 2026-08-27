"use client";

export const FACULTY_OPPORTUNITY_TYPES = {
  exchange: ["Faculty exchange", "Exchange programme"],
  visiting: ["Teaching assistantship", "Visiting faculty"],
  research: ["Joint research", "Research assistantship", "Industry problem statement", "Research project"],
  grant: ["Research grant", "Fellowship", "Student project funding", "Startup support"],
  consultancy: ["Consultancy"],
  conference: ["Competition/hackathon", "Fellowship"],
  attachment: ["Apprenticeship", "Paid internship", "Industry attachment"],
  mentorship: ["Mentorship"],
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

export function getFacultyMatches(matches, userId) {
  return matches
    .filter((m) => m.candidateId === userId)
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
}

export function getFacultyApplications(applications, userId) {
  return applications.filter((a) => a.applicantId === userId);
}

export function filterApplicationsByTab(applications, tab) {
  const statuses = APPLICATION_TABS[tab] || [];
  return applications.filter((a) => statuses.includes(a.status));
}

export function isFacultyOpportunity(opportunity) {
  if (!opportunity) return false;
  if (opportunity.targetRoles?.includes("faculty")) return true;
  const facultyTypes = Object.values(FACULTY_OPPORTUNITY_TYPES).flat();
  return facultyTypes.some((t) => opportunity.type === t);
}

export function filterFacultyOpportunities(opportunities, { category, q, department } = {}) {
  let items = opportunities.filter(isFacultyOpportunity);
  if (category && FACULTY_OPPORTUNITY_TYPES[category]) {
    const types = FACULTY_OPPORTUNITY_TYPES[category];
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

export function getFacultyProjects(projects, userId) {
  return projects.filter(
    (p) => p.ownerId === userId || p.teamMembers?.includes(userId) || p.team?.some((t) => t.userId === userId)
  );
}

export function getFacultyTechnologies(technologies, userId) {
  return technologies.filter((t) => t.facultyId === userId || t.ownerUserId === userId);
}

export function getSupervisedStudents(projects, users, facultyId) {
  const facultyProjects = projects.filter((p) => p.ownerId === facultyId);
  const studentIds = new Set();
  facultyProjects.forEach((p) => {
    (p.teamMembers || []).forEach((id) => {
      if (id !== facultyId) studentIds.add(id);
    });
  });
  return [...studentIds]
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);
}

export function defaultRecommendationRequests(students, facultyId) {
  return students.slice(0, 3).map((s, i) => ({
    id: `rec-${s.id}`,
    studentId: s.id,
    purpose: ["Graduate school", "Scholarship", "Research grant"][i % 3],
    status: i === 0 ? "Pending" : i === 1 ? "In progress" : "Completed",
    requestedAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
    facultyId,
  }));
}

export function defaultMentoringRequests(students) {
  return students.slice(0, 2).map((s, i) => ({
    id: `ment-req-${s.id}`,
    studentId: s.id,
    topic: i === 0 ? "ML career path" : "Research publication strategy",
    status: i === 0 ? "Pending" : "Accepted",
    requestedAt: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
  }));
}

export function grantDeadlines(opportunities, matches, limit = 5) {
  const grantTypes = FACULTY_OPPORTUNITY_TYPES.grant.concat(FACULTY_OPPORTUNITY_TYPES.research);
  const matchIds = new Set(matches.map((m) => m.opportunityId));
  return opportunities
    .filter((o) => (matchIds.has(o.id) || isFacultyOpportunity(o)) && grantTypes.includes(o.type) && o.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, limit);
}

export function facultyCalendarEvents(user, applications, opportunities, projects) {
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
    .filter(isFacultyOpportunity)
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
  (user?.mentoringSessions || []).forEach((s) => {
    events.push({
      id: `ment-${s.id}`,
      title: `Mentoring: ${s.topic || "Session"}`,
      date: s.scheduledAt,
      type: "Mentoring",
    });
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
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
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
