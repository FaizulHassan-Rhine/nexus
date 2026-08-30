import { DISCIPLINES, DIVISIONS, ORGANIZATION_TYPES, OPPORTUNITY_TYPES } from "@/lib/constants";

export const REGISTERABLE_ROLES = [
  {
    id: "student",
    title: "Student",
    description: "Join from a university, college, school, madrasa, polytechnic, or other recognized institution.",
    icon: "🎓",
    href: "/register/student",
  },
  {
    id: "faculty",
    title: "Faculty",
    description: "University faculty and school, college, or madrasa teachers — research, teaching, exchange, and student support.",
    icon: "📚",
    href: "/register/faculty",
  },
  {
    id: "researcher",
    title: "Researcher",
    description: "Collaborate on joint research, publish datasets, apply for grants, and transfer technology.",
    icon: "🔬",
    href: "/register/researcher",
  },
  {
    id: "university-admin",
    title: "Educational institution",
    description: "University, college, school, madrasa, polytechnic, and training-institute administrators.",
    icon: "🏛️",
    href: "/register/university-admin",
  },
  {
    id: "organization",
    title: "Company / organization",
    description: "Post jobs, internships, courses, and industry–academia partnerships.",
    icon: "🏢",
    href: "/register/organization",
  },
  {
    id: "training-provider",
    title: "Training provider",
    description: "Offer bootcamps, language courses, certifications, and professional training.",
    icon: "🧭",
    href: "/register/organization?type=Training%20provider",
  },
  {
    id: "industry-professional",
    title: "Industry professional",
    description: "Discover talent, mentor learners, and explore local or international remote opportunities.",
    icon: "💼",
    href: "/register/industry-professional",
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
  "Instructor",
  "Clinical Faculty",
  "Assistant Teacher",
  "Teacher",
  "Senior Teacher",
  "Head Teacher / Principal",
  "Vice Principal",
  "Subject Coordinator",
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
