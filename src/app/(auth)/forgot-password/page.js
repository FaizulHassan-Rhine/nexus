"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, Input } from "@/components/ui";
import { email as validateEmail } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    sessionStorage.setItem("nexus-reset-email", email);
    setSent(true);
    toast.success("Reset link sent", {
      description: "In this demo, continue to reset your password on the next screen.",
    });
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`If an account exists for ${email}, you'll receive password reset instructions shortly.`}
      >
        <p className="text-sm text-secondary">
          Didn&apos;t receive it? Check spam or try again with your institutional email (e.g. @buet.ac.bd,
          @du.ac.bd).
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => router.push("/reset-password")}>Continue to reset password (demo)</Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter the email linked to your Nexus account. We'll send a reset link valid for 30 minutes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@university.ac.bd"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-secondary">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-nexus-700 hover:underline dark:text-nexus-300">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
