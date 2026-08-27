"use client";

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

export function getStudentMatches(matches, userId, { excludeDismissed = true } = {}) {
  return matches
    .filter((m) => m.candidateId === userId)
    .filter((m) => !excludeDismissed || m.studentInterestStatus !== "Not interested")
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
}

export function getStudentApplications(applications, userId) {
  return applications.filter((a) => a.applicantId === userId);
}

export function filterApplicationsByTab(applications, tab) {
  const statuses = APPLICATION_TABS[tab] || [];
  return applications.filter((a) => statuses.includes(a.status));
}

export function computePassportStrength(user) {
  if (!user) return 0;
  const base = user.profileCompletion || 0;
  const skillBonus = Math.min(10, (user.skills?.length || 0) * 1.5);
  const docBonus = Math.min(5, (user.documents?.length || 0) * 2);
  return Math.min(100, Math.round(base * 0.85 + skillBonus + docBonus));
}

export function defaultCareerRoadmap(journeyStage) {
  const stage = journeyStage || "final-year";
  const base = [
    { id: "rm-1", title: "Complete skills assessment", completed: false },
    { id: "rm-2", title: "Build Opportunity Passport to 90%+", completed: false },
    { id: "rm-3", title: "Apply to top 3 matched internships", completed: false },
    { id: "rm-4", title: "Enroll in a gap-closing course", completed: false },
    { id: "rm-5", title: "Secure faculty recommendation letter", completed: false },
  ];
  if (stage === "first-year") {
    return [
      { id: "rm-f1", title: "Explore career tracks on Nexus", completed: false },
      { id: "rm-f2", title: "Complete foundational Python course", completed: false },
      { id: "rm-f3", title: "Join a campus project team", completed: false },
      ...base.slice(0, 2),
    ];
  }
  if (stage === "middle-years") {
    return [
      { id: "rm-m1", title: "Complete micro-internship or campus job", completed: false },
      { id: "rm-m2", title: "Build portfolio project", completed: false },
      ...base,
    ];
  }
  if (stage === "alumni") {
    return [
      { id: "rm-a1", title: "Update alumni profile and work history", completed: false },
      { id: "rm-a2", title: "Apply to full-time roles", completed: false },
      { id: "rm-a3", title: "Mentor current students", completed: false },
      ...base.slice(2),
    ];
  }
  return base;
}

export function defaultAbroadChecklist() {
  return [
    { id: "ab-1", label: "Research target universities", done: false },
    { id: "ab-2", label: "Check language test requirements (IELTS/TOEFL)", done: false },
    { id: "ab-3", label: "Request academic transcripts", done: false },
    { id: "ab-4", label: "Draft statement of purpose", done: false },
    { id: "ab-5", label: "Secure recommendation letters", done: false },
    { id: "ab-6", label: "Apply for scholarships on Nexus", done: false },
    { id: "ab-7", label: "Prepare visa documentation", done: false },
  ];
}

export function collectSkillGaps(matches, limit = 8) {
  const gaps = new Map();
  matches.forEach((m) => {
    (m.missingRequirements || []).forEach((g) => {
      gaps.set(g, (gaps.get(g) || 0) + 1);
    });
  });
  return [...gaps.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([skill, count]) => ({ skill, count }));
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

export function upcomingDeadlines(opportunities, matches, limit = 5) {
  const matchIds = new Set(matches.map((m) => m.opportunityId));
  return opportunities
    .filter((o) => matchIds.has(o.id) && o.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, limit);
}

export function calendarEvents(user, applications, opportunities, funding) {
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
    if (app.status !== "Draft" && app.submittedAt) {
      events.push({
        id: `sub-${app.id}`,
        title: `Submitted: ${opportunities.find((o) => o.id === app.opportunityId)?.title || app.id}`,
        date: app.submittedAt,
        type: "Application",
      });
    }
  });
  opportunities.forEach((o) => {
    if (o.deadline) {
      events.push({
        id: `deadline-${o.id}`,
        title: `Deadline: ${o.title}`,
        date: o.deadline,
        type: "Deadline",
      });
    }
  });
  funding.forEach((f) => {
    if (f.studentId === user?.id) {
      (f.milestones || []).forEach((m) => {
        events.push({
          id: `pay-${m.id}`,
          title: m.label,
          date: m.dueDate,
          type: "Payment",
        });
      });
    }
  });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}
