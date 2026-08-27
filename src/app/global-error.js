"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-slate-600">{error?.message || "Unexpected error"}</p>
        <button type="button" onClick={reset} className="rounded-lg bg-teal-700 px-4 py-2 text-white">
          Try again
        </button>
      </body>
    </html>
  );
}
