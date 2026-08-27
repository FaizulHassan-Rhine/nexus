import { DISCIPLINES, DIVISIONS, ORGANIZATION_TYPES, OPPORTUNITY_TYPES } from "@/lib/constants";

export const REGISTERABLE_ROLES = [
  {
    id: "student",
    title: "Student",
    titleBn: "শিক্ষার্থী",
    description: "Find internships, scholarships, courses, and project funding across Bangladesh.",
    icon: "🎓",
    href: "/register/student",
  },
  {
    id: "faculty",
    title: "Faculty",
    titleBn: "শিক্ষক",
    description: "Discover research grants, exchange programmes, consultancy, and industry collaboration.",
    icon: "📚",
    href: "/register/faculty",
  },
  {
    id: "organization",
    title: "Organization",
    titleBn: "প্রতিষ্ঠান",
    description: "Post opportunities, hire talent, and access UGC co-funding programmes.",
    icon: "🏢",
    href: "/register/organization",
  },
  {
    id: "university-admin",
    title: "University Admin",
    titleBn: "বিশ্ববিদ্যালয় প্রশাসক",
    description: "Verify profiles, approve matches, and manage institutional workflows.",
    icon: "🏛️",
    href: "/register/university-admin",
  },
];

export const INVITATION_ONLY_ROLES = [
  {
    id: "ugc",
    title: "UGC Official",
    description: "National oversight, funding programmes, audits, and dispute resolution.",
  },
  {
    id: "helpdesk",
    title: "Helpdesk Agent",
    description: "Support tickets, SLA monitoring, and user assistance.",
  },
];

export const TIGERFED_INSTITUTIONS = [
  { value: "buet", label: "BUET — Bangladesh University of Engineering and Technology" },
  { value: "du", label: "University of Dhaka" },
  { value: "ru", label: "University of Rajshahi" },
  { value: "cu", label: "University of Chittagong" },
  { value: "sust", label: "Shahjalal University of Science & Technology" },
  { value: "nsu", label: "North South University" },
  { value: "bracu", label: "BRAC University" },
  { value: "iub", label: "Independent University, Bangladesh" },
];

export const YEAR_OPTIONS = [
  { value: "1", label: "1st year" },
  { value: "2", label: "2nd year" },
  { value: "3", label: "3rd year" },
  { value: "4", label: "4th year" },
  { value: "5", label: "5th year / Masters" },
];

export const SEMESTER_OPTIONS = [
  { value: "1", label: "1st semester" },
  { value: "2", label: "2nd semester" },
];

export const FACULTY_DESIGNATIONS = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Adjunct Faculty",
  "Research Fellow",
];

export const SKILL_OPTIONS = [
  "JavaScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "SQL",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
  "Mobile Development",
  "Cloud Computing",
  "Cybersecurity",
];

export const INTEREST_OPTIONS = [
  "Software engineering",
  "Fintech",
  "Healthcare tech",
  "AgriTech",
  "EdTech",
  "Research",
  "Startup ecosystem",
  "Public sector innovation",
  "Green energy",
  "Social impact",
];

export { DISCIPLINES, DIVISIONS, ORGANIZATION_TYPES, OPPORTUNITY_TYPES };
