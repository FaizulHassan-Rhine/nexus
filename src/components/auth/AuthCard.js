"use client";

import { cn } from "@/lib/cn";

export function AuthCard({ title, subtitle, children, className, badge }) {
  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-2xl border border-[#d5e3df] bg-cream p-6 shadow-[0_1px_2px_rgba(51,104,160,0.05),0_4px_14px_rgba(51,104,160,0.04)] dark:border-nexus-800 dark:bg-nexus-900 sm:p-8",
        className
      )}
    >
      {badge ? (
        <span className="mb-3 inline-flex rounded-full bg-sage px-2.5 py-0.5 text-xs font-medium text-nexus-800 dark:bg-nexus-950 dark:text-nexus-200">
          {badge}
        </span>
      ) : null}
      {title ? <h1 className="text-xl font-semibold text-nexus-900 dark:text-cream">{title}</h1> : null}
      {subtitle ? <p className="mt-1 text-sm text-secondary">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-6" : ""}>{children}</div>
    </div>
  );
}

export function AuthCardWide({ title, subtitle, children, className }) {
  return (
    <AuthCard title={title} subtitle={subtitle} className={cn("max-w-3xl", className)}>
      {children}
    </AuthCard>
  );
}
