"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import { OpportunityCard } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { toast } from "sonner";
import { getStudentMatches } from "../_lib/helpers";

const FREELANCE_TYPES = ["Freelance project", "Micro-internship", "Part-time job", "Campus job"];

export default function FreelancePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);

  const freelance = useMemo(
    () => opportunities.filter((o) => FREELANCE_TYPES.some((t) => o.type === t)),
    [opportunities]
  );
  const userMatches = useMemo(
    () => (user ? getStudentMatches(matches, user.id) : []),
    [matches, user]
  );

  const handleApply = async (opp) => {
    const existing = applications.find(
      (a) => a.applicantId === user?.id && a.opportunityId === opp.id && a.status !== "Withdrawn"
    );
    if (existing) {
      router.push(`/student/applications/${existing.id}`);
      return;
    }
    const app = await applicationService.submit({ opportunityId: opp.id, documents: user?.documents?.slice(0, 1) || [] });
    toast.success("Application submitted");
    router.push(`/student/applications/${app.id}`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Freelance & gigs"
        description="Short-term projects, micro-internships, and flexible work"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {freelance.map((opp) => {
          const match = userMatches.find((m) => m.opportunityId === opp.id);
          return (
            <div key={opp.id} className="space-y-2">
              <OpportunityCard opportunity={opp} matchScore={match?.overallScore} />
              <Button size="sm" className="mx-1" onClick={() => handleApply(opp)}>Apply</Button>
            </div>
          );
        })}
      </div>
      {!freelance.length && <p className="text-secondary">No freelance opportunities available.</p>}
    </div>
  );
}
