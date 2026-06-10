export default function TaskCardSkeleton({ theme = "dark" }) {
  const isDark = theme === "dark";
  const bar = `skeleton-shimmer rounded-md ${isDark ? "bg-slate-800" : "bg-slate-200"}`;

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm ${
        isDark
          ? "border-slate-800/60 bg-slate-900/30"
          : "border-slate-200 bg-white/60"
      }`}
    >
      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2">
          <div className={`h-4.5 w-14 ${bar}`} />
          <div className={`h-4 w-20 ${bar}`} />
        </div>

        {/* Title & Description placeholder */}
        <div className="mt-3.5 space-y-2.5">
          <div className={`h-4 w-4/5 ${bar}`} />
          <div className="space-y-1.5 pt-1">
            <div className={`h-3 w-[92%] ${bar}`} />
            <div className={`h-3 w-3/4 ${bar}`} />
          </div>
        </div>

        {/* Time spent placeholder */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-4.5 w-4.5 rounded-full ${bar}`} />
          <div className={`h-3.5 w-28 ${bar}`} />
        </div>
      </div>

      {/* Footer selectors and buttons */}
      <div className={`mt-4.5 flex items-center gap-2 border-t pt-3 ${isDark ? "border-slate-800/40" : "border-slate-200"}`}>
        <div className={`h-7 flex-1 rounded-lg ${bar}`} />
        <div className={`h-7 w-7 rounded-lg ${bar}`} />
        <div className={`h-7 w-7 rounded-lg ${bar}`} />
      </div>
    </div>
  );
}

