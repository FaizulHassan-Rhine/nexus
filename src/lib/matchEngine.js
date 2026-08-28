export function scoreStudentOpportunity(student, opportunity) {
  if (!student || !opportunity) {
    return emptyScore("Missing profile or opportunity");
  }

  const studentSkills = normalizeList(student.skills).map((s) => s.toLowerCase());
  const required = normalizeList(opportunity.requiredSkills).map((s) => s.toLowerCase());
  const preferred = normalizeList(opportunity.preferredSkills).map((s) => s.toLowerCase());

  const requiredHits = required.filter((s) => studentSkills.includes(s)).length;
  const preferredHits = preferred.filter((s) => studentSkills.includes(s)).length;
  const requiredScore = required.length ? (requiredHits / required.length) * 18 : 14;
  const preferredScore = preferred.length ? (preferredHits / preferred.length) * 7 : 5;
  const skills = clamp(requiredScore + preferredScore, 0, 25);

  const yearOk =
    !opportunity.targetStudyYears?.length ||
    opportunity.targetStudyYears.includes(student.currentYear) ||
    opportunity.targetStudyYears.includes(String(student.currentYear));
  const deptOk =
    !opportunity.departments?.length ||
    opportunity.departments.some((d) => equalsLoose(d, student.department) || equalsLoose(d, student.programme));
  const cgpa = Number(student.cgpa) || 0;
  const cgpaScore = cgpa >= 3.5 ? 6 : cgpa >= 3.0 ? 4 : cgpa > 0 ? 2 : 3;
  const certCount = (student.certifications?.length || 0) + (student.documents?.length ? 1 : 0);
  const certScore = clamp(certCount * 2, 0, 4);
  const qualifications = clamp((yearOk ? 5 : 2) + (deptOk ? 4 : 1) + cgpaScore + certScore, 0, 18);

  const interests = normalizeList(student.interests).concat(normalizeList(student.careerGoals)).map((s) => s.toLowerCase());
  const trackHits = normalizeList(opportunity.careerTracks)
    .concat(normalizeList(opportunity.tags))
    .map((s) => s.toLowerCase())
    .filter((t) => interests.some((i) => i.includes(t) || t.includes(i))).length;
  const typePreferred = normalizeList(student.preferredOpportunityTypes).some((t) =>
    equalsLoose(t, opportunity.type)
  );
  const preferences = clamp((trackHits > 0 ? 8 : 3) + (typePreferred ? 4 : 1), 0, 12);

  const eligibleUnis = normalizeList(opportunity.eligibleUniversityIds).concat(
    normalizeList(opportunity.partnerUniversityIds)
  );
  const affiliation =
    eligibleUnis.length === 0 || eligibleUnis.includes(student.universityId)
      ? opportunity.ugcProgrammeId
        ? 8
        : 6
      : equalsLoose(opportunity.division, student.locationPreferences?.[0])
        ? 3
        : 1;

  const projectReqs = normalizeList(opportunity.projectRequirements)
    .concat(normalizeList(opportunity.deliverables))
    .map((s) => s.toLowerCase());
  const portfolioText = normalizeList(student.projects)
    .concat(normalizeList(student.portfolioLinks))
    .map((p) => (typeof p === "string" ? p : p.title || p.label || ""))
    .join(" ")
    .toLowerCase();
  const projectHits = projectReqs.filter((r) => portfolioText.includes(r) || r.split(" ").some((w) => portfolioText.includes(w))).length;
  const projectRequirements = clamp(projectReqs.length ? (projectHits / projectReqs.length) * 10 : 5, 0, 10);

  const locationOk =
    equalsLoose(opportunity.workMode, "Remote") ||
    equalsLoose(opportunity.division, student.locationPreferences?.[0]) ||
    equalsLoose(opportunity.location, student.preferredLocation) ||
    normalizeList(student.locationPreferences).some((l) => equalsLoose(l, opportunity.division) || equalsLoose(l, opportunity.location));
  const modeOk =
    !student.workModePreferences?.length ||
    student.workModePreferences.some((m) => equalsLoose(m, opportunity.workMode));
  const location = clamp((locationOk ? 4 : 1) + (modeOk ? 3 : 1), 0, 7);

  const weekly = Number(opportunity.weeklyHours) || 20;
  const available = Number(student.weeklyAvailability) || 20;
  const scheduleFit = available >= weekly ? 5 : available >= weekly * 0.7 ? 3 : 1;
  const schedule = clamp(scheduleFit, 0, 5);

  const compensationValue = Number(opportunity.compensation?.amount) || 0;
  const expectsPay = Boolean(student.expectedCompensation);
  const needSupport = Boolean(student.financialSupportNeed);
  const ugcSupported = Boolean(opportunity.fundingModel?.includes("UGC") || opportunity.ugcProgrammeId);
  let compensation = 3;
  if (compensationValue > 0 && (!expectsPay || compensationValue >= Number(student.expectedCompensation || 0) * 0.7)) {
    compensation = 5;
  }
  if (needSupport && (ugcSupported || compensationValue > 0 || opportunity.type?.toLowerCase().includes("free"))) {
    compensation = 6;
  }
  if (opportunity.type?.toLowerCase().includes("unpaid") && expectsPay && !needSupport) {
    compensation = 1;
  }
  compensation = clamp(compensation, 0, 6);

  const experienceCount =
    (student.projects?.length || 0) +
    (student.workHistory?.length || 0) +
    (student.certifications?.length || 0) +
    (student.verificationStatus === "Verified" ? 2 : 0);
  const historicalPerformance = clamp(experienceCount >= 4 ? 7 : experienceCount >= 2 ? 4 : 2, 0, 7);

  const total = Math.round(
    skills + qualifications + preferences + affiliation + projectRequirements + location + schedule + compensation + historicalPerformance
  );

  const reasons = [];
  const gaps = [];
  const recommendedActions = [];

  if (skills >= 16) reasons.push("Strong alignment with required and preferred skills");
  if (qualifications >= 12) reasons.push("Meets academic qualifications and department eligibility");
  if (preferences >= 8) reasons.push("Matches stated career goals and interests");
  if (affiliation >= 6) reasons.push("Institutional affiliation aligns with opportunity partners");
  if (projectRequirements >= 6) reasons.push("Portfolio and projects match stated requirements");
  if (location >= 5) reasons.push("Location and work mode fit preferences");
  if (ugcSupported) reasons.push("Includes UGC co-funding or support pathway");

  required
    .filter((s) => !studentSkills.includes(s))
    .forEach((s) => {
      gaps.push(`Missing required skill: ${s}`);
      recommendedActions.push(`Complete a short course covering ${s}`);
    });
  if (!yearOk) gaps.push("Study year is outside the stated target range");
  if (!deptOk) gaps.push("Department/programme is not in the primary target list");
  if (schedule < 4) recommendedActions.push("Adjust weekly availability or seek a lower-hour opportunity");
  if (!student.documents?.length) recommendedActions.push("Upload CV and transcript to strengthen applications");

  return {
    total,
    breakdown: {
      skills: Math.round(skills),
      qualifications: Math.round(qualifications),
      preferences: Math.round(preferences),
      affiliation: Math.round(affiliation),
      projectRequirements: Math.round(projectRequirements),
      location: Math.round(location),
      schedule: Math.round(schedule),
      compensation: Math.round(compensation),
      historicalPerformance: Math.round(historicalPerformance),
    },
    reasons,
    gaps,
    recommendedActions,
    algorithmVersion: "nexus-match-v2",
  };
}

