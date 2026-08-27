"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui";
import { TIGERFED_INSTITUTIONS } from "@/components/auth/authOptions";
import { cn } from "@/lib/cn";

const STEPS = ["institution", "consent", "auth"];

export default function TigerfedPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [institution, setInstitution] = useState("");
  const [consentProfile, setConsentProfile] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const canProceed =
    (step === 0 && institution) ||
    (step === 1 && consentProfile && consentTerms) ||
    step === 2;

  const handleNext = async () => {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    sessionStorage.setItem("nexus-sso-institution", institution);
    sessionStorage.setItem("nexus-pending-role", "student");
    sessionStorage.setItem("nexus-pending-email", "sso.student@tigerfed.demo");
    toast.success("TIGERfed authentication simulated", {
      description: "Continuing to student onboarding.",
    });
    router.push("/onboarding/student");
    setLoading(false);
  };

  const selected = TIGERFED_INSTITUTIONS.find((i) => i.value === institution);

  return (
    <AuthCard
      title="TIGERfed Single Sign-On"
      subtitle="Trusted Identity Gateway for Education & Research Federation — Bangladesh HEI network."
      badge="Simulation only — not connected to live TIGERfed"
      className="max-w-xl"
    >
      <ol className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex-1 rounded-lg py-2 text-center text-xs font-medium capitalize",
              i <= step ? "bg-nexus-100 text-nexus-800 dark:bg-nexus-950 dark:text-nexus-200" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
            )}
          >
            {s}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-secondary">Select your home institution to begin federated login.</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {TIGERFED_INSTITUTIONS.map((inst) => (
              <button
                key={inst.value}
                type="button"
                onClick={() => setInstitution(inst.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                  institution === inst.value
                    ? "border-nexus-600 bg-nexus-50 dark:border-nexus-500 dark:bg-nexus-950/50"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                )}
              >
                <Building2 className="h-5 w-5 shrink-0 text-nexus-600" />
                {inst.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            {selected?.label} requests permission to share the following with Nexus:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              Name, student ID, department, and enrollment status
            </li>
            <li className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              Official email address (@ac.bd domain)
            </li>
          </ul>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consentProfile}
              onChange={(e) => setConsentProfile(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-nexus-600"
            />
            I consent to share my institutional profile with Nexus for matchmaking purposes.
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consentTerms}
              onChange={(e) => setConsentTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-nexus-600"
            />
            I agree to Nexus Terms of Service and Privacy Policy.
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexus-100 dark:bg-nexus-950">
            <ShieldCheck className="h-8 w-8 text-nexus-600" />
          </div>
          <p className="text-sm text-secondary">
            Simulating redirect to {selected?.label || "institution"} identity provider…
          </p>
          <p className="text-xs text-secondary">
            In production, you would authenticate with your campus credentials. This prototype skips the
            real IdP handshake.
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={loading}>
            Back
          </Button>
        ) : (
          <Link href="/login" className="flex-1">
            <Button variant="ghost" className="w-full">
              Cancel
            </Button>
          </Link>
        )}
        <Button className="flex-1" onClick={handleNext} disabled={!canProceed} loading={loading && step === 2}>
          {step === 2 ? "Complete sign-in" : "Continue"}
        </Button>
      </div>
    </AuthCard>
  );
}
