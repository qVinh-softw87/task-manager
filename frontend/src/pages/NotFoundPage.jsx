import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
        This page does not exist or you do not have access to it.
      </p>
      <Link
        className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
        to="/dashboard"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
