"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Textarea,
  MultiStepForm,
  FileUploader,
  Progress,
  Slider,
  Badge,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import {
  DIVISIONS,
  OPPORTUNITY_TYPES,
  SKILL_OPTIONS,
  INTEREST_OPTIONS,
} from "@/components/auth/authOptions";
import { WORK_MODES } from "@/lib/constants";
import { SPOKEN_LANGUAGES } from "@/lib/ecosystem";
import { ROLE_DASHBOARDS } from "@/lib/constants";

const ONBOARDING_CONFIG = {
  student: {
    title: "Student onboarding",
    steps: ["Academic", "Skills", "Interests", "Work prefs", "Financial", "Documents", "Privacy", "Preview"],
    optionalSteps: [5, 6],
  },
  "industry-professional": {
    title: "Professional onboarding",
    steps: ["Academic", "Skills", "Interests", "Work prefs", "Financial", "Documents", "Privacy", "Preview"],
    optionalSteps: [5, 6],
  },
  faculty: {
    title: "Faculty onboarding",
    steps: ["Academic", "Research", "Publications", "Exchange", "Availability", "Documents"],
    optionalSteps: [2, 5],
  },
  teacher: {
    title: "Faculty onboarding",
    steps: ["Academic", "Research", "Publications", "Exchange", "Availability", "Documents"],
    optionalSteps: [2, 5],
  },
  organization: {
    title: "Organization onboarding",
    steps: ["Profile", "Documents", "Hiring", "Partnerships", "Co-funding", "Policies"],
    optionalSteps: [1, 4],
  },
  "university-admin": {
    title: "University admin onboarding",
    steps: ["Office", "Permissions", "Workflow", "ERP", "Escalation"],
    optionalSteps: [3],
  },
  researcher: {
    title: "Researcher onboarding",
    steps: ["Affiliation", "Research", "Publications", "Collaboration", "Datasets", "Documents"],
    optionalSteps: [2, 4, 5],
  },
};

function StepNav({ step, total, label, onBack, onSkip, canSkip, onSave, saving }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="mb-6 space-y-3">
      <Progress value={pct} label={`Step ${step + 1} of ${total}: ${label}`} />
      <div className="flex flex-wrap gap-2">
        {step > 0 ? (
          <Button variant="secondary" size="sm" type="button" onClick={onBack}>
            Back
          </Button>
        ) : null}
        {canSkip ? (
          <Button variant="ghost" size="sm" type="button" onClick={onSkip}>
            Skip (optional)
          </Button>
        ) : null}
        <Button variant="soft" size="sm" type="button" onClick={onSave} loading={saving} className="ml-auto">
          Save & continue later
        </Button>
      </div>
    </div>
  );
}

