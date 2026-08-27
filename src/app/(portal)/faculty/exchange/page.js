"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Badge, StatusBadge } from "@/components/ui";
import { OpportunityCard, ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  filterFacultyOpportunities,
  getFacultyApplications,
  getFacultyMatches,
} from "../_lib/helpers";

export default function FacultyExchangePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const organizations = useAppStore((s) => s.organizations);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [plan, setPlan] = useState({ teaching: "", research: "", duration: "1 semester" });
  const [report, setReport] = useState({ outcomes: "", publications: "", feedback: "" });
  const [applying, setApplying] = useState(null);

  const exchangeOpps = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "exchange" }),
    [opportunities]
  );
  const userMatches = useMemo(
    () => (user ? getFacultyMatches(matches, user.id) : []),
    [matches, user]
  );
  const exchangeApps = useMemo(() => {
    const userApps = user ? getFacultyApplications(applications, user.id) : [];
    const exchangeIds = new Set(exchangeOpps.map((o) => o.id));
    return userApps.filter((a) => exchangeIds.has(a.opportunityId));
  }, [applications, user, exchangeOpps]);

  const completedExchange = exchangeApps.find((a) => ["Completed", "Accepted", "In progress"].includes(a.status));

  const checkEligibility = (opp) => {
    const match = userMatches.find((m) => m.opportunityId === opp.id);
    const eligible = user?.exchangePreference && (match?.overallScore ?? 60) >= 50;
    toast.message(eligible ? "Eligible — profile meets exchange requirements" : "Review gaps before applying");
    return eligible;
  };

  const apply = async (opp) => {
    if (!plan.teaching.trim() || !plan.research.trim()) {
      toast.error("Teaching and research plan required");
      return;
    }
    setApplying(opp.id);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        applicantRole: "faculty",
        answers: { teachingPlan: plan.teaching, researchPlan: plan.research, duration: plan.duration },
        documents: [{ name: "Exchange_Research_Plan.pdf", type: "Research plan" }],
      });
      toast.success("Exchange application submitted — routed for university approval");
    } finally {
      setApplying(null);
    }
  };

  const submitReport = () => {
    if (!user || !report.outcomes.trim()) {
      toast.error("Outcomes summary required");
      return;
    }
    updateProfile(user.id, {
      exchangeReports: [
        ...(user.exchangeReports || []),
        { id: `exr-${Date.now()}`, ...report, submittedAt: new Date().toISOString(), status: "Submitted" },
      ],
    });
    toast.success("Post-exchange report submitted to university");
    setReport({ outcomes: "", publications: "", feedback: "" });
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty exchange" description="Discovery, eligibility, application tracking, and post-exchange reporting" />

      <Tabs defaultValue="discover">
        <TabList>
          <Tab value="discover">Discovery</Tab>
          <Tab value="apply">Apply</Tab>
          <Tab value="tracking">Tracking</Tab>
          <Tab value="report">Post-exchange report</Tab>
        </TabList>

        <TabPanel value="discover">
          <div className="grid gap-4 md:grid-cols-2">
            {exchangeOpps.map((o) => {
              const org = organizations.find((x) => x.id === o.organizationId);
              const match = userMatches.find((m) => m.opportunityId === o.id);
              return (
                <div key={o.id} className="card-surface p-4">
                  <OpportunityCard opportunity={o} matchScore={match?.overallScore} />
                  <p className="mt-2 text-sm text-secondary">Host: {org?.name}</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => checkEligibility(o)}>
                    Check eligibility
                  </Button>
                </div>
              );
            })}
          </div>
        </TabPanel>

        <TabPanel value="apply">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <h3 className="font-semibold">Teaching & research plan</h3>
            <Input label="Teaching plan" value={plan.teaching} onChange={(e) => setPlan({ ...plan, teaching: e.target.value })} placeholder="Modules to deliver abroad" />
            <Textarea label="Research plan" rows={4} value={plan.research} onChange={(e) => setPlan({ ...plan, research: e.target.value })} />
            <Input label="Duration" value={plan.duration} onChange={(e) => setPlan({ ...plan, duration: e.target.value })} />
            <div className="space-y-3">
              {exchangeOpps.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="text-sm font-medium">{o.title}</span>
                  <Button size="sm" loading={applying === o.id} onClick={() => apply(o)}>Apply</Button>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel value="tracking">
          {exchangeApps.length ? (
            exchangeApps.map((app) => {
              const opp = exchangeOpps.find((o) => o.id === app.opportunityId);
              return (
                <div key={app.id} className="card-surface mb-4 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{opp?.title}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 text-sm text-secondary">Submitted {formatDate(app.submittedAt)} · University approval required</p>
                  <ApplicationTimeline events={app.timeline || []} className="mt-4" />
                </div>
              );
            })
          ) : (
            <p className="text-secondary">No exchange applications yet.</p>
          )}
        </TabPanel>

        <TabPanel value="report">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <p className="text-sm text-secondary">
              {completedExchange
                ? "Simulate post-exchange reporting for your active or completed exchange."
                : "Complete an exchange to unlock full reporting — demo mode allows draft submission."}
            </p>
            <Textarea label="Outcomes summary" rows={3} value={report.outcomes} onChange={(e) => setReport({ ...report, outcomes: e.target.value })} />
            <Textarea label="Publications & collaborations" rows={2} value={report.publications} onChange={(e) => setReport({ ...report, publications: e.target.value })} />
            <Textarea label="Host institution feedback" rows={2} value={report.feedback} onChange={(e) => setReport({ ...report, feedback: e.target.value })} />
            <Button onClick={submitReport}>Submit report to university</Button>
            {(user?.exchangeReports || []).length ? (
              <ul className="space-y-2 text-sm">
                {user.exchangeReports.map((r) => (
                  <li key={r.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <Badge tone="green">{r.status}</Badge>
                    <p className="mt-1">{r.outcomes}</p>
                    <p className="text-xs text-secondary">{formatDate(r.submittedAt)}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
