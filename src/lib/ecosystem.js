export const INSTITUTION_TYPES = [
  { value: "university", label: "University" },
  { value: "college", label: "College" },
  { value: "school", label: "School" },
  { value: "madrasa", label: "Madrasa" },
  { value: "polytechnic", label: "Polytechnic Institute" },
  { value: "technical", label: "Technical / Vocational Institute" },
  { value: "medical", label: "Medical Institution" },
  { value: "engineering", label: "Engineering Institution" },
  { value: "training", label: "Training Institute" },
  { value: "other", label: "Other recognized institution" },
];

export const IDENTITY_DOCUMENT_TYPES = [
  { value: "nid", label: "National ID Card", minAge: 18 },
  { value: "birth-certificate", label: "Birth Certificate" },
  { value: "passport", label: "Passport" },
];

export const LEARNING_PERIODS = [
  "Year-round",
  "Summer vacation",
  "Winter vacation",
  "Semester break",
  "Academic holiday",
];

export const COURSE_CATEGORIES = [
  "Skill development",
  "Language",
  "Certification",
  "Workshop",
  "Bootcamp",
  "Professional training",
  "Academic support",
];

export const GEOGRAPHIC_SCOPES = [
  { value: "bangladesh", label: "Bangladesh (local)" },
  { value: "international-remote", label: "International remote" },
  { value: "international-onsite", label: "International (onsite / abroad)" },
];

export const SPOKEN_LANGUAGES = [
  "Bangla",
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Japanese",
  "Korean",
  "Chinese",
  "German",
  "French",
  "Spanish",
];

export const LANGUAGE_SKILLS = [
  "Bangla",
  "English",
  "Arabic",
  "Japanese",
  "Korean",
  "Chinese",
  "German",
  "French",
  "Spanish",
  "Hindi",
  "Urdu",
  "IELTS",
  "TOEFL",
];

const CLASS_OPTIONS = [
  { value: "1", label: "Class 1" },
  { value: "2", label: "Class 2" },
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10 / SSC" },
  { value: "11", label: "Class 11 / HSC 1st year" },
  { value: "12", label: "Class 12 / HSC 2nd year" },
];

const DIPLOMA_YEAR_OPTIONS = [
  { value: "1", label: "1st year" },
  { value: "2", label: "2nd year" },
  { value: "3", label: "3rd year" },
  { value: "4", label: "4th year" },
];

const UNIVERSITY_YEAR_OPTIONS = [
  { value: "1", label: "1st year" },
  { value: "2", label: "2nd year" },
  { value: "3", label: "3rd year" },
  { value: "4", label: "4th year" },
  { value: "5", label: "5th year / Masters" },
];

const SEMESTER_OPTIONS = [
  { value: "1", label: "1st semester" },
  { value: "2", label: "2nd semester" },
];

const SCHOOL_STREAMS = ["Science", "Humanities", "Business Studies", "Vocational", "General"];
const MADRASA_LEVELS = ["Ibtedayi", "Dakhil", "Alim", "Fazil", "Kamil"];
const COLLEGE_PROGRAMMES = ["HSC", "Degree (pass)", "Honours", "Masters preliminary"];
const MEDICAL_PROGRAMMES = ["MBBS", "BDS", "Nursing", "Paramedical", "Public Health"];
const VOCATIONAL_TRADES = [
  "Electrical",
  "Welding",
  "ICT",
  "Refrigeration",
  "Automotive",
  "Garments",
  "Graphics",
  "Hospitality",
  "Other trade",
];

export function institutionTypeOf(institution) {
  return institution?.institutionType || "University";
}

export function institutionTypeValue(institution) {
  return String(institutionTypeOf(institution)).toLowerCase();
}