export function scoreFacultyOpportunity(faculty, opportunity) {
  if (!faculty || !opportunity) return emptyScore("Missing faculty profile or opportunity");

  const research = normalizeList(faculty.researchAreas).map((s) => s.toLowerCase());
  const topics = normalizeList(opportunity.tags)
    .concat(normalizeList(opportunity.requiredSkills), normalizeList(opportunity.departments))
    .map((s) => s.toLowerCase());
  const topicHits = topics.filter((t) => research.some((r) => r.includes(t) || t.includes(r))).length;
  const skills = clamp(topicHits >= 3 ? 22 : topicHits >= 1 ? 14 : 6, 0, 22);

  const expertise = normalizeList(faculty.consultancyExpertise)
    .concat(normalizeList(faculty.teachingExpertise))
    .map((s) => s.toLowerCase());
  const skillHits = normalizeList(opportunity.requiredSkills)
    .map((s) => s.toLowerCase())
    .filter((s) => expertise.some((e) => e.includes(s) || s.includes(e))).length;
  const qualifications = clamp(skillHits >= 2 ? 14 : skillHits === 1 ? 8 : 4, 0, 14);

  const eligibleUnis = normalizeList(opportunity.eligibleUniversityIds).concat(
    normalizeList(opportunity.partnerUniversityIds)
  );
  const affiliation =
    eligibleUnis.length === 0 || eligibleUnis.includes(faculty.universityId) ? 10 : faculty.availability?.open ? 5 : 2;

  const projectReqs = normalizeList(opportunity.projectRequirements).map((s) => s.toLowerCase());
  const projectText = normalizeList(faculty.currentProjects)
    .concat(normalizeList(faculty.publications))
    .map((p) => (typeof p === "string" ? p : p.title || ""))
    .join(" ")
    .toLowerCase();
  const projectHits = projectReqs.filter((r) => projectText.includes(r)).length;
  const projectRequirements = clamp(projectReqs.length ? (projectHits / projectReqs.length) * 12 : 6, 0, 12);

  const availability = faculty.availability?.open ? 10 : 4;
  const location =
    equalsLoose(opportunity.workMode, "Remote") || equalsLoose(opportunity.division, faculty.preferredLocation) ? 10 : 5;
  const historicalPerformance = (faculty.publications?.length || 0) > 1 ? 8 : 4;
  const funding = opportunity.fundingModel || opportunity.compensation?.amount ? 6 : 3;
  const preferences = faculty.exchangePreference && opportunity.type?.includes("exchange") ? 8 : 4;

  const total = Math.round(
    clamp(
      skills +
        qualifications +
        preferences +
        affiliation +
        projectRequirements +
        availability +
        location +
        historicalPerformance +
        funding,
      0,
      100
    )
  );

  return {
    total,
    breakdown: {
      skills: Math.round(skills),
      qualifications: Math.round(qualifications),
      preferences: Math.round(preferences),
      affiliation: Math.round(affiliation),
      projectRequirements: Math.round(projectRequirements),
      availability,
      location,
      historicalPerformance,
      funding,
    },
    reasons: [
      topicHits ? "Research topics align with the opportunity" : "General faculty collaboration fit",
      faculty.availability?.open ? "Faculty availability is marked open" : "Availability needs confirmation",
      affiliation >= 8 ? "Institutional affiliation matches programme partners" : "Affiliation may require review",
    ].filter(Boolean),
    gaps: topicHits ? [] : ["Limited topic overlap — consider refining research interests"],
    recommendedActions: ["Update publications and collaboration preferences for better matching"],
    algorithmVersion: "nexus-match-v2",
  };
}

