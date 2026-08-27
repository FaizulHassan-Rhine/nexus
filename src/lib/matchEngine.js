export function scoreStudentOpportunity(student, opportunity) {
  if (!student || !opportunity) {
    return emptyScore("Missing profile or opportunity");
  }

  const studentSkills = normalizeList(student.skills).map((s) => s.toLowerCase());
  const required = normalizeList(opportunity.requiredSkills).map((s) => s.toLowerCase());
  const preferred = normalizeList(opportunity.preferredSkills).map((s) => s.toLowerCase());

  const requiredHits = required.filter((s) => studentSkills.includes(s)).length;
  const preferredHits = preferred.filter((s) => studentSkills.includes(s)).length;
  const requiredScore = required.length ? (requiredHits / required.length) * 22 : 18;
  const preferredScore = preferred.length ? (preferredHits / preferred.length) * 8 : 6;
  const skills = clamp(requiredScore + preferredScore, 0, 30);

  const yearOk =
    !opportunity.targetStudyYears?.length ||
    opportunity.targetStudyYears.includes(student.currentYear) ||
    opportunity.targetStudyYears.includes(String(student.currentYear));
  const deptOk =
    !opportunity.departments?.length ||
    opportunity.departments.some((d) => equalsLoose(d, student.department) || equalsLoose(d, student.programme));
  const eligibility = clamp((yearOk ? 12 : 4) + (deptOk ? 8 : 2), 0, 20);

  const interests = normalizeList(student.interests).concat(normalizeList(student.careerGoals)).map((s) => s.toLowerCase());
  const trackHits = normalizeList(opportunity.careerTracks)
    .concat(normalizeList(opportunity.tags))
    .map((s) => s.toLowerCase())
    .filter((t) => interests.some((i) => i.includes(t) || t.includes(i))).length;
  const typePreferred = normalizeList(student.preferredOpportunityTypes).some((t) =>
    equalsLoose(t, opportunity.type)
  );
  const career = clamp((trackHits > 0 ? 10 : 4) + (typePreferred ? 5 : 1), 0, 15);

  const locationOk =
    equalsLoose(opportunity.workMode, "Remote") ||
    equalsLoose(opportunity.division, student.locationPreferences?.[0]) ||
    equalsLoose(opportunity.location, student.preferredLocation) ||
    normalizeList(student.locationPreferences).some((l) => equalsLoose(l, opportunity.division) || equalsLoose(l, opportunity.location));
  const modeOk =
    !student.workModePreferences?.length ||
    student.workModePreferences.some((m) => equalsLoose(m, opportunity.workMode));
  const location = clamp((locationOk ? 6 : 2) + (modeOk ? 4 : 1), 0, 10);

  const weekly = Number(opportunity.weeklyHours) || 20;
  const available = Number(student.weeklyAvailability) || 20;
  const scheduleFit = available >= weekly ? 10 : available >= weekly * 0.7 ? 7 : 3;
  const schedule = clamp(scheduleFit, 0, 10);

  const compensationValue = Number(opportunity.compensation?.amount) || 0;
  const expectsPay = Boolean(student.expectedCompensation);
  const needSupport = Boolean(student.financialSupportNeed);
  const ugcSupported = Boolean(opportunity.fundingModel?.includes("UGC") || opportunity.ugcProgrammeId);
  let compensation = 5;
  if (compensationValue > 0 && (!expectsPay || compensationValue >= Number(student.expectedCompensation || 0) * 0.7)) {
    compensation = 8;
  }
  if (needSupport && (ugcSupported || compensationValue > 0 || opportunity.type?.toLowerCase().includes("free"))) {
    compensation = 10;
  }
  if (opportunity.type?.toLowerCase().includes("unpaid") && expectsPay && !needSupport) {
    compensation = 2;
  }
  compensation = clamp(compensation, 0, 10);

  const experienceCount =
    (student.projects?.length || 0) +
    (student.workHistory?.length || 0) +
    (student.certifications?.length || 0) +
    (student.verificationStatus === "Verified" ? 2 : 0);
  const trackRecord = clamp(experienceCount >= 4 ? 5 : experienceCount >= 2 ? 3 : 1, 0, 5);

  const total = Math.round(skills + eligibility + career + location + schedule + compensation + trackRecord);

  const reasons = [];
  const gaps = [];
  const recommendedActions = [];

  if (skills >= 20) reasons.push("Strong alignment with required and preferred skills");
  if (eligibility >= 16) reasons.push("Meets academic year and department eligibility");
  if (career >= 10) reasons.push("Matches stated career goals and interests");
  if (location >= 8) reasons.push("Location and work mode fit preferences");
  if (ugcSupported) reasons.push("Includes UGC co-funding or support pathway");

  required
    .filter((s) => !studentSkills.includes(s))
    .forEach((s) => {
      gaps.push(`Missing required skill: ${s}`);
      recommendedActions.push(`Complete a short course covering ${s}`);
    });
  if (!yearOk) gaps.push("Study year is outside the stated target range");
  if (!deptOk) gaps.push("Department/programme is not in the primary target list");
  if (schedule < 7) recommendedActions.push("Adjust weekly availability or seek a lower-hour opportunity");
  if (!student.documents?.length) recommendedActions.push("Upload CV and transcript to strengthen applications");

  return {
    total,
    breakdown: {
      skills: Math.round(skills),
      eligibility: Math.round(eligibility),
      career: Math.round(career),
      location: Math.round(location),
      schedule: Math.round(schedule),
      compensation: Math.round(compensation),
      trackRecord: Math.round(trackRecord),
    },
    reasons,
    gaps,
    recommendedActions,
    algorithmVersion: "nexus-match-v1",
  };
}

