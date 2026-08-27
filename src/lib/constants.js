export const APP_NAME = "Nexus";
export const APP_TAGLINE = "National Digital Matchmaking Hub";
export const STORE_KEY = "nexus-demo-v1";
export const STORE_VERSION = 1;
export const DEMO_PASSWORD = "demo123";
export const DEMO_OTP = "123456";
export const TIMEZONE = "Asia/Dhaka";
export const DEFAULT_CURRENCY = "BDT";

export const ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  ORGANIZATION: "organization",
  UNIVERSITY_ADMIN: "university-admin",
  UGC: "ugc",
  HELPDESK: "helpdesk",
};

export const DEMO_ACCOUNTS = [
  {
    email: "student@nexus.demo",
    role: ROLES.STUDENT,
    name: "Ayesha Rahman",
    scenario: "Final-year CSE student seeking internship, scholarship, and project funding",
  },
  {
    email: "faculty@nexus.demo",
    role: ROLES.FACULTY,
    name: "Dr. Rafiqul Islam",
    scenario: "Faculty seeking research, exchange, and technology-transfer opportunities",
  },
  {
    email: "company@nexus.demo",
    role: ROLES.ORGANIZATION,
    name: "Nusrat Jahan",
    scenario: "Verified technology company recruiting interns and applying for UGC co-funding",
  },
  {
    email: "university@nexus.demo",
    role: ROLES.UNIVERSITY_ADMIN,
    name: "Karim Hossain",
    scenario: "Reviews matches, verifies profiles, and monitors internships",
  },
  {
    email: "ugc@nexus.demo",
    role: ROLES.UGC,
    name: "Farhana Akter",
    scenario: "Oversees the network, funding, disputes, audits, and national analytics",
  },
  {
    email: "helpdesk@nexus.demo",
    role: ROLES.HELPDESK,
    name: "Tanvir Ahmed",
    scenario: "Manages tickets and the 24-hour SLA target",
  },
];

export const OPPORTUNITY_TYPES = [
  "Part-time job",
  "Full-time job",
  "Paid internship",
  "Unpaid internship",
  "Virtual internship",
  "Micro-internship",
  "Apprenticeship",
  "Freelance project",
  "Campus job",
  "Research assistantship",
  "Teaching assistantship",
  "Free course",
  "Paid course",
  "Subsidized course",
  "Bootcamp",
  "Mentorship",
  "Scholarship",
  "Fellowship",
  "Exchange programme",
  "Study-abroad programme",
  "Competition/hackathon",
  "Student project funding",
  "Research grant",
  "Startup support",
  "Faculty exchange",
  "Consultancy",
  "Joint research",
  "Technology licensing",
  "Industry problem statement",
];

export const APPLICATION_STATUSES = [
  "Draft",
  "Submitted",
  "University review",
  "Changes requested",
  "University approved",
  "Sent to organization",
  "Shortlisted",
  "Interview scheduled",
  "Offered",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "In progress",
  "Completed",
  "Disputed",
];

export const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Remote",
];

export const DISCIPLINES = [
  "CSE",
  "EEE",
  "Business",
  "Economics",
  "English",
  "Pharmacy",
  "Civil Engineering",
  "Architecture",
  "Agriculture",
  "Public Health",
  "Law",
  "Design",
  "Data Science",
];

export const ORGANIZATION_TYPES = [
  "Company",
  "Startup",
  "NGO",
  "Development organization",
  "Research institute",
  "Training provider",
  "Scholarship provider",
  "Foreign university",
  "Embassy/cultural partner",
  "Donor",
  "Government agency",
];

export const WORK_MODES = ["Onsite", "Hybrid", "Remote"];

export const MATCH_BANDS = [
  { min: 90, max: 100, label: "Excellent match" },
  { min: 75, max: 89, label: "Strong match" },
  { min: 60, max: 74, label: "Good potential" },
  { min: 40, max: 59, label: "Partial match" },
  { min: 0, max: 39, label: "Low match" },
];

export const ROLE_DASHBOARDS = {
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.FACULTY]: "/faculty/dashboard",
  [ROLES.ORGANIZATION]: "/organization/dashboard",
  [ROLES.UNIVERSITY_ADMIN]: "/university-admin/dashboard",
  [ROLES.UGC]: "/ugc/dashboard",
  [ROLES.HELPDESK]: "/helpdesk/dashboard",
};

export const JOURNEY_STAGES = [
  { id: "first-year", label: "First year" },
  { id: "middle-years", label: "Second/third year" },
  { id: "final-year", label: "Final year" },
  { id: "alumni", label: "Graduate/alumni" },
];
