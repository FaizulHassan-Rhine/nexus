import { scoreStudentOpportunity } from "@/lib/matchEngine";

export function filterOpportunities(opportunities, filters = {}, user = null) {
  let items = [...opportunities];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(
      (o) =>
        o.title?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.tags?.some((t) => t.toLowerCase().includes(q)) ||
        o.requiredSkills?.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (filters.type) items = items.filter((o) => o.type === filters.type);
  if (filters.department) items = items.filter((o) => o.departments?.includes(filters.department));
  if (filters.skill) {
    const skill = filters.skill.toLowerCase();
    items = items.filter(
      (o) =>
        o.requiredSkills?.some((s) => s.toLowerCase().includes(skill)) ||
        o.preferredSkills?.some((s) => s.toLowerCase().includes(skill))
    );
  }
  if (filters.division) items = items.filter((o) => o.division === filters.division);
  if (filters.workMode) items = items.filter((o) => o.workMode === filters.workMode);
  if (filters.paid === "paid") items = items.filter((o) => (o.compensation?.amount || 0) > 0);
  if (filters.paid === "unpaid") items = items.filter((o) => !(o.compensation?.amount > 0));
  if (filters.verifiedOnly === "true" || filters.verifiedOnly === true) {
    items = items.filter((o) => o.verificationStatus === "Verified");
  }
  if (filters.ugcOnly === "true" || filters.ugcOnly === true) {
    items = items.filter((o) => o.ugcProgrammeId || String(o.fundingModel || "").includes("UGC"));
  }
  if (filters.studyStage) {
    const yearMap = { "first-year": 1, "middle-years": [2, 3], "final-year": 4, alumni: [4, 5] };
    const years = yearMap[filters.studyStage];
    if (Array.isArray(years)) {
      items = items.filter((o) => !o.targetStudyYears?.length || o.targetStudyYears.some((y) => years.includes(y)));
    } else if (years) {
      items = items.filter((o) => !o.targetStudyYears?.length || o.targetStudyYears.includes(years));
    }
  }

  const withScores = items.map((o) => {
    let matchScore = null;
    if (user?.role === "student") {
      matchScore = scoreStudentOpportunity(user, o).total;
    }
    return { ...o, matchScore };
  });

  const sort = filters.sort || "relevance";
  if (sort === "deadline") {
    withScores.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
  } else if (sort === "newest") {
    withScores.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sort === "match" && user?.role === "student") {
    withScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else if (sort === "compensation") {
    withScores.sort((a, b) => (b.compensation?.amount || 0) - (a.compensation?.amount || 0));
  }

  return withScores;
}

export function parseSearchParams(searchParams) {
  const get = (key) => {
    const v = searchParams?.get?.(key) ?? searchParams?.[key];
    return v || "";
  };
  return {
    q: get("q"),
    type: get("type"),
    department: get("department"),
    skill: get("skill"),
    division: get("division"),
    workMode: get("workMode"),
    paid: get("paid"),
    verifiedOnly: get("verifiedOnly"),
    ugcOnly: get("ugcOnly"),
    studyStage: get("studyStage"),
    sort: get("sort") || "relevance",
    view: get("view") || "grid",
    page: Math.max(1, Number(get("page")) || 1),
  };
}

export function buildSearchQuery(filters, overrides = {}) {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  Object.entries(merged).forEach(([key, value]) => {
    if (value && value !== "relevance" && value !== "grid" && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
