"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader, DataTable, SectionHeader } from "@/components/ui";
import { Button, Input, Textarea, Select, Tabs, TabList, Tab, TabPanel, StatusBadge, Badge } from "@/components/ui";
import { MatchScoreRing } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrgMatches } from "../../_lib/helpers";

export default function EditOpportunityPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "details";

  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const matches = useAppStore((s) => s.matches);
  const users = useAppStore((s) => s.users);
  const editOpportunity = useAppStore((s) => s.editOpportunity);
  const publishOpportunity = useAppStore((s) => s.publishOpportunity);
  const closeOpportunity = useAppStore((s) => s.closeOpportunity);

  const opp = opportunities.find((o) => o.id === params.id);
  const [form, setForm] = useState(null);
  const data = form || opp;

  const oppApps = useMemo(
    () => applications.filter((a) => a.opportunityId === opp?.id),
    [applications, opp]
  );
  const oppMatches = useMemo(
    () => getOrgMatches(matches, opportunities, user?.organizationId).filter((m) => m.opportunityId === opp?.id),
    [matches, opportunities, user, opp]
  );

  const set = (key, val) => setForm((f) => ({ ...(f || opp), [key]: val }));

  const save = () => {
    if (!opp || !data) return;
    editOpportunity(opp.id, {
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      slots: Number(data.slots),
      location: data.location,
      workMode: data.workMode,
      compensation: data.compensation,
    });
    setForm(null);
    toast.success("Opportunity updated");
  };

  const moveApp = async (appId, status) => {
    await applicationService.updateStatus(appId, status, `Updated by ${user?.name}`, user?.role);
    toast.success(`Application → ${status}`);
  };

  if (!hydrated) return null;
  if (!opp) {
    return (
      <div className="card-surface p-8 text-center">
        <p>Opportunity not found.</p>
        <Button className="mt-4" onClick={() => router.push("/organization/opportunities")}>Back to list</Button>
      </div>
    );
  }

  const candidateColumns = [
    { key: "applicant", label: "Candidate", render: (row) => {
      const u = users.find((x) => x.id === row.applicantId);
      return (
        <Link href={`/organization/candidates/${row.applicantId}?opp=${opp.id}`} className="font-medium text-nexus-700">
          {u?.name || row.applicantId}
        </Link>
      );
    }},
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "submitted", label: "Submitted", render: (row) => formatDate(row.submittedAt) },
    { key: "match", label: "Match", render: (row) => {
      const m = oppMatches.find((x) => x.candidateId === row.applicantId);
      return m ? <MatchScoreRing score={m.overallScore} size={40} /> : "—";
    }},
    { key: "actions", label: "Actions", render: (row) => (
      <Select
        value={row.status}
        onChange={(e) => moveApp(row.id, e.target.value)}
        options={[
          { value: "Shortlisted", label: "Shortlist" },
          { value: "Interview scheduled", label: "Schedule interview" },
          { value: "Offered", label: "Send offer" },
          { value: "Rejected", label: "Reject" },
        ]}
      />
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        description={`${data.type} · ${data.status || "Published"}`}
        actions={
          <>
            <Link href={`/opportunities/${opp.slug}`} target="_blank">
              <Button variant="ghost" size="sm">Public preview</Button>
            </Link>
            {data.status === "Draft" ? (
              <Button size="sm" onClick={() => { publishOpportunity(opp.id); toast.success("Published"); }}>Publish</Button>
            ) : null}
            {data.status !== "Closed" ? (
              <Button variant="secondary" size="sm" onClick={() => { closeOpportunity(opp.id); toast.success("Closed"); }}>Close</Button>
            ) : null}
            <Button size="sm" onClick={save}>Save</Button>
          </>
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabList>
          <Tab value="details">Details</Tab>
          <Tab value="candidates">Candidates ({oppApps.length})</Tab>
          <Tab value="matches">Matches ({oppMatches.length})</Tab>
        </TabList>

        <TabPanel value="details" className="mt-4">
          <div className="card-surface grid gap-4 p-4 sm:grid-cols-2">
            <Input label="Title" value={data.title || ""} onChange={(e) => set("title", e.target.value)} />
            <Input label="Deadline" type="date" value={data.deadline?.slice(0, 10) || ""} onChange={(e) => set("deadline", e.target.value)} />
            <Input label="Location" value={data.location || ""} onChange={(e) => set("location", e.target.value)} />
            <Select label="Work mode" value={data.workMode || ""} onChange={(e) => set("workMode", e.target.value)} options={[
              { value: "Onsite", label: "Onsite" },
              { value: "Hybrid", label: "Hybrid" },
              { value: "Remote", label: "Remote" },
            ]} />
            <Input label="Slots" type="number" value={data.slots || 1} onChange={(e) => set("slots", e.target.value)} />
            <Textarea className="sm:col-span-2" label="Description" rows={4} value={data.description || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="teal">{data.type}</Badge>
            {data.ugcProgrammeId ? <Badge tone="violet">UGC co-funding</Badge> : null}
            <StatusBadge status={data.verificationStatus || "Pending"} />
          </div>
          <SectionHeader className="mt-6" title="Metrics" />
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            <div className="card-surface p-3 text-center">
              <p className="text-2xl font-semibold">{data.metrics?.views ?? 0}</p>
              <p className="text-xs text-secondary">Views</p>
            </div>
            <div className="card-surface p-3 text-center">
              <p className="text-2xl font-semibold">{oppApps.length}</p>
              <p className="text-xs text-secondary">Applications</p>
            </div>
            <div className="card-surface p-3 text-center">
              <p className="text-2xl font-semibold">{data.metrics?.saves ?? 0}</p>
              <p className="text-xs text-secondary">Saves</p>
            </div>
          </div>
          {data.compensation ? (
            <p className="mt-4 text-sm">Compensation: {formatCurrency(data.compensation.amount, data.compensation.currency)} / {data.compensation.period}</p>
          ) : null}
        </TabPanel>

        <TabPanel value="candidates" className="mt-4">
          <DataTable columns={candidateColumns} rows={oppApps} emptyMessage="No applications yet." />
        </TabPanel>

        <TabPanel value="matches" className="mt-4">
          <ul className="space-y-3">
            {oppMatches.map((m) => {
              const candidate = users.find((u) => u.id === m.candidateId);
              return (
                <li key={m.id} className="card-surface flex items-center justify-between p-4">
                  <div>
                    <Link href={`/organization/candidates/${m.candidateId}`} className="font-medium text-nexus-700">
                      {candidate?.name || m.candidateId}
                    </Link>
                    <p className="text-xs text-secondary">{candidate?.programme} · Year {candidate?.currentYear}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MatchScoreRing score={m.overallScore} size={48} />
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/organization/candidates/${m.candidateId}?opp=${opp.id}`)}>
                      View profile
                    </Button>
                  </div>
                </li>
              );
            })}
            {!oppMatches.length && <p className="text-sm text-secondary">No algorithm matches for this role yet.</p>}
          </ul>
        </TabPanel>
      </Tabs>
    </div>
  );
}
