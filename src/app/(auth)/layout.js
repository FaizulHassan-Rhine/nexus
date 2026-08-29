import Link from "next/link";
import { NexusLogo, ThemeToggle } from "@/components/layout/Shell";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-chrome dark:bg-nexus-950">
      <header className="flex items-center justify-between border-b border-[#d5e3df] bg-cream/90 px-4 py-3 backdrop-blur dark:border-nexus-800 dark:bg-nexus-900/90 sm:px-6">
        <NexusLogo />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/" className="ml-2 text-sm text-secondary hover:text-nexus-700 dark:hover:text-nexus-300">
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 items-start justify-center overflow-x-hidden px-4 py-4 sm:px-6">{children}</main>
    </div>
  );
}