export function scoreFacultyOpportunity(faculty, opportunity) {
  if (!faculty || !opportunity) return emptyScore("Missing faculty profile or opportunity");

  const research = normalizeList(faculty.researchAreas).map((s) => s.toLowerCase());
  const topics = normalizeList(opportunity.tags)
    .concat(normalizeList(opportunity.requiredSkills), normalizeList(opportunity.departments))
    .map((s) => s.toLowerCase());
  const topicHits = topics.filter((t) => research.some((r) => r.includes(t) || t.includes(r))).length;
  const researchScore = clamp(topicHits >= 3 ? 30 : topicHits >= 1 ? 20 : 8, 0, 30);

  const expertise = normalizeList(faculty.consultancyExpertise)
    .concat(normalizeList(faculty.teachingExpertise))
    .map((s) => s.toLowerCase());
  const skillHits = normalizeList(opportunity.requiredSkills)
    .map((s) => s.toLowerCase())
    .filter((s) => expertise.some((e) => e.includes(s) || s.includes(e))).length;
  const expertiseScore = clamp(skillHits >= 2 ? 25 : skillHits === 1 ? 15 : 6, 0, 25);

  const availability = faculty.availability ? 15 : 6;
  const location =
    equalsLoose(opportunity.workMode, "Remote") || equalsLoose(opportunity.division, faculty.preferredLocation) ? 15 : 7;
  const history = (faculty.currentProjects?.length || 0) > 0 ? 8 : 4;
  const funding = opportunity.fundingModel || opportunity.compensation?.amount ? 7 : 3;

  const total = Math.round(
    clamp(researchScore + expertiseScore + availability + location + history + funding, 0, 100)
  );

  return {
    total,
    breakdown: {
      research: Math.round(researchScore),
      expertise: Math.round(expertiseScore),
      availability,
      location,
      history,
      funding,
    },
    reasons: [
      topicHits ? "Research topics align with the opportunity" : "General faculty collaboration fit",
      faculty.availability ? "Faculty availability is marked open" : "Availability needs confirmation",
    ].filter(Boolean),
    gaps: topicHits ? [] : ["Limited topic overlap — consider refining research interests"],
    recommendedActions: ["Update publications and collaboration preferences for better matching"],
    algorithmVersion: "nexus-faculty-match-v1",
  };
}

function emptyScore(reason) {
  return {
    total: 0,
    breakdown: {},
    reasons: [],
    gaps: [reason],
    recommendedActions: [],
    algorithmVersion: "nexus-match-v1",
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
