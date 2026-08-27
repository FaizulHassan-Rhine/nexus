import Link from "next/link";
import { NexusLogo, LanguageToggle, ThemeToggle } from "@/components/layout/Shell";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream dark:bg-nexus-950">
      <header className="flex items-center justify-between border-b border-[#d5e3df] bg-chrome px-4 py-3 dark:border-nexus-800 dark:bg-nexus-900">
        <NexusLogo />
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/" className="ml-2 text-sm text-secondary hover:text-nexus-700">
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">{children}</main>
    </div>
  );
}
