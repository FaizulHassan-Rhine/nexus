"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
  Button,
  Badge,
  StatusBadge,
  Modal,
  MultiStepForm,
  Checkbox,
  FileUploader,
  Textarea,
  EmptyState,
} from "@/components/ui";
import { MatchBreakdown, FundingSplitCard } from "@/components/domain/Domain";
import { Breadcrumbs } from "@/components/layout/Shell";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser } from "@/hooks/useApp";
import { scoreStudentOpportunity } from "@/lib/matchEngine";
import { applicationService, courseService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const organizations = useAppStore((s) => s.organizations);
  const courses = useAppStore((s) => s.courses);
  const saved = useAppStore((s) => s.savedOpportunityIds || []);
  const toggleSavedOpportunity = useAppStore((s) => s.toggleSavedOpportunity);

  const opportunity = opportunities.find((o) => o.slug === slug);
  const org = organizations.find((o) => o.id === opportunity?.organizationId);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyStep, setApplyStep] = useState(0);
  const [appForm, setAppForm] = useState({ coverLetter: "", availability: "", documents: [] });
  const [schChecklist, setSchChecklist] = useState({});
  const [loading, setLoading] = useState(false);

  const matchScore = useMemo(() => {
    if (!user || user.role !== "student" || !opportunity) return null;
    return scoreStudentOpportunity(user, opportunity);
  }, [user, opportunity]);

  const similar = useMemo(() => {
    if (!opportunity) return [];
    return opportunities
      .filter((o) => o.id !== opportunity.id && (o.type === opportunity.type || o.organizationId === opportunity.organizationId))
      .slice(0, 4);
  }, [opportunities, opportunity]);

  const linkedCourse = courses.find((c) => c.linkedOpportunityIds?.includes(opportunity?.id));

  if (!opportunity) {
    return (
      <div className="page-container py-20">
        <EmptyState
          title="Opportunity not found"
          description="This listing may have been removed or the URL is incorrect."
          action={<Link href="/opportunities"><Button>Browse opportunities</Button></Link>}
        />
      </div>
    );
  }

  const isSaved = saved.includes(opportunity.id);
  const isCourse = ["Free course", "Paid course", "Subsidized course", "Bootcamp"].includes(opportunity.type);
  const isScholarship = opportunity.type === "Scholarship" || opportunity.type === "Fellowship";
  const isJob = !isCourse && !isScholarship;

  const handleSave = () => {
    if (!user) {
      toast.message("Sign in to save opportunities");
      router.push("/login");
      return;
    }
    toggleSavedOpportunity(opportunity.id);
    toast.success(isSaved ? "Removed from saved" : "Saved to your list");
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.message("Sign in to enroll");
      router.push("/login");
      return;
    }
    setLoading(true);
    const courseId = linkedCourse?.id || courses.find((c) => c.title === opportunity.title)?.id;
    if (courseId) {
      await courseService.enroll(courseId);
    } else {
      useAppStore.getState().enrollInCourse(`course-${opportunity.id}`);
    }
    setLoading(false);
    toast.success("Enrolled successfully! Check your student dashboard.");
  };

  const handleApply = async () => {
    if (!user) {
      toast.message("Sign in to apply");
      router.push("/login");
      return;
    }
    setLoading(true);
    await applicationService.submit({
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      organizationId: opportunity.organizationId,
      documents: appForm.documents,
      answers: { coverLetter: appForm.coverLetter, availability: appForm.availability },
    });
    setLoading(false);
    setApplyOpen(false);
    toast.success("Application submitted — routed to university review");
  };

  const handleScholarshipApply = async () => {
    const required = opportunity.requiredDocuments || ["Transcript", "Recommendation letter", "Statement of purpose"];
    const allChecked = required.every((doc) => schChecklist[doc]);
    if (!allChecked) {
      toast.error("Complete the eligibility checklist first");
      return;
    }
    if (!user) {
      toast.message("Sign in to apply");
      router.push("/login");
      return;
    }
    setLoading(true);
    await applicationService.submit({
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      organizationId: opportunity.organizationId,
      documents: required.map((d) => ({ name: `${d}.pdf`, type: d })),
      answers: { checklist: schChecklist },
    });
    setLoading(false);
    toast.success("Scholarship application submitted with document checklist");
  };

  const applySteps = isJob ? ["Profile", "Cover letter", "Documents", "Review"] : [];

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Opportunities", href: "/opportunities" },
          { label: opportunity.title },
        ]}
      />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <header>
            <div className="flex flex-wrap gap-2">
              <Badge tone="teal">{opportunity.type}</Badge>
              {opportunity.ugcProgrammeId ? <Badge tone="violet">UGC support</Badge> : null}
              <StatusBadge status={opportunity.verificationStatus || "Verified"} />
            </div>
            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{opportunity.title}</h1>
            <p className="mt-2 text-secondary">
              {org ? (
                <Link href={`/organizations/${org.slug}`} className="text-nexus-700 hover:underline dark:text-nexus-300">
                  {org.name}
                </Link>
              ) : (
                "Organization"
              )}
              {" · "}{opportunity.location || opportunity.division} · {opportunity.workMode}
            </p>
          </header>

          <section className="card-surface p-5">
            <h2 className="font-semibold">Overview</h2>
            <p className="mt-2 text-secondary">{opportunity.description}</p>
          </section>

          {opportunity.responsibilities?.length ? (
            <section>
              <h2 className="font-semibold">Responsibilities</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-secondary">
                {opportunity.responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          ) : null}

          {opportunity.requirements?.length ? (
            <section>
              <h2 className="font-semibold">Requirements & eligibility</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-secondary">
                {opportunity.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          ) : null}

          {opportunity.requiredSkills?.length ? (
            <section>
              <h2 className="font-semibold">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {opportunity.requiredSkills.map((s) => <Badge key={s} tone="slate">{s}</Badge>)}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-4">
              <h3 className="text-sm font-semibold">Compensation</h3>
              <p className="mt-1 text-lg font-medium">
                {opportunity.compensation?.amount
                  ? formatCurrency(opportunity.compensation.amount, opportunity.compensation.currency)
                  : opportunity.compensation?.label || "See details"}
              </p>
              {opportunity.compensation?.period ? (
                <p className="text-xs text-secondary">Per {opportunity.compensation.period}</p>
              ) : null}
            </div>
            <div className="card-surface p-4">
              <h3 className="text-sm font-semibold">Schedule</h3>
              <p className="mt-1 text-sm">{opportunity.duration || "—"} · {opportunity.weeklyHours || "—"} hrs/week</p>
              <p className="text-xs text-secondary">Deadline {formatDate(opportunity.deadline)}</p>
            </div>
          </section>

          {opportunity.fundingModel?.includes("50/50") ? (
            <FundingSplitCard companyShare={50} ugcShare={50} total={opportunity.compensation?.amount} />
          ) : null}

          {opportunity.learningOutcomes?.length ? (
            <section>
              <h2 className="font-semibold">Learning outcomes</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-secondary">
                {opportunity.learningOutcomes.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </section>
          ) : null}

          {org ? (
            <section className="card-surface p-5">
              <h2 className="font-semibold">About {org.name}</h2>
              <p className="mt-2 text-sm text-secondary">{org.about}</p>
              <Link href={`/organizations/${org.slug}`} className="mt-2 inline-block text-sm text-nexus-700 dark:text-nexus-300">
                View organization profile →
              </Link>
            </section>
          ) : null}

          {similar.length ? (
            <section>
              <h2 className="font-semibold">Similar opportunities</h2>
              <ul className="mt-3 space-y-2">
                {similar.map((s) => (
                  <li key={s.id}>
                    <Link href={`/opportunities/${s.slug}`} className="text-sm text-nexus-700 hover:underline dark:text-nexus-300">
                      {s.title} — {s.type}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface space-y-4 p-5">
            {matchScore ? <MatchBreakdown scoreResult={matchScore} /> : (
              <p className="text-sm text-secondary">Sign in as a student to see your match score.</p>
            )}

            {opportunity.universityApprovalRequired !== false ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                University approval required before organization review.
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              {isCourse ? (
                <Button onClick={handleEnroll} loading={loading}>Enroll now</Button>
              ) : isScholarship ? (
                <Button onClick={handleScholarshipApply} loading={loading}>Apply with checklist</Button>
              ) : (
                <Button onClick={() => setApplyOpen(true)} loading={loading}>Apply</Button>
              )}
              <Button variant="secondary" onClick={handleSave}>
                {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>

          {isScholarship ? (
            <div className="card-surface p-5">
              <h3 className="text-sm font-semibold">Document checklist</h3>
              <div className="mt-3 space-y-2">
                {(opportunity.requiredDocuments || ["Transcript", "Recommendation letter", "Statement of purpose"]).map((doc) => (
                  <Checkbox
                    key={doc}
                    label={doc}
                    checked={!!schChecklist[doc]}
                    onChange={(e) => setSchChecklist((prev) => ({ ...prev, [doc]: e.target.checked }))}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="card-surface p-4 text-sm">
            <p><strong>Safety:</strong> {org?.verificationStatus === "Verified" ? "Verified organization" : "Pending verification"}</p>
            <p className="mt-1 text-secondary">Risk level: {org?.riskLevel || "Unknown"}</p>
          </div>
        </aside>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply — multi-step" size="lg">
        <MultiStepForm steps={applySteps} current={applyStep} onStepChange={setApplyStep}>
          {applyStep === 0 ? (
            <div className="space-y-3 text-sm">
              <p>Applying as: <strong>{user?.name || "Guest"}</strong></p>
              <p className="text-secondary">Your profile will be shared with {org?.name} after university approval.</p>
              <Button onClick={() => setApplyStep(1)}>Continue</Button>
            </div>
          ) : null}
          {applyStep === 1 ? (
            <div className="space-y-3">
              <Textarea
                label="Cover letter"
                rows={5}
                value={appForm.coverLetter}
                onChange={(e) => setAppForm((f) => ({ ...f, coverLetter: e.target.value }))}
                placeholder="Why are you a good fit for this role?"
              />
              <Textarea
                label="Availability confirmation"
                rows={2}
                value={appForm.availability}
                onChange={(e) => setAppForm((f) => ({ ...f, availability: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setApplyStep(0)}>Back</Button>
                <Button onClick={() => setApplyStep(2)}>Continue</Button>
              </div>
            </div>
          ) : null}
          {applyStep === 2 ? (
            <div className="space-y-3">
              <FileUploader
                label="CV / supporting document"
                onChange={(file) => setAppForm((f) => ({ ...f, documents: [...f.documents, file] }))}
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setApplyStep(1)}>Back</Button>
                <Button onClick={() => setApplyStep(3)}>Continue</Button>
              </div>
            </div>
          ) : null}
          {applyStep === 3 ? (
            <div className="space-y-3">
              <p className="text-sm text-secondary">Review your application before submitting to university review.</p>
              <Button onClick={handleApply} loading={loading}>Submit application</Button>
            </div>
          ) : null}
        </MultiStepForm>
      </Modal>
    </div>
  );
}
