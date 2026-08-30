"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { IdentityVerificationFields } from "@/components/auth/IdentityVerification";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Textarea,
  MultiStepForm,
  FileUploader,
  Combobox,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/mockServices";
import {
  DISCIPLINES,
  DIVISIONS,
  ORGANIZATION_TYPES,
  OPPORTUNITY_TYPES,
  FACULTY_DESIGNATIONS,
} from "@/components/auth/authOptions";
import { email as validateEmail, password as validatePassword, required } from "@/lib/validators";
import {
  INSTITUTION_TYPES,
  filterInstitutionsByType,
  getStudentFieldConfig,
} from "@/lib/ecosystem";

const ROLE_META = {
  student: { title: "Student registration", subtitle: "Join from any recognized educational institution in Bangladesh — university, college, school, madrasa, polytechnic, and more." },
  teacher: { title: "Faculty registration", subtitle: "University faculty and school, college, or madrasa teachers — research, teaching, exchange, and student support." },
  faculty: { title: "Faculty registration", subtitle: "University faculty and school, college, or madrasa teachers — research, teaching, exchange, and student support." },
  researcher: { title: "Researcher registration", subtitle: "Independent and affiliated researchers pursuing grants, collaboration, and technology transfer." },
  organization: { title: "Organization registration", subtitle: "Companies, startups, NGOs, training providers, and industry partners." },
  "university-admin": {
    title: "Institution administrator registration",
    subtitle: "Registrar, principal, IQAC, or career-services focal points for universities and other educational institutions.",
  },
  "industry-professional": {
    title: "Industry professional registration",
    subtitle: "Mentors, practitioners, and specialists exploring talent, collaboration, and local or international remote work.",
  },
};

function validatePhone(value) {
  if (!value) return "Phone number is required";
  if (!/^(\+880|0)?1[3-9]\d{8}$/.test(value.replace(/[\s-]/g, ""))) {
    return "Enter a valid Bangladesh mobile number";
  }
  return "";
}

const TEACHING_FOCUSED_TYPES = new Set(["school", "madrasa", "technical", "training"]);

function RegisterRolePageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const role = params.role;
  const universities = useAppStore((s) => s.universities);
  const meta = ROLE_META[role];

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  // Student
  const [universityId, setUniversityId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [programme, setProgramme] = useState("");
  const [department, setDepartment] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [institutionType, setInstitutionType] = useState(role === "student" ? "university" : "university");
  const [customInstitution, setCustomInstitution] = useState("");
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [employer, setEmployer] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [professionalSkills, setProfessionalSkills] = useState("");

  // Faculty
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [orcid, setOrcid] = useState("");
  const [affiliationType, setAffiliationType] = useState("university");

  // Organization multi-step
  const [orgStep, setOrgStep] = useState(0);
  const [orgType, setOrgType] = useState(searchParams.get("type") || "");
  const [orgName, setOrgName] = useState("");
  const [orgDivision, setOrgDivision] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [repName, setRepName] = useState("");
  const [repDesignation, setRepDesignation] = useState("");
  const [tradeLicence, setTradeLicence] = useState(null);
  const [orgInterests, setOrgInterests] = useState([]);
  const [orgAgreement, setOrgAgreement] = useState(false);

  // University admin
  const [office, setOffice] = useState("");
  const [uniAdminDesignation, setUniAdminDesignation] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [adminEmployeeId, setAdminEmployeeId] = useState("");
  const [authDoc, setAuthDoc] = useState(null);

  useEffect(() => {
    if (role === "teacher") {
      router.replace("/register/faculty");
      return;
    }
    if (!meta) router.replace("/register");
  }, [meta, role, router]);

  const studentFields = getStudentFieldConfig(institutionType);
  const uniOptions = useMemo(() => {
    const list = role === "student" || role === "faculty" || role === "university-admin"
      ? filterInstitutionsByType(universities, institutionType)
      : universities;
    const source = list.length ? list : universities;
    return source.map((u) => ({ value: u.id, label: `${u.shortName} — ${u.name}` }));
  }, [universities, institutionType, role]);

  if (!meta || role === "teacher") return null;

  const isTeachingFocused = TEACHING_FOCUSED_TYPES.has(institutionType);

  const validateCommon = () => ({
    name: required(name, "Full name"),
    email: validateEmail(email),
    phone: validatePhone(phone),
    password: validatePassword(password),
    terms: terms ? "" : "You must accept the terms",
    privacy: privacy ? "" : "You must accept the privacy policy",
  });

  const validateStudent = () => {
    const next = {
      ...validateCommon(),
      institutionType: required(institutionType, "Institution type"),
      universityId: studentFields.allowCustomInstitution && customInstitution ? "" : required(universityId, studentFields.institutionLabel),
      studentId: required(studentId, studentFields.idLabel),
      programme: required(programme, studentFields.programmeLabel),
      department: required(department, studentFields.departmentLabel),
      currentYear: required(currentYear, studentFields.yearLabel),
      identityType: required(identityType, "Identity document"),
      identityNumber: required(identityNumber, "ID number"),
    };
    if (studentFields.showSemester) next.currentSemester = required(currentSemester, "Semester");
    if (studentFields.allowCustomInstitution && !universityId) next.customInstitution = required(customInstitution, "Institution name");
    return next;
  };

  const validateFaculty = () => ({
    ...validateCommon(),
    institutionType: required(institutionType, "Institution type"),
    universityId: required(universityId, studentFields.institutionLabel || "Institution"),
    employeeId: required(employeeId, "Employee ID"),
    designation: required(designation, "Designation"),
    department: required(department, "Department"),
    researchInterests: isTeachingFocused ? "" : required(researchInterests, "Research interests"),
    identityType: required(identityType, "Identity document"),
    identityNumber: required(identityNumber, "ID number"),
  });

  const validateResearcher = () => ({
    ...validateCommon(),
    universityId: required(universityId, "Affiliation"),
    researchInterests: required(researchInterests, "Research areas"),
  });

  const validateOrgStep = () => {
    if (orgStep === 0) return { orgType: required(orgType, "Organization type") };
    if (orgStep === 1)
      return {
        orgName: required(orgName, "Organization name"),
        orgDivision: required(orgDivision, "Division"),
        email: validateEmail(email),
        phone: validatePhone(phone),
      };
    if (orgStep === 2)
      return {
        repName: required(repName, "Representative name"),
        repDesignation: required(repDesignation, "Designation"),
        name: required(name, "Your name"),
      };
    if (orgStep === 3) return {};
    if (orgStep === 4) return { orgInterests: orgInterests.length ? "" : "Select at least one interest" };
    if (orgStep === 5)
      return {
        orgAgreement: orgAgreement ? "" : "You must accept the verification agreement",
        password: validatePassword(password),
        terms: terms ? "" : "Required",
      };
    return {};
  };

  const validateUniAdmin = () => ({
    ...validateCommon(),
    institutionType: required(institutionType, "Institution type"),
    universityId: required(universityId, "Institution"),
    office: required(office, "Office"),
    uniAdminDesignation: required(uniAdminDesignation, "Designation"),
    officialEmail: validateEmail(officialEmail),
    adminEmployeeId: required(adminEmployeeId, "Employee ID"),
    authDoc: authDoc ? "" : "Authorization document is required",
    identityType: required(identityType, "Identity document"),
    identityNumber: required(identityNumber, "ID number"),
  });

  const validateProfessional = () => ({
    ...validateCommon(),
    employer: required(employer, "Current organization"),
    designation: required(designation, "Designation"),
    identityType: required(identityType, "Identity document"),
    identityNumber: required(identityNumber, "ID number"),
  });

  const submitRegistration = async (payload, needsApproval) => {
    setLoading(true);
    try {
      const result = await authService.register(payload);
      if (!result.ok) {
        toast.error(result.error || "Registration failed");
        return;
      }
      sessionStorage.setItem("nexus-pending-email", payload.email);
      sessionStorage.setItem("nexus-pending-role", payload.role);
      toast.success("Account created", { description: "Verify your email to continue." });
      router.push("/verify-otp");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentFacultySubmit = async (e, validateFn, extra) => {
    e.preventDefault();
    const nextErrors = validateFn();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload = {
      role,
      name,
      email,
      phone,
      universityId,
      department,
      ...extra,
    };
    await submitRegistration(payload, false);
  };

  const handleStudentSubmit = (e) =>
    handleStudentFacultySubmit(e, validateStudent, {
      studentId,
      programme,
      department,
      currentYear: Number(currentYear),
      currentSemester: studentFields.showSemester ? Number(currentSemester) : undefined,
      institutionType,
      customInstitution: customInstitution || undefined,
      identityVerification: {
        documentType: identityType,
        documentNumber: identityNumber,
        status: "Pending",
      },
    });

  const handleFacultySubmit = (e) =>
    handleStudentFacultySubmit(e, validateFaculty, {
      employeeId,
      designation,
      educatorType: isTeachingFocused ? "teacher" : "faculty",
      institutionType,
      researchAreas: researchInterests.split(",").map((s) => s.trim()).filter(Boolean),
      teachingExpertise: isTeachingFocused ? researchInterests.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      identityVerification: {
        documentType: identityType,
        documentNumber: identityNumber,
        status: "Pending",
      },
    });

  const handleResearcherSubmit = (e) =>
    handleStudentFacultySubmit(e, validateResearcher, {
      orcid,
      affiliationType,
      researchAreas: researchInterests.split(",").map((s) => s.trim()).filter(Boolean),
      collaborationInterests: ["Joint research", "Technology transfer"],
    });

  const handleProfessionalSubmit = (e) =>
    handleStudentFacultySubmit(e, validateProfessional, {
      employer,
      designation,
      yearsExperience,
      skills: professionalSkills.split(",").map((s) => s.trim()).filter(Boolean),
      identityVerification: {
        documentType: identityType,
        documentNumber: identityNumber,
        status: "Pending",
      },
    });

  const handleOrgNext = () => {
    const nextErrors = validateOrgStep();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    if (orgStep < 5) setOrgStep((s) => s + 1);
    else {
      submitRegistration(
        {
          role: "organization",
          name: repName || name,
          email,
          phone,
          organizationName: orgName,
          organizationType: orgType,
          division: orgDivision,
          website: orgWebsite,
          representative: { name: repName, designation: repDesignation },
          opportunityInterests: orgInterests,
          documents: tradeLicence ? [tradeLicence] : [],
          verificationStatus: "Pending",
        },
        true
      );
    }
  };

  const handleUniAdminSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateUniAdmin();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    await submitRegistration(
      {
        role: "university-admin",
        name,
        email: officialEmail || email,
        phone,
        universityId,
        office,
        designation: uniAdminDesignation,
        employeeId: adminEmployeeId,
        institutionType,
        documents: authDoc ? [authDoc] : [],
        identityVerification: {
          documentType: identityType,
          documentNumber: identityNumber,
          status: "Pending",
        },
        verificationStatus: "Pending",
      },
      true
    );
  };

  const toggleOrgInterest = (item) => {
    setOrgInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const passwordFields = (
    <div className="space-y-4 sm:col-span-2">
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          hint="Minimum 6 characters"
        />
        <button
          type="button"
          className="absolute top-8 right-3 text-slate-400"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="space-y-2">
        <Checkbox label="I accept the Terms of Service" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
        {errors.terms ? <p className="text-xs text-danger">{errors.terms}</p> : null}
        <Checkbox
          label="I accept the Privacy Policy and consent to profile matching"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
        />
        {errors.privacy ? <p className="text-xs text-danger">{errors.privacy}</p> : null}
      </div>
    </div>
  );

  const universityField = (
    <div>
      <Combobox
        label={role === "researcher" ? "University / institute affiliation" : studentFields.institutionLabel || "Institution"}
        options={uniOptions}
        value={universityId}
        onChange={setUniversityId}
        placeholder={role === "researcher" ? "Search affiliations…" : `Search ${String(studentFields.institutionLabel || "institutions").toLowerCase()}…`}
      />
      {errors.universityId ? <p className="mt-1.5 text-xs text-danger">{errors.universityId}</p> : null}
    </div>
  );

  const institutionTypeField = (
    <Select
      label="Institution type"
      options={INSTITUTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
      value={institutionType}
      onChange={(e) => {
        setInstitutionType(e.target.value);
        setUniversityId("");
        setDepartment("");
      }}
      error={errors.institutionType}
      placeholder="Select type"
      required
    />
  );

  return (
    <AuthCard title={meta.title} subtitle={meta.subtitle} className="max-w-4xl">
      <Link href="/register" className="mb-4 inline-flex items-center gap-1 text-sm text-nexus-700 hover:underline dark:text-nexus-300">
        <ArrowLeft className="h-4 w-4" /> All roles
      </Link>

      {role === "student" ? (
        <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <Input label="Full name (English)" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required placeholder="Ayesha Rahman" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required placeholder="you@student.example.bd" />
          <Input label="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required placeholder="+8801712345678" hint="Bangladesh mobile number" />
          {institutionTypeField}
          {universityField}
          {studentFields.allowCustomInstitution ? (
            <Input
              label="Institution name (if not listed)"
              value={customInstitution}
              onChange={(e) => setCustomInstitution(e.target.value)}
              error={errors.customInstitution}
              placeholder="Official name of your institution"
            />
          ) : null}
          <Input label={studentFields.idLabel} value={studentId} onChange={(e) => setStudentId(e.target.value)} error={errors.studentId} required placeholder="Institution ID or roll number" />
          <Input label={studentFields.programmeLabel} value={programme} onChange={(e) => setProgramme(e.target.value)} error={errors.programme} required placeholder={studentFields.programmePlaceholder} />
          <div className="sm:col-span-2">
            <Select
              label={studentFields.departmentLabel}
              options={(studentFields.departmentOptions || DISCIPLINES).map((d) => ({ value: d, label: d }))}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              error={errors.department}
              placeholder={`Select ${studentFields.departmentLabel.toLowerCase()}`}
              required
            />
          </div>
          <Select label={studentFields.yearLabel} options={studentFields.yearOptions} value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} error={errors.currentYear} placeholder={studentFields.yearLabel} required />
          {studentFields.showSemester ? (
            <Select label="Semester" options={studentFields.semesterOptions} value={currentSemester} onChange={(e) => setCurrentSemester(e.target.value)} error={errors.currentSemester} placeholder="Semester" required />
          ) : (
            <div />
          )}
          <IdentityVerificationFields
            identityType={identityType}
            onIdentityTypeChange={setIdentityType}
            identityNumber={identityNumber}
            onIdentityNumberChange={setIdentityNumber}
            errors={errors}
          />
          {passwordFields}
          <Button type="submit" className="w-full sm:col-span-2" loading={loading}>Create student account</Button>
        </form>
      ) : null}

      {role === "faculty" ? (
        <form onSubmit={handleFacultySubmit} className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required placeholder="Dr. Rafiqul Islam" />
          <Input label="Institutional email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required placeholder="rafiqul@cse.buet.ac.bd" />
          <Input label="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required />
          {institutionTypeField}
          {universityField}
          <Input label="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} error={errors.employeeId} required placeholder="BUET/FAC/2010/088" />
          <Select
            label="Designation"
            options={FACULTY_DESIGNATIONS.map((d) => ({ value: d, label: d }))}
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            error={errors.designation}
            placeholder="Select designation"
            required
          />
          <div className="sm:col-span-2">
            <Select label="Department / subject area" options={DISCIPLINES.map((d) => ({ value: d, label: d }))} value={department} onChange={(e) => setDepartment(e.target.value)} error={errors.department} placeholder="Department" required />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label={isTeachingFocused ? "Subjects / teaching areas" : "Research interests"}
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              error={errors.researchInterests}
              required={!isTeachingFocused}
              placeholder={isTeachingFocused ? "Physics, ICT, Higher secondary science" : "Machine Learning, NLP, Healthcare Informatics"}
              hint="Comma-separated areas. School, madrasa, and vocational teachers can list subjects here."
            />
          </div>
          <IdentityVerificationFields
            identityType={identityType}
            onIdentityTypeChange={setIdentityType}
            identityNumber={identityNumber}
            onIdentityNumberChange={setIdentityNumber}
            errors={errors}
          />
          {passwordFields}
          <Button type="submit" className="w-full sm:col-span-2" loading={loading}>
            Create faculty account
          </Button>
        </form>
      ) : null}

      {role === "researcher" ? (
        <form onSubmit={handleResearcherSubmit} className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required placeholder="Dr. Nasreen Chowdhury" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required placeholder="nasreen@research.buet.ac.bd" />
          <Input label="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required />
          {universityField}
          <Select
            label="Affiliation type"
            options={[
              { value: "university", label: "University-affiliated" },
              { value: "institute", label: "Research institute" },
              { value: "independent", label: "Independent researcher" },
            ]}
            value={affiliationType}
            onChange={(e) => setAffiliationType(e.target.value)}
          />
          <Input label="ORCID iD" value={orcid} onChange={(e) => setOrcid(e.target.value)} error={errors.orcid} placeholder="0000-0002-1825-0097" />
          <div className="sm:col-span-2">
            <Textarea label="Research areas" value={researchInterests} onChange={(e) => setResearchInterests(e.target.value)} error={errors.researchInterests} required placeholder="Climate resilience, public health data, Bangla NLP" hint="Comma-separated areas" />
          </div>
          {passwordFields}
          <Button type="submit" className="w-full sm:col-span-2" loading={loading}>Create researcher account</Button>
        </form>
      ) : null}

      {role === "industry-professional" ? (
        <form onSubmit={handleProfessionalSubmit} className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required placeholder="Arif Chowdhury" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
          <Input label="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required />
          <Input label="Current organization" value={employer} onChange={(e) => setEmployer(e.target.value)} error={errors.employer} required placeholder="Company, studio, or independent" />
          <Input label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} error={errors.designation} required placeholder="Senior Product Designer" />
          <Input label="Years of experience" type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="5" />
          <div className="sm:col-span-2">
            <Textarea label="Skills" value={professionalSkills} onChange={(e) => setProfessionalSkills(e.target.value)} placeholder="Figma, product strategy, English" hint="Comma-separated skills used for matching local and international remote roles" />
          </div>
          <IdentityVerificationFields
            identityType={identityType}
            onIdentityTypeChange={setIdentityType}
            identityNumber={identityNumber}
            onIdentityNumberChange={setIdentityNumber}
            errors={errors}
          />
          {passwordFields}
          <Button type="submit" className="w-full sm:col-span-2" loading={loading}>Create professional account</Button>
        </form>
      ) : null}

      {role === "organization" ? (
        <MultiStepForm
          steps={["Type", "Details", "Representative", "Documents", "Interests", "Agreement"]}
          current={orgStep}
          onStepChange={setOrgStep}
        >
          <div className="space-y-4">
            {orgStep === 0 ? (
              <Select label="Organization type" options={ORGANIZATION_TYPES.map((t) => ({ value: t, label: t }))} value={orgType} onChange={(e) => setOrgType(e.target.value)} error={errors.orgType} placeholder="Select type" required />
            ) : null}
            {orgStep === 1 ? (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <Input label="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} error={errors.orgName} required placeholder="Grameen Digital Ltd." />
                <Select label="Head office division" options={DIVISIONS.map((d) => ({ value: d, label: d }))} value={orgDivision} onChange={(e) => setOrgDivision(e.target.value)} error={errors.orgDivision} placeholder="Division" required />
                <Input label="Website" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://example.com.bd" />
                <Input label="Contact email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
                <Input label="Contact phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required />
              </div>
            ) : null}
            {orgStep === 2 ? (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <Input label="Representative name" value={repName} onChange={(e) => setRepName(e.target.value)} error={errors.repName} required />
                <Input label="Representative designation" value={repDesignation} onChange={(e) => setRepDesignation(e.target.value)} error={errors.repDesignation} required placeholder="HR Manager" />
                <Input label="Your login name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
              </div>
            ) : null}
            {orgStep === 3 ? (
              <>
                <FileUploader label="Trade licence / RJSC certificate" accept=".pdf,.jpg,.png" value={tradeLicence} onChange={setTradeLicence} onRemove={() => setTradeLicence(null)} />
                <p className="text-xs text-secondary">Placeholder upload — metadata stored only. Required for verification.</p>
              </>
            ) : null}
            {orgStep === 4 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Hiring & partnership interests</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {OPPORTUNITY_TYPES.slice(0, 12).map((item) => (
                    <Checkbox key={item} label={item} checked={orgInterests.includes(item)} onChange={() => toggleOrgInterest(item)} />
                  ))}
                </div>
                {errors.orgInterests ? <p className="text-xs text-danger">{errors.orgInterests}</p> : null}
              </div>
            ) : null}
            {orgStep === 5 ? (
              <>
                <p className="text-sm text-secondary">By submitting, you agree to Nexus organization verification. Status will be <strong>Pending</strong> until reviewed.</p>
                <Checkbox label="I agree to organization verification terms" checked={orgAgreement} onChange={(e) => setOrgAgreement(e.target.checked)} />
                {errors.orgAgreement ? <p className="text-xs text-danger">{errors.orgAgreement}</p> : null}
                {passwordFields}
              </>
            ) : null}
            <div className="flex gap-3 pt-2">
              {orgStep > 0 ? (
                <Button variant="secondary" type="button" onClick={() => setOrgStep((s) => s - 1)}>Back</Button>
              ) : null}
              <Button type="button" className="flex-1" onClick={handleOrgNext} loading={loading && orgStep === 5}>
                {orgStep === 5 ? "Submit for verification" : "Continue"}
              </Button>
            </div>
          </div>
        </MultiStepForm>
      ) : null}

      {role === "university-admin" ? (
        <form onSubmit={handleUniAdminSubmit} className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
          {institutionTypeField}
          {universityField}
          <Input label="Office / unit" value={office} onChange={(e) => setOffice(e.target.value)} error={errors.office} required placeholder="Office of the Registrar / Principal / IQAC / Career Services" />
          <Input label="Designation" value={uniAdminDesignation} onChange={(e) => setUniAdminDesignation(e.target.value)} error={errors.uniAdminDesignation} required placeholder="Deputy Registrar / Vice Principal" />
          <Input label="Official email" type="email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} error={errors.officialEmail} required placeholder="admin@institution.edu.bd" hint="Should be an official institutional domain" />
          <Input label="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required />
          <Input label="Employee ID" value={adminEmployeeId} onChange={(e) => setAdminEmployeeId(e.target.value)} error={errors.adminEmployeeId} required />
          <div className="sm:col-span-2">
            <FileUploader label="Authorization letter from head of institution" accept=".pdf" value={authDoc} onChange={setAuthDoc} onRemove={() => setAuthDoc(null)} />
            {errors.authDoc ? <p className="mt-1.5 text-xs text-danger">{errors.authDoc}</p> : null}
          </div>
          <IdentityVerificationFields
            identityType={identityType}
            onIdentityTypeChange={setIdentityType}
            identityNumber={identityNumber}
            onIdentityNumberChange={setIdentityNumber}
            errors={errors}
          />
          {passwordFields}
          <p className="text-xs text-secondary sm:col-span-2">Submission enters <strong>approval pending</strong> until verified by the Nexus programme office or a recognized regulator such as UGC.</p>
          <Button type="submit" className="w-full sm:col-span-2" loading={loading}>Submit for approval</Button>
        </form>
      ) : null}

      <p className="mt-4 text-center text-sm text-secondary">
        Already registered? <Link href="/login" className="text-nexus-700 hover:underline dark:text-nexus-300">Sign in</Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterRolePage() {
  return (
    <Suspense fallback={<AuthCard title="Loading…" />}>
      <RegisterRolePageContent />
    </Suspense>
  );
}
