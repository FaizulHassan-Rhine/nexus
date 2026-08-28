"use client";

import Link from "next/link";
import { PageHeader, Badge, Button, StatCard } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { getUniversityId } from "../_lib/helpers";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#d5e3df] py-3 last:border-0 dark:border-nexus-800 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-secondary">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export default function InstitutionProfilePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const universities = useAppStore((s) => s.universities);
  const organizations = useAppStore((s) => s.organizations);
  const opportunities = useAppStore((s) => s.opportunities);

  const uni = universities.find((u) => u.id === uniId);
  const partnerCount = organizations.filter((o) => o.verificationStatus === "Verified").length;
  const liveOpportunities = opportunities.filter((o) => o.status === "Published" || o.status === "Open").length;

  if (!hydrated) return null;

  if (!uni) {
    return (
      <div className="space-y-4">
        <PageHeader title="Institution profile" description="University identity and verification on Nexus" />
        <p className="text-secondary">Institution record not found for {uniId}.</p>
      </div>
    );
  }

  const ugcStatus = uni.nexusStatus === "Active" ? "UGC programme member — active on Nexus" : "Pending Nexus onboarding";
  const accreditation =
    uni.verificationStatus === "Verified"
      ? `${uni.type} university · verified institutional record`
      : "Accreditation verification in progress";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Institution profile"
        description="Official university identity, accreditation, departments, and partnership summary on Nexus"
        actions={
          <Link href="/university-admin/partnerships">
            <Button variant="secondary">Manage partnerships</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students on Nexus" value={uni.studentCount?.toLocaleString() || "—"} />
        <StatCard label="Faculty on Nexus" value={uni.facultyCount?.toLocaleString() || "—"} />
        <StatCard label="Active partnerships" value={uni.activePartnerships ?? partnerCount} />
        <StatCard label="Live opportunities" value={uni.activeOpportunities ?? liveOpportunities} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Institution identity</h2>
              <p className="mt-1 text-sm text-secondary">{uni.description}</p>
            </div>
            <Badge tone={uni.verificationStatus === "Verified" ? "green" : "amber"}>{uni.verificationStatus}</Badge>
          </div>
          <div className="mt-4">
            <InfoRow label="Full name" value={uni.name} />
            <InfoRow label="Short name" value={uni.shortName} />
            <InfoRow label="Type" value={uni.type} />
            <InfoRow label="Established" value={uni.established} />
            <InfoRow label="Division / district" value={`${uni.division}, ${uni.district}`} />
            <InfoRow label="Address" value={uni.address} />
            <InfoRow label="Website" value={uni.website} />
            <InfoRow label="Nexus member since" value={formatDate(uni.createdAt)} />
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-lg font-semibold">Accreditation & UGC status</h2>
          <div className="mt-4">
            <InfoRow label="Accreditation" value={accreditation} />
            <InfoRow label="UGC programme status" value={ugcStatus} />
            <InfoRow label="Nexus verification" value={uni.verificationStatus} />
            <InfoRow label="Platform status" value={uni.nexusStatus} />
          </div>
          <p className="mt-4 rounded-lg bg-chrome px-3 py-2 text-xs text-secondary dark:bg-nexus-900">
            Institutional profiles are reviewed by UGC administrators and displayed to partners during matchmaking and co-funding workflows.
          </p>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-lg font-semibold">Departments & research strengths</h2>
          <div className="mt-4">
            <p className="text-sm font-medium">Academic departments</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(uni.departments || []).map((d) => (
                <Badge key={d} tone="blue">{d}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm font-medium">Research strengths</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(uni.researchStrengths || []).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-lg font-semibold">Contact office & focal point</h2>
          <div className="mt-4">
            <InfoRow label="Registrar email" value={uni.email} />
            <InfoRow label="Phone" value={uni.phone} />
            <InfoRow label="Nexus focal point" value={uni.focalPoint?.name} />
            <InfoRow label="Focal point email" value={uni.focalPoint?.email} />
            <InfoRow label="Focal point phone" value={uni.focalPoint?.phone} />
          </div>
        </section>

        <section className="card-surface p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">MoU & partnership summary</h2>
              <p className="mt-1 text-sm text-secondary">
                {uni.activePartnerships ?? partnerCount} verified industry and development partners · {liveOpportunities} published opportunities linked to your institution
              </p>
            </div>
            <Link href="/university-admin/partnerships">
              <Button size="sm" variant="outline">View partner directory</Button>
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            <li className="rounded-lg border border-[#d5e3df] px-3 py-2 text-sm dark:border-nexus-800">Industry internship MoUs with verified organizations</li>
            <li className="rounded-lg border border-[#d5e3df] px-3 py-2 text-sm dark:border-nexus-800">Joint research and faculty exchange agreements</li>
            <li className="rounded-lg border border-[#d5e3df] px-3 py-2 text-sm dark:border-nexus-800">UGC co-funded scholarship and stipend programmes</li>
            <li className="rounded-lg border border-[#d5e3df] px-3 py-2 text-sm dark:border-nexus-800">Technology transfer and innovation partnerships</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