export function getStudentFieldConfig(institutionType) {
  const type = String(institutionType || "university").toLowerCase();

  if (type === "school") {
    return {
      institutionLabel: "School",
      idLabel: "Student ID / roll number",
      programmeLabel: "Class / programme",
      programmePlaceholder: "Secondary school certificate track",
      departmentLabel: "Group / stream",
      departmentOptions: SCHOOL_STREAMS,
      yearLabel: "Current class",
      yearOptions: CLASS_OPTIONS,
      showSemester: false,
      showCgpa: false,
      allowCustomInstitution: false,
    };
  }

  if (type === "college") {
    return {
      institutionLabel: "College",
      idLabel: "College roll / student ID",
      programmeLabel: "Programme",
      programmePlaceholder: "HSC, Degree, or Honours",
      departmentLabel: "Group / subject",
      departmentOptions: [...SCHOOL_STREAMS, "Honours subject"],
      yearLabel: "Year / class",
      yearOptions: [
        { value: "11", label: "HSC 1st year" },
        { value: "12", label: "HSC 2nd year" },
        { value: "1", label: "Degree / Honours 1st year" },
        { value: "2", label: "Degree / Honours 2nd year" },
        { value: "3", label: "Honours 3rd year" },
        { value: "4", label: "Honours 4th year" },
      ],
      showSemester: false,
      showCgpa: true,
      allowCustomInstitution: false,
    };
  }

  if (type === "madrasa") {
    return {
      institutionLabel: "Madrasa",
      idLabel: "Student ID / roll number",
      programmeLabel: "Level",
      programmePlaceholder: "Dakhil, Alim, Fazil, or Kamil",
      departmentLabel: "Stream",
      departmentOptions: MADRASA_LEVELS,
      yearLabel: "Current year / class",
      yearOptions: CLASS_OPTIONS.concat([
        { value: "13", label: "Fazil / Kamil year" },
      ]),
      showSemester: false,
      showCgpa: false,
      allowCustomInstitution: false,
    };
  }

  if (type === "polytechnic") {
    return {
      institutionLabel: "Polytechnic institute",
      idLabel: "Board / institute roll number",
      programmeLabel: "Diploma programme",
      programmePlaceholder: "Diploma in Engineering (Computer)",
      departmentLabel: "Technology / department",
      departmentOptions: ["Computer", "Electrical", "Civil", "Mechanical", "Architecture", "Textile", "Other"],
      yearLabel: "Diploma year",
      yearOptions: DIPLOMA_YEAR_OPTIONS,
      showSemester: true,
      semesterOptions: SEMESTER_OPTIONS,
      showCgpa: true,
      allowCustomInstitution: false,
    };
  }

  if (type === "technical") {
    return {
      institutionLabel: "Technical / vocational institute",
      idLabel: "Trainee / student ID",
      programmeLabel: "Course or trade",
      programmePlaceholder: "NTVQF / trade course name",
      departmentLabel: "Trade",
      departmentOptions: VOCATIONAL_TRADES,
      yearLabel: "Level",
      yearOptions: [
        { value: "1", label: "Pre-vocational / Level 1" },
        { value: "2", label: "Level 2" },
        { value: "3", label: "Level 3" },
        { value: "4", label: "Level 4 / National certificate" },
      ],
      showSemester: false,
      showCgpa: false,
      allowCustomInstitution: false,
    };
  }

  if (type === "medical") {
    return {
      institutionLabel: "Medical institution",
      idLabel: "Student ID",
      programmeLabel: "Programme",
      programmePlaceholder: "MBBS, BDS, Nursing…",
      departmentLabel: "Department",
      departmentOptions: MEDICAL_PROGRAMMES,
      yearLabel: "Year",
      yearOptions: UNIVERSITY_YEAR_OPTIONS.concat([{ value: "5", label: "5th year" }]),
      showSemester: true,
      semesterOptions: SEMESTER_OPTIONS,
      showCgpa: true,
      allowCustomInstitution: false,
    };
  }

  if (type === "engineering") {
    return {
      institutionLabel: "Engineering institution",
      idLabel: "Student ID",
      programmeLabel: "Programme",
      programmePlaceholder: "BSc in Electrical Engineering",
      departmentLabel: "Department",
      departmentOptions: ["CSE", "EEE", "Civil Engineering", "Mechanical Engineering", "Architecture", "Other"],
      yearLabel: "Year",
      yearOptions: UNIVERSITY_YEAR_OPTIONS,
      showSemester: true,
      semesterOptions: SEMESTER_OPTIONS,
      showCgpa: true,
      allowCustomInstitution: false,
    };
  }

  if (type === "training") {
    return {
      institutionLabel: "Training institute",
      idLabel: "Trainee ID (if issued)",
      programmeLabel: "Training programme",
      programmePlaceholder: "Professional certificate or short course",
      departmentLabel: "Focus area",
      departmentOptions: ["ICT", "Language", "Business", "Healthcare", "Trades", "Other"],
      yearLabel: "Cohort / level",
      yearOptions: [
        { value: "1", label: "Foundation" },
        { value: "2", label: "Intermediate" },
        { value: "3", label: "Advanced / professional" },
      ],
      showSemester: false,
      showCgpa: false,
      allowCustomInstitution: true,
    };
  }

  if (type === "other") {
    return {
      institutionLabel: "Institution",
      idLabel: "Student / member ID",
      programmeLabel: "Programme or course",
      programmePlaceholder: "Name of your current programme",
      departmentLabel: "Department / area",
      departmentOptions: ["General", "ICT", "Business", "Health", "Education", "Other"],
      yearLabel: "Year / level",
      yearOptions: UNIVERSITY_YEAR_OPTIONS,
      showSemester: false,
      showCgpa: false,
      allowCustomInstitution: true,
    };
  }

  return {
    institutionLabel: "University",
    idLabel: "Student ID",
    programmeLabel: "Programme",
    programmePlaceholder: "BSc in Computer Science and Engineering",
    departmentLabel: "Department",
    departmentOptions: null,
    yearLabel: "Year",
    yearOptions: UNIVERSITY_YEAR_OPTIONS,
    showSemester: true,
    semesterOptions: SEMESTER_OPTIONS,
    showCgpa: true,
    allowCustomInstitution: false,
  };
}