export function scoreResearcherOpportunity(researcher, opportunity) {
  if (!researcher || !opportunity) return emptyScore("Missing researcher profile or opportunity");

  const research = normalizeList(researcher.researchAreas).map((s) => s.toLowerCase());
  const topics = normalizeList(opportunity.tags)
    .concat(normalizeList(opportunity.requiredSkills), normalizeList(opportunity.departments))
    .map((s) => s.toLowerCase());
  const topicHits = topics.filter((t) => research.some((r) => r.includes(t) || t.includes(r))).length;
  const skills = clamp(topicHits >= 3 ? 24 : topicHits >= 1 ? 15 : 7, 0, 24);

  const collab = normalizeList(researcher.collaborationInterests).map((s) => s.toLowerCase());
  const oppType = String(opportunity.type || "").toLowerCase();
  const preferences = collab.some((c) => oppType.includes(c.split(" ")[0]?.toLowerCase()) || c.includes("research"))
    ? 10
    : 5;

  const pubCount = researcher.publications?.length || 0;
  const qualifications = clamp(pubCount >= 2 ? 12 : pubCount === 1 ? 8 : 4, 0, 12);

  const eligibleUnis = normalizeList(opportunity.eligibleUniversityIds).concat(
    normalizeList(opportunity.partnerUniversityIds)
  );
  const affiliation =
    eligibleUnis.length === 0 || eligibleUnis.includes(researcher.universityId)
      ? researcher.affiliationType === "independent"
        ? 6
        : 10
      : 3;

  const projectReqs = normalizeList(opportunity.projectRequirements).map((s) => s.toLowerCase());
  const projectText = normalizeList(researcher.currentProjects)
    .concat(normalizeList(researcher.datasets))
    .map((p) => (typeof p === "string" ? p : p.title || ""))
    .join(" ")
    .toLowerCase();
  const projectHits = projectReqs.filter((r) => projectText.includes(r)).length;
  const projectRequirements = clamp(projectReqs.length ? (projectHits / projectReqs.length) * 14 : 7, 0, 14);

  const availability = researcher.availability?.open ? 10 : 4;
  const location =
    equalsLoose(opportunity.workMode, "Remote") || equalsLoose(opportunity.division, researcher.preferredLocation) ? 8 : 4;
  const historicalPerformance = clamp((pubCount || 0) * 2 + (researcher.datasets?.length || 0) * 2, 2, 8);
  const funding = opportunity.fundingModel || opportunity.compensation?.amount ? 8 : 4;

  const total = Math.round(
    clamp(
      skills +
        preferences +
        qualifications +
        affiliation +
        projectRequirements +
        availability +
        location +
        historicalPerformance +
        funding,
      0,
      100
    )
  );

  return {
    total,
    breakdown: {
      skills: Math.round(skills),
      preferences: Math.round(preferences),
      qualifications: Math.round(qualifications),
      affiliation: Math.round(affiliation),
      projectRequirements: Math.round(projectRequirements),
      availability,
      location,
      historicalPerformance,
      funding,
    },
    reasons: [
      topicHits ? "Research areas align with opportunity topics" : "General researcher collaboration fit",
      researcher.orcid ? "ORCID-linked researcher profile verified" : "Add ORCID for stronger verification",
      affiliation >= 8 ? "Affiliation aligns with programme institutions" : "Affiliation may require university review",
    ].filter(Boolean),
    gaps: topicHits ? [] : ["Expand research area tags for better discovery"],
    recommendedActions: ["Publish datasets and update collaboration interests"],
    algorithmVersion: "nexus-match-v2",
  };
}

function emptyScore(reason) {
  return {
    total: 0,
    breakdown: {},
    reasons: [],
    gaps: [reason],
    recommendedActions: [],
    algorithmVersion: "nexus-match-v2",
  };
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function equalsLoose(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
