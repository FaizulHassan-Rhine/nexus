"use client";

import Link from "next/link";
import { AuthCard, AuthCardWide } from "@/components/auth/AuthCard";
import { REGISTERABLE_ROLES, INVITATION_ONLY_ROLES } from "@/components/auth/authOptions";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

export default function RegisterPage() {
  return (
    <AuthCardWide
      title="Create your Nexus account"
      subtitle="Choose how you'll use the National Digital Matchmaking Hub. Registration is free for students, faculty, organizations, and university administrators."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {REGISTERABLE_ROLES.map((role) => (
          <Link
            key={role.id}
            href={role.href}
            className={cn(
              "group rounded-xl border border-slate-200 p-5 transition-all hover:border-nexus-400 hover:shadow-md",
              "dark:border-slate-700 dark:hover:border-nexus-600"
            )}
          >
            <span className="text-2xl" aria-hidden>
              {role.icon}
            </span>
            <h2 className="mt-2 font-semibold text-slate-900 group-hover:text-nexus-700 dark:text-slate-100 dark:group-hover:text-nexus-300">
              {role.title}
            </h2>
            <p className="mt-1 text-sm text-secondary">{role.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-nexus-700 dark:text-nexus-300">
              Continue →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200">Invitation-only roles</h3>
        <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
          UGC officials and Helpdesk agents cannot self-register. These accounts are provisioned by the Nexus
          programme office. Use demo login to explore those portals.
        </p>
        <ul className="mt-3 space-y-2">
          {INVITATION_ONLY_ROLES.map((role) => (
            <li key={role.id} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
              <span className="mt-0.5 text-amber-600">•</span>
              <span>
                <strong>{role.title}</strong> — {role.description}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="soft" size="sm">
            Use demo login instead
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-nexus-700 hover:underline dark:text-nexus-300">
          Sign in
        </Link>
      </p>
    </AuthCardWide>
  );
}