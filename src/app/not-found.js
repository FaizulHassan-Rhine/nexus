import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-slate-600">This route is not part of the Nexus prototype.</p>
      <Link href="/" className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white">
        Go home
      </Link>
    </div>
  );
}
