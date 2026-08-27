"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";

export default function ScholarshipsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const scholarships = useAppStore((s) => s.scholarships);
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);

  const open = scholarships.filter((s) => s.status === "Open");

  const handleApply = async (sch) => {
    const oppId = sch.linkedOpportunityId;
    const opp = opportunities.find((o) => o.id === oppId);
    const existing = applications.find(
      (a) => a.applicantId === user?.id && a.opportunityId === oppId && a.status !== "Withdrawn"
    );
    if (existing) {
      toast.message("Application already submitted");
      router.push(`/student/applications/${existing.id}`);
      return;
    }
    const app = await applicationService.submit({
      opportunityId: oppId,
      documents: user?.documents?.filter((d) => ["Transcript", "CV"].includes(d.type)) || [],
      notes: `Scholarship application: ${sch.title}`,
    });
    toast.success(`Applied for ${sch.title}`);
    router.push(`/student/applications/${app.id}`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scholarships"
        description="Merit, need-based, and innovation grants from verified providers"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {open.map((sch) => (
          <article key={sch.id} className="card-surface p-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="violet">{sch.fundingType}</Badge>
              <Badge tone="teal">{sch.degreeLevel}</Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{sch.title}</h3>
            <p className="text-sm text-secondary">{sch.providerName}</p>
            <p className="mt-2 line-clamp-3 text-sm text-secondary">{sch.description}</p>
            <div className="mt-3 space-y-1 text-xs text-secondary">
              <p>Coverage: up to {formatCurrency(sch.coverage?.totalBDT)}</p>
              <p>Min CGPA: {sch.minimumCgpa} · Deadline: {formatDate(sch.deadline)}</p>
              <p>{sch.slots} slots · Subjects: {(sch.subjects || []).join(", ")}</p>
            </div>
            <div className="mt-4 flex gap-2">
              {sch.linkedOpportunityId ? (
                <>
                  <Button size="sm" onClick={() => handleApply(sch)}>Apply via Nexus</Button>
                  {opportunities.find((o) => o.id === sch.linkedOpportunityId) ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        router.push(`/opportunities/${opportunities.find((o) => o.id === sch.linkedOpportunityId).slug}`)
                      }
                    >
                      View opportunity
                    </Button>
                  ) : null}
                </>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => toast.message("Contact provider for external applications")}>
                  Request info
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
