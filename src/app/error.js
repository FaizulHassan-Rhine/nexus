"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-slate-600">{error?.message || "Unexpected error in this view."}</p>
      <button type="button" onClick={reset} className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white">
        Try again
      </button>
    </div>
  );
}
