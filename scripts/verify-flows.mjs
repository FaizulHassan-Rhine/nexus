/**
 * Offline verification of cross-role demo flows using seed + match engine.
 * Run: node --input-type=module scripts/verify-flows.mjs
 */
import { buildSeedState } from "../src/data/index.js";
import { scoreStudentOpportunity } from "../src/lib/matchEngine.js";
import { percentPair } from "../src/lib/validators.js";
import { DEMO_PASSWORD } from "../src/lib/constants.js";

const seed = buildSeedState();
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
  console.log("✓", msg);
};

const demos = seed.users.filter((u) => u.email?.endsWith("@nexus.demo"));
assert(demos.length === 6, "Six demo accounts present");
assert(demos.every((u) => u.password === DEMO_PASSWORD), "All demo passwords are demo123");

const student = seed.users.find((u) => u.email === "student@nexus.demo");
const uniAdmin = seed.users.find((u) => u.email === "university@nexus.demo");
const company = seed.users.find((u) => u.email === "company@nexus.demo");
assert(student.universityId === uniAdmin.universityId, "Student and university admin share uni-001");
assert(company.organizationId === "org-001", "Company linked to BengalTech org-001");

const opp = seed.opportunities.find((o) => o.id === "opp-001");
const score = scoreStudentOpportunity(student, opp);
assert(score.total === 88, `Internship match is 88% (got ${score.total})`);
assert(Boolean(opp.ugcProgrammeId || String(opp.fundingModel || "").includes("UGC")), "opp-001 is UGC co-funding eligible");

const app = seed.applications.find((a) => a.opportunityId === "opp-001" && a.applicantId === student.id);
assert(Boolean(app), "Seed application links demo student to opp-001");

const fund = seed.funding.requests.find((f) => f.opportunityId === "opp-001" || f.studentId === student.id);
assert(Boolean(fund), "Co-funding request exists for demo internship path");
assert(percentPair(50, 50) === "", "50/50 co-funding split validates");
assert(percentPair(60, 30) !== "", "Invalid split rejected");

assert(seed.tickets.length >= 15, "Helpdesk tickets seeded");
assert(seed.disputes.length >= 8, "Disputes seeded");
assert(seed.audit.length >= 40 || seed.meta.counts.auditEvents >= 40, "Audit events seeded");
assert(seed.matches.filter((m) => m.candidateId === student.id && m.overallScore >= 75).length >= 1, "Strong matches for demo student");

console.log("\nAll critical cross-role seed flows verified.");
console.log("Route count expected ~131 after build.");