export function filterInstitutionsByType(institutions = [], institutionType) {
  if (!institutionType) return institutions;
  const wanted = String(institutionType).toLowerCase();
  return institutions.filter((item) => institutionTypeValue(item) === wanted);
}

export function ageFromDateOfBirth(value) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function identityDocumentOptions(age, role = "student") {
  const needsAdultId = role === "faculty" || role === "teacher" || role === "researcher" || role === "industry-professional" || role === "university-admin";
  if (age == null) {
    return needsAdultId
      ? IDENTITY_DOCUMENT_TYPES.filter((doc) => doc.value !== "birth-certificate")
      : IDENTITY_DOCUMENT_TYPES;
  }
  if (age < 18) {
    return IDENTITY_DOCUMENT_TYPES.filter((doc) => doc.value === "birth-certificate" || doc.value === "passport");
  }
  return IDENTITY_DOCUMENT_TYPES.filter((doc) => doc.value === "nid" || doc.value === "passport");
}

export function identityRequirementHint(age, role = "student") {
  if (role === "organization" || role === "university-admin") {
    return "Institutional documents are reviewed together with a representative identity document.";
  }
  if (age == null) return "Select a document that matches your age. Under-18 accounts should use a birth certificate or passport.";
  if (age < 18) return "Because you are under 18, submit a Birth Certificate or Passport. National ID is not required.";
  return "Because you are 18 or older, submit a National ID Card or Passport for identity verification.";
}

export function identityNumberField(documentType) {
  if (documentType === "nid") {
    return { label: "National ID number", placeholder: "e.g. 1990123456789" };
  }
  if (documentType === "birth-certificate") {
    return { label: "Birth certificate number", placeholder: "e.g. 19901234567890123" };
  }
  if (documentType === "passport") {
    return { label: "Passport number", placeholder: "e.g. A01234567" };
  }
  return { label: "ID number", placeholder: "Enter the document number" };
}

export function isLanguageCourse(course) {
  if (!course) return false;
  if (course.category === "Language") return true;
  if (String(course.type || "").toLowerCase().includes("language")) return true;
  const haystack = `${course.title || ""} ${(course.skills || []).join(" ")}`.toLowerCase();
  return LANGUAGE_SKILLS.some((lang) => haystack.includes(lang.toLowerCase())) || /ielts|toefl|language/.test(haystack);
}

export function isBreakOrShortCourse(course) {
  if (!course) return false;
  const period = String(course.learningPeriod || "").toLowerCase();
  if (period.includes("vacation") || period.includes("break") || period.includes("holiday")) return true;
  const type = String(course.type || "").toLowerCase();
  return ["workshop", "bootcamp", "certification programme", "professional training", "language course"].some((item) =>
    type.includes(item.split(" ")[0])
  );
}

export function geographicScopeOf(opportunity) {
  if (opportunity?.geographicScope) return opportunity.geographicScope;
  const country = String(opportunity?.country || "Bangladesh").toLowerCase();
  const remote = String(opportunity?.workMode || "").toLowerCase() === "remote";
  if (country && country !== "bangladesh" && remote) return "international-remote";
  if (country && country !== "bangladesh") return "international-onsite";
  return "bangladesh";
}

export function portalRoleFor(userRole) {
  if (userRole === "teacher") return "faculty";
  if (userRole === "industry-professional") return "student";
  return userRole;
}
