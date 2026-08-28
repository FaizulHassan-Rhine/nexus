"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { getResearcherCollaborations } from "../_lib/helpers";

export default function ResearcherCollaborationsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const matches = useAppStore((s) => s.matches);
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const organizations = useAppStore((s) => s.organizations);

  const { active, pending } = useMemo(
    () => (user ? getResearcherCollaborations(matches, opportunities, applications, user.id) : { active: [], pending: [] }),
    [matches, opportunities, applications, user]
  );

  if (!hydrated) return null;

  const renderEntry = (entry, i) => {
    const { opportunity: opp, match, application, status } = entry;
    const org = organizations.find((o) => o.id === opp.organizationId);
    return (
      <article key={`${opp.id}-${i}`} className="card-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="teal">{opp.type}</Badge>
            <h3 className="mt-2 font-semibold">{opp.title}</h3>
            <p className="text-sm text-secondary">{org?.name}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        {match ? (
          <div className="mt-3 space-y-1 text-xs text-secondary">
            <p>University review: {match.universityReviewStatus || "—"}</p>
            <p>Organization: {match.organizationStatus || "—"}</p>
            <p>Matched {formatDate(match.createdAt)}</p>
          </div>
        ) : null}
        {application ? (
          <p className="mt-2 text-sm text-secondary">Application updated {formatDate(application.updatedAt)}</p>
        ) : null}
        {opp.description ? (
          <p className="mt-3 text-sm text-secondary line-clamp-2">{opp.description}</p>
        ) : null}
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaborations"
        description="Active and pending research collaborations, joint projects, and partnership matches"
      />

      <Tabs defaultValue="active">
        <TabList>
          <Tab value="active">Active ({active.length})</Tab>
          <Tab value="pending">Pending ({pending.length})</Tab>
        </TabList>

        <TabPanel value="active">
          <div className="space-y-4">
            {active.map((entry, i) => renderEntry(entry, i))}
            {!active.length && (
              <p className="text-secondary">No active collaborations. Explore opportunities or check pending matches.</p>
            )}
          </div>
        </TabPanel>

        <TabPanel value="pending">
          <div className="space-y-4">
            {pending.map((entry, i) => renderEntry(entry, i))}
            {!pending.length && (
              <p className="text-secondary">No pending collaboration requests.</p>
            )}
          </div>
        </TabPanel>
      </Tabs>

      {(user?.collaborationInterests || []).length ? (
        <div className="card-surface p-4">
          <h3 className="font-semibold">Your collaboration interests</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.collaborationInterests.map((interest) => (
              <Badge key={typeof interest === "string" ? interest : interest.title} tone="violet">
                {typeof interest === "string" ? interest : interest.title}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
