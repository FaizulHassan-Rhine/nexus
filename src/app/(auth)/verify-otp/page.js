"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui";
import { DEMO_OTP } from "@/lib/constants";

const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const otpValue = digits.join("");
  const pendingEmail = typeof window !== "undefined" ? sessionStorage.getItem("nexus-pending-email") : "";
  const pendingRole = typeof window !== "undefined" ? sessionStorage.getItem("nexus-pending-role") : "student";
  const needsApproval = pendingRole === "organization" || pendingRole === "university-admin";

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
  };

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    if (otpValue !== DEMO_OTP) {
      toast.error("Invalid OTP. Use demo code 123456.");
      return;
    }
    toast.success("Verified");
    if (needsApproval) {
      router.push("/verification-status");
    } else {
      router.push(`/onboarding/${pendingRole || "student"}`);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle={pendingEmail ? `We sent a 6-digit code to ${pendingEmail}` : "Enter the demo OTP to continue"}
    >
      <p className="mb-4 text-xs text-secondary">Demo OTP: {DEMO_OTP}</p>
      <div className="mb-4 flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            className="h-12 w-10 rounded-lg border border-slate-200 text-center text-lg font-semibold dark:border-slate-600 dark:bg-slate-900"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <Button className="w-full" loading={loading} onClick={handleVerify}>
        Verify
      </Button>
      <p className="mt-4 text-center text-sm text-secondary">
        {canResend ? (
          <button type="button" className="text-nexus-700" onClick={startTimer}>
            Resend code
          </button>
        ) : (
          <>Resend in {timer}s</>
        )}
      </p>
      <p className="mt-3 text-center text-sm">
        <Link href="/login" className="text-nexus-700">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