export default function OnboardingRolePage() {
  const router = useRouter();
  const params = useParams();
  const role = params.role;
  const config = ONBOARDING_CONFIG[role];
  const user = useAppStore((s) => s.getCurrentUser());
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const universities = useAppStore((s) => s.universities);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Student state
  const [cgpaRange, setCgpaRange] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [careerGoals, setCareerGoals] = useState("");
  const [workModes, setWorkModes] = useState([]);
  const [languagesSpoken, setLanguagesSpoken] = useState(["Bangla", "English"]);
  const [locationPref, setLocationPref] = useState("Dhaka");
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [needsFinancial, setNeedsFinancial] = useState(false);
  const [expectedStipend, setExpectedStipend] = useState(12000);
  const [cv, setCv] = useState(null);
  const [shareCgpa, setShareCgpa] = useState(false);
  const [shareContact, setShareContact] = useState(true);

  // Faculty state
  const [researchAreas, setResearchAreas] = useState("");
  const [teachingAreas, setTeachingAreas] = useState("");
  const [publications, setPublications] = useState("");
  const [exchangeOpen, setExchangeOpen] = useState(true);
  const [consultancyAreas, setConsultancyAreas] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [facultyDoc, setFacultyDoc] = useState(null);

  // Researcher state
  const [orcid, setOrcid] = useState("");
  const [affiliationType, setAffiliationType] = useState("university");
  const [collaborationInterests, setCollaborationInterests] = useState([]);
  const [currentProjects, setCurrentProjects] = useState("");
  const [datasetInterests, setDatasetInterests] = useState(false);
  const [researcherDoc, setResearcherDoc] = useState(null);

  // Organization state
  const [companyBio, setCompanyBio] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [orgDoc, setOrgDoc] = useState(null);
  const [hiringTypes, setHiringTypes] = useState([]);
  const [partnershipTypes, setPartnershipTypes] = useState([]);
  const [cofundingInterest, setCofundingInterest] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Uni admin state
  const [permissions, setPermissions] = useState({ verify: true, approve: true, funding: false });
  const [workflowNotes, setWorkflowNotes] = useState("");
  const [erpConnected, setErpConnected] = useState(false);
  const [escalationName, setEscalationName] = useState("");
  const [escalationEmail, setEscalationEmail] = useState("");

  const university = useMemo(
    () => universities.find((u) => u.id === user?.universityId),
    [universities, user?.universityId]
  );

  useEffect(() => {
    if (role === "teacher") router.replace("/onboarding/faculty");
  }, [role, router]);

  if (!config) {
    return (
      <AuthCard title="Unknown role">
        <Link href="/register"><Button>Back to registration</Button></Link>
      </AuthCard>
    );
  }

  const toggle = (list, setList, item) => {
    setList((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const saveDraft = async () => {
    if (!user) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateProfile(user.id, { onboardingStep: step, profileCompletion: Math.min(90, 35 + step * 8) });
    toast.success("Progress saved", { description: "You can continue onboarding later." });
    setSaving(false);
  };

  const finish = async (updates) => {
    if (!user) {
      toast.error("Please sign in to complete onboarding");
      router.push("/login");
      return;
    }
    setFinishing(true);
    await new Promise((r) => setTimeout(r, 600));
    completeOnboarding(user.id, updates);
    toast.success("Onboarding complete!", { description: "Welcome to Nexus." });
    router.push(ROLE_DASHBOARDS[role] || "/");
    setFinishing(false);
  };

  const next = () => setStep((s) => Math.min(s + 1, config.steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const skip = () => next();

  const isLast = step === config.steps.length - 1;
  const canSkip = config.optionalSteps.includes(step);

  const renderStudentStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-sm text-secondary">Confirm your academic details from registration.</p>
            <Input label="University" value={university?.shortName || "—"} disabled />
            <Input label="Programme" value={user?.programme || ""} disabled />
            <Select
              label="CGPA range (optional share later)"
              options={[
                { value: "3.75-4.00", label: "3.75 – 4.00 (First class)" },
                { value: "3.50-3.74", label: "3.50 – 3.74" },
                { value: "3.00-3.49", label: "3.00 – 3.49" },
                { value: "below-3.00", label: "Below 3.00" },
              ]}
              value={cgpaRange}
              onChange={(e) => setCgpaRange(e.target.value)}
              placeholder="Select range"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">Technical skills</p>
            {SKILL_OPTIONS.map((s) => (
              <Checkbox key={s} label={s} checked={skills.includes(s)} onChange={() => toggle(skills, setSkills, s)} />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Interests</p>
              {INTEREST_OPTIONS.map((i) => (
                <Checkbox key={i} label={i} checked={interests.includes(i)} onChange={() => toggle(interests, setInterests, i)} />
              ))}
            </div>
            <Textarea label="Career goals" value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} placeholder="Full-stack developer in Dhaka fintech…" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">Work mode preferences</p>
            {WORK_MODES.map((m) => (
              <Checkbox key={m} label={m} checked={workModes.includes(m)} onChange={() => toggle(workModes, setWorkModes, m)} />
            ))}
            <Select label="Preferred location" options={DIVISIONS.map((d) => ({ value: d, label: d }))} value={locationPref} onChange={(e) => setLocationPref(e.target.value)} />
            <div className="space-y-2">
              <p className="text-sm font-medium">Languages</p>
              {SPOKEN_LANGUAGES.map((lang) => (
                <Checkbox key={lang} label={lang} checked={languagesSpoken.includes(lang)} onChange={() => toggle(languagesSpoken, setLanguagesSpoken, lang)} />
              ))}
            </div>
            <Slider label="Weekly availability (hours)" value={weeklyHours} onChange={setWeeklyHours} min={5} max={40} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Checkbox label="I need financial support (scholarship / stipend assistance)" checked={needsFinancial} onChange={(e) => setNeedsFinancial(e.target.checked)} />
            <Input label="Expected monthly stipend (BDT)" type="number" value={expectedStipend} onChange={(e) => setExpectedStipend(Number(e.target.value))} hint="Typical internship stipend in Dhaka: ৳8,000–20,000" />
          </div>
        );
      case 5:
        return (
          <FileUploader label="CV / Resume (PDF)" accept=".pdf" value={cv} onChange={setCv} onRemove={() => setCv(null)} />
        );
      case 6:
        return (
          <div className="space-y-3">
            <Checkbox label="Share CGPA range with matched organizations" checked={shareCgpa} onChange={(e) => setShareCgpa(e.target.checked)} />
            <Checkbox label="Allow organizations to contact me directly after university approval" checked={shareContact} onChange={(e) => setShareContact(e.target.checked)} />
          </div>
        );
      case 7:
        return (
          <div className="space-y-4 rounded-xl border border-nexus-200 bg-nexus-50/50 p-4 dark:border-nexus-800 dark:bg-nexus-950/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-nexus-600" />
              <h3 className="font-semibold">Recommendation preview</h3>
            </div>
            <p className="text-sm text-secondary">Based on your profile, Nexus would suggest:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Badge tone="teal">92%</Badge> Paid internship — Grameen Digital Ltd.</li>
              <li className="flex items-center gap-2"><Badge tone="blue">87%</Badge> UGC co-funded apprenticeship — bKash</li>
              <li className="flex items-center gap-2"><Badge tone="violet">81%</Badge> Scholarship — Women in Tech Programme</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFacultyStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <Input label="University" value={university?.name || "—"} disabled />
            <Input label="Department" value={user?.department || ""} disabled />
            <Input label="Designation" value={user?.designation || ""} disabled />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <Textarea label="Research areas" value={researchAreas} onChange={(e) => setResearchAreas(e.target.value)} placeholder="Machine Learning, Bangla NLP…" />
            <Textarea label="Teaching expertise" value={teachingAreas} onChange={(e) => setTeachingAreas(e.target.value)} placeholder="Algorithms, Software Engineering…" />
          </div>
        );
      case 2:
        return (
          <Textarea label="Key publications (one per line)" value={publications} onChange={(e) => setPublications(e.target.value)} placeholder="Title — Journal — Year" hint="Optional — can add more later" />
        );
      case 3:
        return (
          <div className="space-y-4">
            <Checkbox label="Open to faculty exchange programmes" checked={exchangeOpen} onChange={(e) => setExchangeOpen(e.target.checked)} />
            <Textarea label="Consultancy expertise" value={consultancyAreas} onChange={(e) => setConsultancyAreas(e.target.value)} placeholder="AI strategy, research commercialization…" />
          </div>
        );
      case 4:
        return <Slider label="Hours per week available for collaboration" value={hoursPerWeek} onChange={setHoursPerWeek} min={2} max={20} />;
      case 5:
        return <FileUploader label="CV / ORCID summary" accept=".pdf" value={facultyDoc} onChange={setFacultyDoc} onRemove={() => setFacultyDoc(null)} />;
      default:
        return null;
    }
  };

  const renderResearcherStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <Select
              label="Affiliation type"
              options={[
                { value: "university", label: "University-affiliated researcher" },
                { value: "institute", label: "Research institute" },
                { value: "independent", label: "Independent researcher" },
              ]}
              value={affiliationType}
              onChange={(e) => setAffiliationType(e.target.value)}
            />
            <Input label="University / institute" value={university?.name || "—"} disabled />
            <Input label="ORCID iD" value={orcid} onChange={(e) => setOrcid(e.target.value)} placeholder="0000-0002-1825-0097" />
          </div>
        );
      case 1:
        return (
          <Textarea
            label="Research areas"
            value={researchAreas}
            onChange={(e) => setResearchAreas(e.target.value)}
            placeholder="Climate modelling, public health analytics, Bangla NLP…"
          />
        );
      case 2:
        return (
          <Textarea
            label="Key publications (one per line)"
            value={publications}
            onChange={(e) => setPublications(e.target.value)}
            placeholder="Title — Journal — Year"
            hint="Optional — can add more later"
          />
        );
      case 3:
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">Collaboration interests</p>
            {["Joint research", "Technology transfer", "Grant applications", "Dataset sharing", "Industry problem statements", "Policy research"].map((t) => (
              <Checkbox key={t} label={t} checked={collaborationInterests.includes(t)} onChange={() => toggle(collaborationInterests, setCollaborationInterests, t)} />
            ))}
            <Textarea label="Current projects" value={currentProjects} onChange={(e) => setCurrentProjects(e.target.value)} placeholder="Project title — summary" />
          </div>
        );
      case 4:
        return (
          <Checkbox
            label="I plan to publish open datasets on Nexus"
            checked={datasetInterests}
            onChange={(e) => setDatasetInterests(e.target.checked)}
          />
        );
      case 5:
        return (
          <FileUploader label="CV / ORCID summary" accept=".pdf" value={researcherDoc} onChange={setResearcherDoc} onRemove={() => setResearcherDoc(null)} />
        );
      default:
        return null;
    }
  };

  const renderOrgStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <Textarea label="Company profile" value={companyBio} onChange={(e) => setCompanyBio(e.target.value)} placeholder="Leading fintech in Motijheel, Dhaka…" />
            <Select label="Employee count" options={["1-10", "11-50", "51-200", "201-500", "500+"].map((v) => ({ value: v, label: v }))} value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="Select range" />
          </div>
        );
      case 1:
        return <FileUploader label="Company profile / brochure" accept=".pdf" value={orgDoc} onChange={setOrgDoc} onRemove={() => setOrgDoc(null)} />;
      case 2:
        return (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {OPPORTUNITY_TYPES.slice(0, 10).map((t) => (
              <Checkbox key={t} label={t} checked={hiringTypes.includes(t)} onChange={() => toggle(hiringTypes, setHiringTypes, t)} />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-2">
            {["Joint research", "Technology licensing", "Campus recruitment", "Mentorship programme", "Internship pipeline"].map((t) => (
              <Checkbox key={t} label={t} checked={partnershipTypes.includes(t)} onChange={() => toggle(partnershipTypes, setPartnershipTypes, t)} />
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Checkbox label="Interested in UGC 50/50 co-funding programmes" checked={cofundingInterest} onChange={(e) => setCofundingInterest(e.target.checked)} />
            <p className="text-sm text-secondary">Eligible for Graduate Apprenticeship Support and Women in Technology Internship Support.</p>
          </div>
        );
      case 5:
        return (
          <Checkbox label="I confirm our organization complies with Bangladesh labour law and Nexus fair hiring policies" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} />
        );
      default:
        return null;
    }
  };

  const renderUniAdminStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <Input label="Office" value={user?.office || "Registrar / IQAC"} disabled />
            <Input label="University" value={university?.shortName || "—"} disabled />
          </div>
        );
      case 1:
        return (
          <div className="space-y-2">
            <Checkbox label="Verify student & faculty profiles" checked={permissions.verify} onChange={(e) => setPermissions((p) => ({ ...p, verify: e.target.checked }))} />
            <Checkbox label="Approve matches and applications" checked={permissions.approve} onChange={(e) => setPermissions((p) => ({ ...p, approve: e.target.checked }))} />
            <Checkbox label="Review funding requests" checked={permissions.funding} onChange={(e) => setPermissions((p) => ({ ...p, funding: e.target.checked }))} />
          </div>
        );
      case 2:
        return (
          <Textarea label="Approval workflow notes" value={workflowNotes} onChange={(e) => setWorkflowNotes(e.target.value)} placeholder="Matches require IQAC sign-off before organization release…" />
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-secondary">Simulate connection to university ERP / student information system.</p>
            <Checkbox label="ERP integration enabled (simulated)" checked={erpConnected} onChange={(e) => setErpConnected(e.target.checked)} />
            {erpConnected ? (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                Connected to {university?.shortName || "University"} SIS — student enrollment sync active.
              </p>
            ) : null}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Input label="Escalation contact name" value={escalationName} onChange={(e) => setEscalationName(e.target.value)} placeholder="Pro-Vice Chancellor" />
            <Input label="Escalation email" type="email" value={escalationEmail} onChange={(e) => setEscalationEmail(e.target.value)} placeholder="pvc@university.ac.bd" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderStep = () => {
    if (role === "student" || role === "industry-professional") return renderStudentStep();
    if (role === "faculty" || role === "teacher") return renderFacultyStep();
    if (role === "researcher") return renderResearcherStep();
    if (role === "organization") return renderOrgStep();
    if (role === "university-admin") return renderUniAdminStep();
    return null;
  };

  const handleContinue = async () => {
    if (!isLast) {
      next();
      return;
    }

    const baseUpdates = { verificationStatus: "Verified" };

    if (role === "student" || role === "industry-professional") {
      await finish({
        ...baseUpdates,
        cgpaRange,
        skills,
        interests,
        careerGoals: careerGoals.split(",").map((s) => s.trim()).filter(Boolean),
        workModePreferences: workModes,
        languages: languagesSpoken,
        locationPreferences: [locationPref],
        weeklyAvailability: weeklyHours,
        financialSupportNeed: needsFinancial,
        expectedCompensation: expectedStipend,
        documents: cv ? [cv] : [],
        privacyPreferences: { showCgpa: shareCgpa, showContact: shareContact },
      });
    } else if (role === "faculty" || role === "teacher") {
      await finish({
        ...baseUpdates,
        researchAreas: researchAreas.split(",").map((s) => s.trim()).filter(Boolean),
        teachingExpertise: teachingAreas.split(",").map((s) => s.trim()).filter(Boolean),
        publications: publications.split("\n").filter(Boolean).map((line) => ({ title: line, year: 2024 })),
        exchangePreference: exchangeOpen,
        consultancyExpertise: consultancyAreas.split(",").map((s) => s.trim()).filter(Boolean),
        availability: { open: true, hoursPerWeek, notes: "" },
        documents: facultyDoc ? [facultyDoc] : [],
      });
    } else if (role === "researcher") {
      await finish({
        ...baseUpdates,
        affiliationType,
        orcid,
        researchAreas: researchAreas.split(",").map((s) => s.trim()).filter(Boolean),
        publications: publications.split("\n").filter(Boolean).map((line) => ({ title: line, year: 2024 })),
        collaborationInterests,
        currentProjects: currentProjects.split("\n").filter(Boolean).map((line) => ({ title: line, status: "Active" })),
        datasetPublishing: datasetInterests,
        availability: { open: true, hoursPerWeek: 10, notes: "Research collaboration" },
        documents: researcherDoc ? [researcherDoc] : [],
      });
    } else if (role === "organization") {
      if (!policyAccepted) {
        toast.error("Please accept organization policies");
        return;
      }
      await finish({
        ...baseUpdates,
        bio: companyBio,
        employeeCount,
        opportunityInterests: hiringTypes,
        partnershipInterests: partnershipTypes,
        cofundingEligible: cofundingInterest,
        documents: orgDoc ? [orgDoc] : [],
      });
    } else if (role === "university-admin") {
      await finish({
        ...baseUpdates,
        permissions,
        workflowNotes,
        erpConnected,
        escalationContact: { name: escalationName, email: escalationEmail },
      });
    }
  };

  return (
    <AuthCard title={config.title} subtitle="Complete your profile to unlock personalized matches." className="max-w-2xl">
      <Link href="/login" className="mb-4 inline-flex items-center gap-1 text-sm text-nexus-700 hover:underline dark:text-nexus-300">
        <ArrowLeft className="h-4 w-4" /> Exit onboarding
      </Link>

      <MultiStepForm steps={config.steps} current={step} onStepChange={setStep}>
        <StepNav
          step={step}
          total={config.steps.length}
          label={config.steps[step]}
          onBack={back}
          onSkip={skip}
          canSkip={canSkip}
          onSave={saveDraft}
          saving={saving}
        />
        {renderStep()}
        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <Button variant="secondary" type="button" onClick={back}>Back</Button>
          ) : null}
          <Button className="flex-1" type="button" onClick={handleContinue} loading={finishing}>
            {isLast ? "Complete onboarding" : "Continue"}
          </Button>
        </div>
      </MultiStepForm>
    </AuthCard>
  );
}
