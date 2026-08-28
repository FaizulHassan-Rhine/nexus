"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Switch, Badge, StatusBadge } from "@/components/ui";
import { OpportunityCard, OpportunityCollection, PaymentMilestones, ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import {
  filterFacultyOpportunities,
  getFacultyApplications,
} from "../_lib/helpers";

const DEFAULT_MILESTONES = [
  { id: "m1", label: "Kick-off & scope sign-off", amount: 45000, dueDate: "2026-09-15", status: "Pending" },
  { id: "m2", label: "Mid-project deliverable", amount: 60000, dueDate: "2026-11-01", status: "Pending" },
  { id: "m3", label: "Final report & handover", amount: 45000, dueDate: "2026-12-15", status: "Pending" },
];

export default function FacultyConsultancyPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [proposal, setProposal] = useState({ scope: "", timeline: "", fee: "" });
  const [coi, setCoi] = useState({ hasConflict: false, details: "", declared: false });
  const [feedback, setFeedback] = useState("");
  const [applying, setApplying] = useState(null);
  const [view, setView] = useState("grid");

  const consultancyOpps = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "consultancy" }),
    [opportunities]
  );
  const consultancyApps = useMemo(() => {
    const mine = user ? getFacultyApplications(applications, user.id) : [];
    const ids = new Set(consultancyOpps.map((o) => o.id));
    return mine.filter((a) => ids.has(a.opportunityId));
  }, [applications, user, consultancyOpps]);

  const contracts = user?.consultancyContracts || DEFAULT_MILESTONES.map((m, i) => ({
    ...m,
    contractId: "con-demo-001",
    engagement: "Digital Identity Consultancy",
    status: i === 0 ? "Paid" : "Pending",
  }));

  const declareCoi = () => {
    if (!user) return;
    updateProfile(user.id, {
      coiDeclarations: [
        ...(user.coiDeclarations || []),
        { ...coi, declaredAt: new Date().toISOString(), opportunityType: "Consultancy" },
      ],
    });
    setCoi({ ...coi, declared: true });
    toast.success("Conflict of interest declaration recorded");
  };

  const submitProposal = async (opp) => {
    if (!proposal.scope.trim()) {
      toast.error("Scope of work required");
      return;
    }
    if (!coi.declared && !user?.coiDeclarations?.length) {
      toast.error("Complete COI declaration first");
      return;
    }
    setApplying(opp.id);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        applicantRole: "faculty",
        answers: { scope: proposal.scope, timeline: proposal.timeline, proposedFee: proposal.fee },
      });
      updateProfile(user.id, {
        consultancyProposals: [
          ...(user.consultancyProposals || []),
          { opportunityId: opp.id, ...proposal, status: "University review", at: new Date().toISOString() },
        ],
      });
      toast.success("Consultancy proposal submitted — awaiting university approval");
    } finally {
      setApplying(null);
    }
  };

  const submitFeedback = () => {
    if (!user || !feedback.trim()) return;
    updateProfile(user.id, {
      consultancyFeedback: [...(user.consultancyFeedback || []), { body: feedback, at: new Date().toISOString() }],
    });
    toast.success("Completion feedback submitted");
    setFeedback("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Consultancy" description="Marketplace, proposals, COI, university approval, milestones, and feedback" />

      <Tabs defaultValue="marketplace">
        <TabList>
          <Tab value="marketplace">Marketplace</Tab>
          <Tab value="proposal">Proposal</Tab>
          <Tab value="coi">COI declaration</Tab>
          <Tab value="contracts">Contracts</Tab>
        </TabList>

        <TabPanel value="marketplace">
          <OpportunityCollection view={view} onViewChange={setView} count={consultancyOpps.length} countLabel="consultancy roles">
            {consultancyOpps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} view={view} />
            ))}
          </OpportunityCollection>
        </TabPanel>

        <TabPanel value="proposal">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Textarea label="Scope of work" rows={4} value={proposal.scope} onChange={(e) => setProposal({ ...proposal, scope: e.target.value })} />
            <Input label="Timeline" value={proposal.timeline} onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })} />
            <Input label="Proposed fee (BDT)" type="number" value={proposal.fee} onChange={(e) => setProposal({ ...proposal, fee: e.target.value })} />
            {consultancyOpps.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <span className="text-sm font-medium">{o.title}</span>
                <Button size="sm" loading={applying === o.id} onClick={() => submitProposal(o)}>Submit proposal</Button>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="coi">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch
              label="I have a potential conflict of interest"
              checked={coi.hasConflict}
              onChange={(v) => setCoi({ ...coi, hasConflict: v })}
            />
            <Textarea
              label="Details (if any)"
              rows={3}
              value={coi.details}
              onChange={(e) => setCoi({ ...coi, details: e.target.value })}
            />
            <Button onClick={declareCoi}>Declare & save</Button>
            {(user?.coiDeclarations || []).map((d, i) => (
              <p key={i} className="text-sm text-secondary">Declared {formatDate(d.declaredAt)} — conflict: {d.hasConflict ? "Yes" : "None"}</p>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="contracts">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold">Application status</h3>
              {consultancyApps.map((app) => {
                const opp = consultancyOpps.find((o) => o.id === app.opportunityId);
                return (
                  <div key={app.id} className="card-surface mt-3 p-4">
                    <div className="flex gap-2">
                      <span className="font-medium">{opp?.title}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <ApplicationTimeline events={app.timeline || []} className="mt-3" />
                  </div>
                );
              })}
            </div>
            <div>
              <h3 className="font-semibold">Payment milestones</h3>
              <PaymentMilestones milestones={contracts} className="mt-3" />
              <p className="mt-4 text-sm text-secondary">Total contract: {formatCurrency(150000)}</p>
              <Textarea label="Completion feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="mt-4" />
              <Button className="mt-2" variant="secondary" onClick={submitFeedback}>Submit feedback</Button>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
