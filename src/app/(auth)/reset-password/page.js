"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, Input } from "@/components/ui";
import { password as validatePassword } from "@/lib/validators";
import { DEMO_PASSWORD } from "@/lib/constants";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const resetEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("nexus-reset-email") : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      password: validatePassword(password),
      confirm: password !== confirm ? "Passwords do not match" : "",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    sessionStorage.removeItem("nexus-reset-email");
    toast.success("Password updated", {
      description: "Demo accounts always use demo123 — sign in with your email.",
    });
    router.push("/login");
    setLoading(false);
  };

  return (
    <AuthCard
      title="Set new password"
      subtitle={
        resetEmail
          ? `Create a new password for ${resetEmail}.`
          : "Enter a new password for your account."
      }
      badge="Demo: password resets are simulated"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="New password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            hint={`Demo accounts use ${DEMO_PASSWORD}`}
          />
          <button
            type="button"
            className="absolute top-8 right-3 text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Input
          label="Confirm password"
          name="confirm"
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-secondary">
        <Link href="/login" className="font-medium text-nexus-700 hover:underline dark:text-nexus-300">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
