"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Button, Badge, StatusBadge } from "@/components/ui";
import { ConfirmDialog, Modal } from "@/components/ui";
import { ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService, disputeService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { Textarea, Select, Input } from "@/components/ui";
import { toast } from "sonner";

export default function ApplicationDetailPage({ params }) {
  const { id } = use(params);
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const organizations = useAppStore((s) => s.organizations);
  const funding = useAppStore((s) => s.funding);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [issueType, setIssueType] = useState("Application process unfairness");
  const [issueDesc, setIssueDesc] = useState("");
  const [remedy, setRemedy] = useState("");

  const app = applications.find((a) => a.id === id);
  const opp = opportunities.find((o) => o.id === app?.opportunityId);
  const org = organizations.find((o) => o.id === opp?.organizationId);
  const linkedFunding = funding.find((f) => f.applicationId === id || f.id === app?.fundingRequestId);

  const canManage = app?.applicantId === user?.id;

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await applicationService.withdraw(id);
      toast.success("Application withdrawn");
      setWithdrawOpen(false);
      router.push("/student/applications");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleRaiseIssue = async () => {
    if (!issueDesc.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    await disputeService.create({
      issueType,
      description: issueDesc,
      requestedRemedy: remedy,
      linkedApplicationId: id,
      parties: {
        student: user?.id,
        organization: opp?.organizationId,
        university: user?.universityId,
      },
    });
    toast.success("Dispute filed — track it in Disputes");
    setIssueOpen(false);
    setIssueDesc("");
    setRemedy("");
    router.push("/student/disputes");
  };

  if (!hydrated) return null;

  if (!app) {
    return (
      <div className="space-y-4">
        <PageHeader title="Application not found" />
        <Link href="/student/applications" className="text-nexus-700">Back to applications</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={opp?.title || "Application"}
        description={org?.name}
        breadcrumbs={
          <Link href="/student/applications" className="text-sm text-nexus-700">
            ← Applications
          </Link>
        }
        actions={
          canManage ? (
            <>
              {app.status !== "Withdrawn" && app.status !== "Rejected" && app.status !== "Completed" ? (
                <Button variant="danger" onClick={() => setWithdrawOpen(true)}>
                  Withdraw
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setIssueOpen(true)}>
                Raise issue
              </Button>
            </>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface space-y-4 p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={app.status} />
            <span className="text-sm text-secondary">Submitted {formatDate(app.submittedAt)}</span>
          </div>
          {app.notes ? <p className="text-sm text-secondary">{app.notes}</p> : null}
          {app.reviewerFeedback ? (
            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
              <p className="font-medium">Reviewer feedback</p>
              <p className="mt-1 text-secondary">{app.reviewerFeedback}</p>
            </div>
          ) : null}
          {app.interviewDetails ? (
            <div className="rounded-xl border border-nexus-200 p-3 text-sm dark:border-nexus-800">
              <p className="font-medium">Interview</p>
              <p className="mt-1">{formatDate(app.interviewDetails.date, "dd MMM yyyy HH:mm")}</p>
              <p className="text-secondary">{app.interviewDetails.mode} · {app.interviewDetails.location}</p>
              <p className="text-secondary">Interviewer: {app.interviewDetails.interviewer}</p>
            </div>
          ) : null}
          <div>
            <h3 className="font-semibold">Timeline</h3>
            <ApplicationTimeline events={app.timeline || []} className="mt-4" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-4">
            <h3 className="font-semibold">Documents</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(app.documents || []).map((d, i) => (
                <li key={i} className="flex justify-between">
                  <span>{d.name}</span>
                  <Badge tone="slate">{d.type}</Badge>
                </li>
              ))}
              {!app.documents?.length && <p className="text-secondary">No documents</p>}
            </ul>
          </div>
          {linkedFunding ? (
            <div className="card-surface p-4">
              <h3 className="font-semibold">Linked funding</h3>
              <p className="mt-2 text-sm">{linkedFunding.programme}</p>
              <StatusBadge status={linkedFunding.status} />
              <Link href="/student/finance" className="mt-2 block text-sm text-nexus-700">
                View finance →
              </Link>
            </div>
          ) : null}
          {opp ? (
            <div className="card-surface p-4">
              <h3 className="font-semibold">Opportunity</h3>
              <Link href={`/opportunities/${opp.slug}`} className="mt-2 block text-sm text-nexus-700">
                {opp.title}
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={handleWithdraw}
        title="Withdraw application?"
        description="This action cannot be undone. The organization will be notified."
        confirmLabel="Withdraw"
        danger
        loading={withdrawing}
      />

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Raise an issue" description="File a dispute linked to this application">
        <div className="space-y-4">
          <Select
            label="Issue type"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            options={[
              "Application process unfairness",
              "Unsafe working conditions",
              "Stipend payment delay",
              "Rejection feedback inadequate",
              "Other",
            ]}
          />
          <Textarea label="Description" rows={4} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} />
          <Input label="Requested remedy" value={remedy} onChange={(e) => setRemedy(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button onClick={handleRaiseIssue}>Submit dispute</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
