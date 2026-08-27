"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, StatCard, DataTable, Badge, Button, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { Breadcrumbs } from "@/components/layout/Shell";

export default function UniversityDetailPage() {
  const hydrated = useHydrated();
  const params = useParams();
  const router = useRouter();
  const uniId = params.id;
  const universities = useAppStore((s) => s.universities);
  const users = useAppStore((s) => s.users);
  const funding = useAppStore((s) => s.funding);
  const applications = useAppStore((s) => s.applications);
  const updateUniversity = useAppStore((s) => s.updateUniversity);

  const uni = universities.find((u) => u.id === uniId);
  const students = users.filter((u) => u.role === "student" && u.universityId === uniId);
  const faculty = users.filter((u) => u.role === "faculty" && u.universityId === uniId);
  const uniFunding = funding.filter((f) => f.universityId === uniId);
  const uniApps = applications.filter((a) => students.some((s) => s.id === a.applicantId));

  if (!hydrated) return null;
  if (!uni) return <PageHeader title="University not found" />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Universities", href: "/ugc/universities" }, { label: uni.shortName }]} />
      <PageHeader title={uni.name} description={`${uni.division} · ${uni.type} · Established ${uni.established}`} actions={<Button variant="secondary" onClick={() => updateUniversity(uni.id, { nexusStatus: uni.nexusStatus === "Active" ? "Under review" : "Active" })}>Toggle review status</Button>} />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Students" value={students.length || uni.studentCount} tone="teal" />
        <StatCard label="Faculty" value={faculty.length || uni.facultyCount} tone="blue" />
        <StatCard label="Partnerships" value={uni.activePartnerships} tone="violet" />
        <StatCard label="Funding requests" value={uniFunding.length} tone="amber" />
      </div>

      <div className="card-surface p-4">
        <h3 className="font-semibold">Focal point</h3>
        <p className="mt-2 text-sm">{uni.focalPoint?.name} · {uni.focalPoint?.email} · {uni.focalPoint?.phone}</p>
        <p className="mt-4 text-sm text-secondary">{uni.description}</p>
      </div>

      <DataTable
        columns={[
          { key: "metric", label: "Metric" },
          { key: "value", label: "Value" },
        ]}
        rows={[
          { id: "1", metric: "Nexus status", value: <StatusBadge status={uni.nexusStatus} /> },
          { id: "2", metric: "Verification", value: <Badge tone="green">{uni.verificationStatus}</Badge> },
          { id: "3", metric: "Applications (sample)", value: uniApps.length },
          { id: "4", metric: "Departments", value: (uni.departments || []).join(", ") },
        ]}
      />
      <Button variant="outline" onClick={() => router.push("/ugc/universities")}>Back to list</Button>
    </div>
  );
}
