"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { ROLE_DASHBOARDS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const STATUSES = {
  pending: {
    label: "Pending",
    icon: Clock,
    tone: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    title: "Verification in progress",
    description:
      "Your registration is under review. Institution administrators or Nexus verification teams typically respond within 3–5 working days. Identity documents (NID, birth certificate, or passport) are checked according to age and account type.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    tone: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/40",
    title: "Account verified",
    description: "Your account has been approved. You can now access your dashboard and complete your profile.",
  },
  "changes requested": {
    label: "Changes requested",
    icon: AlertTriangle,
    tone: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    title: "Additional information needed",
    description:
      "The reviewer has requested updates to your submission. Please upload corrected documents or update your registration details.",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    tone: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/40",
    title: "Verification declined",
    description:
      "We could not verify your registration at this time. Contact your institutional focal point or Nexus helpdesk for assistance.",
  },
};

function VerificationStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppStore((s) => s.getCurrentUser());
  const statusKey = (searchParams.get("status") || user?.verificationStatus || "pending").toLowerCase();
  const [demoStatus, setDemoStatus] = useState(statusKey);

  const active = STATUSES[demoStatus] || STATUSES.pending;
  const ActiveIcon = active.icon;

  return (
    <AuthCard title={active.title} subtitle={active.description} className="max-w-lg">
      <div className={cn("mb-6 flex items-center gap-4 rounded-xl p-4", active.bg)}>
        <ActiveIcon className={cn("h-10 w-10 shrink-0", active.tone)} />
        <div>
          <StatusBadge status={active.label} />
          {user ? (
            <p className="mt-1 text-sm text-secondary">
              {user.name} · {user.email}
            </p>
          ) : null}
        </div>
      </div>

      {demoStatus === "pending" ? (
        <ul className="mb-6 space-y-2 text-sm text-secondary">
          <li>• Documents received and queued for review</li>
          <li>• You&apos;ll receive email at your registered address</li>
          <li>• Typical turnaround: 3–5 working days (Dhaka timezone)</li>
        </ul>
      ) : null}

      {demoStatus === "changes requested" ? (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50/50 p-4 text-sm dark:border-orange-900 dark:bg-orange-950/20">
          <p className="font-medium text-orange-900 dark:text-orange-200">Reviewer note:</p>
          <p className="mt-1 text-orange-800 dark:text-orange-300">
            Trade licence copy is unclear. Please re-upload a scanned PDF of your valid trade licence (RJSC
            registered) or NGO Affairs Bureau certificate.
          </p>
        </div>
      ) : null}

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-secondary">Demo: switch status</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(STATUSES).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDemoStatus(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize",
                demoStatus === key
                  ? "bg-nexus-600 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {demoStatus === "approved" && user ? (
          <Button onClick={() => router.push(ROLE_DASHBOARDS[user.role] || "/")}>Go to dashboard</Button>
        ) : null}
        {demoStatus === "changes requested" ? (
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Update submission
          </Button>
        ) : null}
        {demoStatus === "rejected" ? (
          <Link href="/help">
            <Button variant="secondary" className="w-full">
              Contact helpdesk
            </Button>
          </Link>
        ) : null}
        <Link href="/login">
          <Button variant="ghost" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    </AuthCard>
  );
}

export default function VerificationStatusPage() {
  return (
    <Suspense fallback={<AuthCard title="Loading…" />}>
      <VerificationStatusContent />
    </Suspense>
  );
}
