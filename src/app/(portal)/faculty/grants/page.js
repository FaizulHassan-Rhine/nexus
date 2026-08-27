"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Badge, StatusBadge } from "@/components/ui";
import { OpportunityCard, ApplicationTimeline, FundingSplitCard } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import {
  filterFacultyOpportunities,
  getFacultyApplications,
} from "../_lib/helpers";

export default function FacultyGrantsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [draft, setDraft] = useState({
    title: "",
    summary: "",
    team: "",
    equipment: 0,
    personnel: 0,
    travel: 0,
    overhead: 0,
  });
  const [submitting, setSubmitting] = useState(null);

  const grantOpps = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "grant" }),
    [opportunities]
  );
  const grantApps = useMemo(() => {
    const mine = user ? getFacultyApplications(applications, user.id) : [];
    const grantIds = new Set(grantOpps.map((o) => o.id));
    return mine.filter((a) => grantIds.has(a.opportunityId));
  }, [applications, user, grantOpps]);

  const totalBudget = Number(draft.equipment) + Number(draft.personnel) + Number(draft.travel) + Number(draft.overhead);
  const proposals = user?.grantProposals || [];

  const saveDraft = () => {
    if (!user || !draft.title.trim()) {
      toast.error("Proposal title required");
      return;
    }
    const entry = {
      id: `grant-${Date.now()}`,
      ...draft,
      totalBudget,
      status: "Draft",
      updatedAt: new Date().toISOString(),
    };
    updateProfile(user.id, { grantProposals: [entry, ...proposals] });
    toast.success("Proposal draft saved");
  };

  const submitForEndorsement = async (opp) => {
    if (!draft.title.trim()) {
      toast.error("Save a proposal draft first");
      return;
    }
    setSubmitting(opp.id);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        applicantRole: "faculty",
        answers: { proposalTitle: draft.title, budget: totalBudget, team: draft.team },
        documents: [{ name: "Grant_Proposal_Draft.pdf", type: "Proposal" }],
      });
      updateProfile(user.id, {
        grantProposals: proposals.map((p) =>
          p.title === draft.title ? { ...p, status: "University review", submittedAt: new Date().toISOString() } : p
        ),
      });
      toast.success("Submitted for university endorsement");
    } finally {
      setSubmitting(null);
    }
  };

  const checkEligibility = (opp) => {
    const deptOk = !opp.departments?.length || opp.departments.includes(user?.department);
    toast.message(deptOk ? "Eligible based on department and faculty role" : "Department mismatch — review requirements");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Grants" description="Grant calls, proposal drafts, budget, university endorsement, and award status" />

      <Tabs defaultValue="calls">
        <TabList>
          <Tab value="calls">Grant calls</Tab>
          <Tab value="draft">Proposal draft</Tab>
          <Tab value="budget">Budget</Tab>
          <Tab value="status">Status</Tab>
        </TabList>

        <TabPanel value="calls">
          <div className="grid gap-4 md:grid-cols-2">
            {grantOpps.map((o) => (
              <div key={o.id} className="space-y-2">
                <OpportunityCard opportunity={o} />
                <div className="flex gap-2 px-1">
                  <Button size="sm" variant="outline" onClick={() => checkEligibility(o)}>Eligibility</Button>
                  <Button size="sm" loading={submitting === o.id} onClick={() => submitForEndorsement(o)}>
                    Submit for endorsement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="draft">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Input label="Proposal title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <Textarea label="Summary" rows={4} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
            <Textarea
              label="Team members (names or IDs)"
              rows={2}
              value={draft.team}
              onChange={(e) => setDraft({ ...draft, team: e.target.value })}
              placeholder="Co-PIs, research assistants..."
            />
            <Button onClick={saveDraft}>Save draft</Button>
            {proposals.length ? (
              <ul className="space-y-2 text-sm">
                {proposals.map((p) => (
                  <li key={p.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.title}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-secondary">{formatCurrency(p.totalBudget)} · {formatDate(p.updatedAt)}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </TabPanel>

        <TabPanel value="budget">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-surface space-y-4 p-4">
              <Input label="Equipment (BDT)" type="number" value={draft.equipment} onChange={(e) => setDraft({ ...draft, equipment: e.target.value })} />
              <Input label="Personnel (BDT)" type="number" value={draft.personnel} onChange={(e) => setDraft({ ...draft, personnel: e.target.value })} />
              <Input label="Travel (BDT)" type="number" value={draft.travel} onChange={(e) => setDraft({ ...draft, travel: e.target.value })} />
              <Input label="Overhead (BDT)" type="number" value={draft.overhead} onChange={(e) => setDraft({ ...draft, overhead: e.target.value })} />
              <p className="text-lg font-semibold">Total: {formatCurrency(totalBudget)}</p>
              <Button variant="secondary" onClick={saveDraft}>Save budget to draft</Button>
            </div>
            <FundingSplitCard companyShare={30} ugcShare={70} total={totalBudget} />
          </div>
        </TabPanel>

        <TabPanel value="status">
          {grantApps.length ? (
            grantApps.map((app) => {
              const opp = grantOpps.find((o) => o.id === app.opportunityId);
              return (
                <div key={app.id} className="card-surface mb-4 p-4">
                  <div className="flex flex-wrap gap-2">
                    <h3 className="font-semibold">{opp?.title}</h3>
                    <StatusBadge status={app.status} />
                    {opp?.ugcProgrammeId ? <Badge tone="violet">UGC review</Badge> : null}
                  </div>
                  <ApplicationTimeline events={app.timeline || []} className="mt-4" />
                </div>
              );
            })
          ) : (
            <p className="text-secondary">No grant applications submitted yet.</p>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
