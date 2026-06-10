import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

export default function TrashList({
  tasks,
  loading,
  hasMore,
  onLoadMore,
  onRestore,
  onPermanentDelete,
  theme = "dark"
}) {
  const { lang } = useThemeLang();
  const t = translations[lang] || translations.vi;
  const isDark = theme === "dark";

  const getDaysLeft = (deletedAt) => {
    if (!deletedAt) return 0;
    const deletedDate = new Date(deletedAt);
    const expireDate = new Date(deletedDate.getTime() + 8 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expireDate - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={`text-center py-16 rounded-xl border border-dashed ${isDark ? "border-slate-800 text-slate-500" : "border-slate-300 text-slate-400"}`}>
        <p className="text-sm font-semibold">{t.emptyTrash || "Thùng rác trống"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task._id} 
          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
            isDark 
              ? "bg-slate-900/40 border-slate-800 hover:border-slate-700" 
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex-1 min-w-0 pr-4">
            <h3 className={`text-sm font-bold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {task.title}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {t.deletedAt || "Sẽ xóa vĩnh viễn sau"}: <span className="font-semibold text-rose-500">{getDaysLeft(task.deletedAt)} {t.days || "ngày"}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onRestore(task._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isDark 
                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {t.restore || "Khôi phục"}
            </button>
            <button
              onClick={() => onPermanentDelete(task._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isDark 
                  ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" 
                  : "bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
            >
              {t.permanentDelete || "Xóa vĩnh viễn"}
            </button>
          </div>
        </div>
      ))}
      
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6 mb-12">
            <button
                onClick={onLoadMore}
                disabled={loading}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-300 shadow-sm"
                }`}
            >
                {loading ? t.loadingMore : t.loadMore}
            </button>
        </div>
      )}
    </div>
  );
}
