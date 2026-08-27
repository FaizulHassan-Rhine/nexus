"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Button, Textarea, Checkbox, Badge, StatusBadge, SectionHeader } from "@/components/ui";
import { ApplicationTimeline, AuditEventList, MatchBreakdown, FundingSplitCard, PaymentMilestones } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { buildReviewQueue, getUniversityId, DEFAULT_CHECKLIST } from "../../_lib/helpers";
import { Breadcrumbs } from "@/components/layout/Shell";

export default function ReviewWorkspacePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const params = useParams();
  const router = useRouter();
  const itemKey = decodeURIComponent(params.id);
  const uniId = getUniversityId(user);

  const state = useAppStore();
  const approveMatch = useAppStore((s) => s.approveMatch);
  const rejectMatch = useAppStore((s) => s.rejectMatch);
  const requestChanges = useAppStore((s) => s.requestChanges);
  const updateApplicationStatus = useAppStore((s) => s.updateApplicationStatus);
  const reviewFundingRequest = useAppStore((s) => s.reviewFundingRequest);
  const verifyUserProfile = useAppStore((s) => s.verifyUserProfile);
  const editOpportunity = useAppStore((s) => s.editOpportunity);
  const updateTechnology = useAppStore((s) => s.updateTechnology);
  const escalateTicket = useAppStore((s) => s.escalateTicket);
  const addAuditEvent = useAppStore((s) => s.addAuditEvent);
  const assignReviewItem = useAppStore((s) => s.assignReviewItem);

  const [note, setNote] = useState("");
  const [checklist, setChecklist] = useState({});

  const item = useMemo(() => {
    const queue = buildReviewQueue(
      {
        users: state.users,
        matches: state.matches,
        applications: state.applications,
        opportunities: state.opportunities,
        funding: state.funding,
        technologies: state.technologies,
        scholarships: state.scholarships,
      },
      uniId
    );
    return queue.find((q) => q.key === itemKey);
  }, [state, uniId, itemKey]);

  const auditEvents = useAppStore((s) => s.audit).filter(
    (e) => e.entityId === item?.id || e.entityId === itemKey
  ).slice(0, 10);

  const checklistItems = DEFAULT_CHECKLIST[item?.type] || [];

  const toggleCheck = (label) => setChecklist((c) => ({ ...c, [label]: !c[label] }));
  const allChecked = checklistItems.every((l) => checklist[l]);

  const handleApprove = () => {
    if (!item) return;
    if (checklistItems.length && !allChecked) {
      toast.error("Complete the checklist first");
      return;
    }
    if (item.type === "match") approveMatch(item.id, note || "Approved by university");
    else if (item.type === "verification") verifyUserProfile(item.id, "Verified", note);
    else if (item.type === "internship" || item.type === "scholarship" || item.type === "faculty-exchange")
      updateApplicationStatus(item.id, "University approved", note, "university-admin");
    else if (item.type === "funding")
      reviewFundingRequest(item.id, "Under UGC review", { note, universityVerification: { status: "Approved", verifiedBy: user?.id, at: new Date().toISOString() } });
    else if (item.type === "opportunity") editOpportunity(item.id, { verificationStatus: "Verified", status: "Published" });
    else if (item.type === "technology") updateTechnology(item.id, { status: "Available for licensing" });
    assignReviewItem(itemKey, { status: "Approved", note });
    toast.success("Approved");
    router.push("/university-admin/review-queue");
  };

  const handleReject = () => {
    if (!item || !note.trim()) {
      toast.error("Rejection note required");
      return;
    }
    if (item.type === "match") rejectMatch(item.id, note);
    else if (item.type === "verification") verifyUserProfile(item.id, "Rejected", note);
    else if (["internship", "scholarship", "faculty-exchange"].includes(item.type))
      updateApplicationStatus(item.id, "Rejected", note, "university-admin");
    else if (item.type === "funding") reviewFundingRequest(item.id, "Rejected", { note });
    else if (item.type === "opportunity") editOpportunity(item.id, { verificationStatus: "Rejected", status: "Closed" });
    else if (item.type === "technology") updateTechnology(item.id, { status: "Rejected" });
    toast.success("Rejected");
    router.push("/university-admin/review-queue");
  };

  const handleRequestChanges = () => {
    if (!item || !note.trim()) {
      toast.error("Note required");
      return;
    }
    if (item.type === "match") requestChanges("match", item.id, note);
    else requestChanges("application", item.id, note);
    toast.success("Changes requested");
    router.push("/university-admin/review-queue");
  };

  const handleEscalate = () => {
    addAuditEvent({
      actorId: user?.id,
      action: "escalate_review",
      entityType: item?.type,
      entityId: item?.id,
      details: note || "Escalated to senior reviewer",
    });
    assignReviewItem(itemKey, { escalated: true, note });
    toast.success("Escalated to senior reviewer");
  };

  if (!hydrated) return null;
  if (!item) {
    return (
      <div className="space-y-4">
        <PageHeader title="Review item not found" description={itemKey} />
        <Button onClick={() => router.push("/university-admin/review-queue")}>Back to queue</Button>
      </div>
    );
  }

  const entity = item.entity;
  const applicant = state.users.find((u) => u.id === entity?.applicantId || u.id === entity?.studentId || u.id === entity?.candidateId || u.id === item.id);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Review queue", href: "/university-admin/review-queue" }, { label: item.title }]} />
      <PageHeader
        title={item.title}
        description={`${item.type} · ${item.subtitle || ""}`}
        actions={
          <>
            <Button variant="secondary" onClick={handleRequestChanges}>Request changes</Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card-surface p-4">
            <SectionHeader title="Details" />
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> <StatusBadge status={item.status} /></p>
              <p><strong>Priority:</strong> <Badge tone="amber">{item.priority}</Badge></p>
              {applicant ? <p><strong>Candidate:</strong> {applicant.name} ({applicant.role})</p> : null}
              {entity?.overallScore != null ? <p><strong>Match score:</strong> {entity.overallScore}%</p> : null}
              {entity?.requestedAmount ? <p><strong>Requested:</strong> {formatCurrency(entity.requestedAmount)}</p> : null}
              {entity?.timeline ? (
                <div className="mt-4">
                  <h4 className="font-medium">Timeline</h4>
                  <ApplicationTimeline events={entity.timeline.map((e) => ({ ...e, status: e.status || e.note }))} />
                </div>
              ) : null}
            </div>
          </div>

          {item.type === "match" && entity ? (
            <div className="card-surface p-4">
              <h3 className="font-semibold">Match breakdown</h3>
              <MatchBreakdown scoreResult={entity} className="mt-4" />
            </div>
          ) : null}

          {item.type === "funding" && entity ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FundingSplitCard companyShare={entity.companySharePercent || 50} ugcShare={entity.ugcSharePercent || 50} total={entity.requestedAmount} />
              <div className="card-surface p-4">
                <h3 className="font-semibold">Milestones</h3>
                <PaymentMilestones milestones={entity.milestones || []} />
              </div>
            </div>
          ) : null}

          {entity?.documents?.length ? (
            <div className="card-surface p-4">
              <h3 className="font-semibold">Documents</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {entity.documents.map((d, i) => (
                  <li key={i}>{d.name} — {d.type} · {formatDate(d.uploadedAt)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="card-surface p-4">
            <h3 className="font-semibold">Checklist</h3>
            <ul className="mt-3 space-y-2">
              {checklistItems.map((label) => (
                <li key={label}>
                  <Checkbox label={label} checked={Boolean(checklist[label])} onChange={() => toggleCheck(label)} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-4">
            <Textarea label="Review notes" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Decision rationale..." />
            <Button className="mt-3 w-full" variant="outline" onClick={handleEscalate}>Escalate</Button>
          </div>

          <div className="card-surface p-4">
            <h3 className="font-semibold">Audit trail</h3>
            <AuditEventList events={auditEvents} />
          </div>
        </div>
      </div>
    </div>
  );
}
