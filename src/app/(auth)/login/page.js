"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, Input, Checkbox } from "@/components/ui";
import { authService } from "@/lib/mockServices";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/constants";
import { validateLogin } from "@/lib/validators";
import { cn } from "@/lib/cn";

const roleLabels = {
  student: "Student",
  faculty: "Faculty",
  researcher: "Researcher",
  organization: "Organization",
  "university-admin": "University Admin",
  ugc: "UGC",
  helpdesk: "Helpdesk",
};

const roleColors = {
  student: "border-nexus-200 bg-nexus-50 hover:border-nexus-400 dark:border-nexus-800 dark:bg-nexus-950/50",
  faculty: "border-violet-200 bg-violet-50 hover:border-violet-400 dark:border-violet-900 dark:bg-violet-950/30",
  researcher: "border-teal-200 bg-teal-50 hover:border-teal-400 dark:border-teal-900 dark:bg-teal-950/30",
  organization: "border-blue-200 bg-blue-50 hover:border-blue-400 dark:border-blue-900 dark:bg-blue-950/30",
  "university-admin": "border-institutional/30 bg-institutional/5 hover:border-institutional/60",
  ugc: "border-ugc/30 bg-ugc/5 hover:border-ugc/60",
  helpdesk: "border-cyan-200 bg-cyan-50 hover:border-cyan-400 dark:border-cyan-900 dark:bg-cyan-950/30",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (!result.ok) {
        toast.error("Invalid credentials", {
          description: "Check your email and password. Demo password is demo123.",
        });
        return;
      }
      if (remember) {
        localStorage.setItem("nexus-remember-email", email);
      } else {
        localStorage.removeItem("nexus-remember-email");
      }
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}!`);
      router.push(result.redirect);
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (accountEmail) => {
    setEmail(accountEmail);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setLoading(true);
    try {
      const result = await authService.login(accountEmail, DEMO_PASSWORD);
      if (result.ok) {
        toast.success(`Signed in as ${result.user.name}`);
        router.push(result.redirect);
      } else {
        toast.error("Sign-in failed", {
          description: result.error || "Demo account not found. Clear site data or reset demo data from Settings.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-center">
      <AuthCard
        title="Sign in to Nexus"
        subtitle="National Digital Matchmaking Hub — connect students, faculty, and industry across Bangladesh."
        className="lg:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.ac.bd"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              className="pr-10"
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

          <div className="flex items-center justify-between gap-2">
            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <Link href="/forgot-password" className="text-sm text-nexus-700 hover:underline dark:text-nexus-300">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-secondary dark:bg-slate-900">or</span>
          </div>
        </div>

        <Link href="/tigerfed">
          <Button variant="outline" className="w-full gap-2">
            <ShieldCheck className="h-4 w-4" />
            Continue with TIGERfed
          </Button>
        </Link>

        <p className="mt-6 text-center text-sm text-secondary">
          New to Nexus?{" "}
          <Link href="/register" className="font-medium text-nexus-700 hover:underline dark:text-nexus-300">
            Create an account
          </Link>
        </p>
      </AuthCard>

      <div className="w-full lg:max-w-md">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">Demo accounts</h2>
        <p className="mb-4 text-sm text-secondary">
          One-click sign-in for prototype testing. Password: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">demo123</code>
        </p>
        <div className="space-y-3">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={loading}
              onClick={() => fillAndLogin(acc.email)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors disabled:opacity-60",
                roleColors[acc.role] || roleColors.student
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{acc.name}</p>
                  <p className="text-xs text-secondary">{acc.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium dark:bg-slate-900/80">
                  {roleLabels[acc.role]}
                </span>
              </div>
              <p className="mt-2 text-xs text-secondary">{acc.scenario}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
