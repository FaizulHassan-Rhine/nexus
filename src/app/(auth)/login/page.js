"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Headphones,
  Landmark,
  Microscope,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { NexusMark } from "@/components/brand/NexusLogo";
import { Button, Input, Checkbox } from "@/components/ui";
import { authService } from "@/lib/mockServices";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/constants";
import { validateLogin } from "@/lib/validators";
import { cn } from "@/lib/cn";

const roleLabels = {
  student: "Student",
  teacher: "Faculty",
  faculty: "Faculty",
  researcher: "Researcher",
  organization: "Organization",
  "industry-professional": "Professional",
  "university-admin": "Institution",
  ugc: "UGC",
  helpdesk: "Helpdesk",
};

const roleIcons = {
  student: GraduationCap,
  faculty: Users,
  researcher: Microscope,
  organization: Building2,
  "university-admin": Landmark,
  "industry-professional": Briefcase,
  teacher: Users,
  ugc: Scale,
  helpdesk: Headphones,
};

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Identity-verified learner and educator profiles" },
  { icon: Sparkles, text: "Matching for local and international remote roles" },
  { icon: Landmark, text: "National network of institutions, industry, and UGC" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-remember-email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

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

  const demoList = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-nexus-500 uppercase">Demo access</p>
        <p className="mt-1 text-xs leading-relaxed text-secondary">
          Temporary prototype sign-in. Password{" "}
          <code className="rounded bg-chrome px-1 py-0.5 text-[11px] dark:bg-nexus-800">{DEMO_PASSWORD}</code>
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {DEMO_ACCOUNTS.map((acc) => {
          const Icon = roleIcons[acc.role] || Users;
          return (
            <button
              key={acc.email}
              type="button"
              disabled={loading}
              title={acc.scenario}
              onClick={() => fillAndLogin(acc.email)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border border-[#d5e3df] bg-cream px-2.5 py-2 text-left transition-colors",
                "hover:border-nexus-400 hover:bg-sage/40 disabled:opacity-60",
                "dark:border-nexus-800 dark:bg-nexus-950/50 dark:hover:border-nexus-500"
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-nexus-600 text-white">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-nexus-900 dark:text-cream">{acc.name}</span>
                <span className="block text-[11px] text-secondary">{roleLabels[acc.role]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="-my-4 flex h-[calc(100dvh-3.75rem)] w-full max-w-[86rem] items-center justify-center gap-5 overflow-hidden">
      <div className="grid max-h-[min(38rem,calc(100dvh-5.5rem))] w-full max-w-6xl overflow-hidden rounded-3xl border border-[#d5e3df] bg-cream shadow-[0_16px_48px_rgba(51,104,160,0.10)] dark:border-nexus-800 dark:bg-nexus-900 dark:shadow-[0_16px_48px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-nexus-900 via-nexus-800 to-nexus-700 px-9 py-9 text-cream lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-sky/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-sage/15 blur-3xl" />
          <div className="relative flex flex-1 flex-col">
            <NexusMark size={40} />
            <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-sage uppercase">
              National Digital Matchmaking Hub
            </p>
            <h1 className="mt-4 text-[1.75rem] font-semibold tracking-tight text-white xl:text-[1.85rem] xl:leading-snug">
              Sign in to continue your work across Bangladesh.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/75">
              One verified account for students, faculty, researchers, institutions, and industry partners.
            </p>
            <ul className="mt-8 space-y-3">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-cream/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-4 w-4 text-sage" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 text-xs tracking-wide text-cream/50">
              Institutions · Industry · Faculty · UGC programme office
            </p>
          </div>
        </aside>

        <div className="flex flex-col justify-center px-7 py-8 sm:px-10">
          <div className="lg:hidden">
            <p className="text-xs font-semibold tracking-[0.16em] text-nexus-500 uppercase">Nexus</p>
            <h1 className="mt-1 text-2xl font-semibold text-nexus-900 dark:text-cream">Sign in</h1>
            <p className="mt-1 text-sm text-secondary">National Digital Matchmaking Hub</p>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-2xl font-semibold text-nexus-900 dark:text-cream">Welcome back</h2>
            <p className="mt-1 text-sm text-secondary">Enter your institutional credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
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
                className="absolute top-8 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <Link href="/forgot-password" className="text-sm font-medium text-nexus-700 hover:underline dark:text-nexus-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="h-11 w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d5e3df] dark:border-nexus-700" />
            </div>
            <div className="relative flex justify-center text-[11px] font-semibold tracking-wider text-secondary uppercase">
              <span className="bg-cream px-3 dark:bg-nexus-900">or</span>
            </div>
          </div>

          <Link href="/tigerfed">
            <Button variant="outline" className="h-11 w-full gap-2">
              <ShieldCheck className="h-4 w-4" />
              Continue with TIGERfed
            </Button>
          </Link>

          <p className="mt-5 text-center text-sm text-secondary">
            New to Nexus?{" "}
            <Link href="/register" className="font-medium text-nexus-700 hover:underline dark:text-nexus-300">
              Create an account
            </Link>
          </p>

          <button
            type="button"
            className="mt-4 text-center text-xs font-medium text-nexus-700 underline-offset-2 hover:underline lg:hidden dark:text-nexus-300"
            onClick={() => setDemoOpen((v) => !v)}
          >
            {demoOpen ? "Hide demo access" : "Temporary demo access"}
          </button>
          {demoOpen ? <div className="mt-3 max-h-48 lg:hidden">{demoList}</div> : null}
        </div>
      </div>

      <aside className="hidden max-h-[min(38rem,calc(100dvh-5.5rem))] w-64 shrink-0 overflow-hidden rounded-3xl border border-dashed border-nexus-300 bg-cream/80 p-4 shadow-[0_8px_24px_rgba(51,104,160,0.06)] lg:flex lg:flex-col dark:border-nexus-700 dark:bg-nexus-900/80">
        {demoList}
      </aside>
    </div>
  );
}
