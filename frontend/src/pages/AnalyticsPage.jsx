import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAnalytics } from "../hooks/useAnalytics";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const SidebarIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="16" rx="2.5" ry="2.5" />
    <line x1="9" y1="4" x2="9" y2="20" />
  </svg>
);

const ChartSkeleton = ({ isDark }) => (
  <div className={`w-full h-72 rounded-xl animate-pulse ${isDark ? "bg-slate-800/50" : "bg-slate-200/50"}`}></div>
);

export default function AnalyticsPage() {
  const { theme, toggleTheme, lang, toggleLang } = useThemeLang();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const { user, logoutUser } = useAuth();
  const { data, loading, error } = useAnalytics();

  const t = translations[lang] || translations.vi;
  const isDark = theme === "dark";

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isPinned) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  function handleToggleClick() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
    setIsPinned((prev) => !prev);
  }

  const isSidebarVisible = isPinned || isHovered;

  // Prepare Chart Data
  const COLORS = {
    pending: isDark ? "#475569" : "#94a3b8", // slate-600 / slate-400
    inProgress: isDark ? "#6366f1" : "#4f46e5", // indigo-500 / indigo-600
    completed: isDark ? "#10b981" : "#059669", // emerald-500 / emerald-600
  };

  const pieData = data ? [
    { name: t.pendingCol, value: data.pending, color: COLORS.pending },
    { name: t.inProgressCol, value: data.inProgress, color: COLORS.inProgress },
    { name: t.completedCol, value: data.completed, color: COLORS.completed },
  ].filter(item => item.value > 0) : [];

  const barData = data?.weeklyData?.slice()?.reverse() || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-[#0b1120] text-slate-200" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 border-r flex flex-col justify-between shadow-lg backdrop-blur-md ${
          isSidebarVisible ? "w-60 translate-x-0" : "w-60 -translate-x-full lg:-translate-x-[calc(100%-4rem)]"
        } ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"}`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Top Actions */}
          <div className={`flex items-center mb-8 mt-2 transition-all duration-300 ${isSidebarVisible ? "justify-between" : "justify-end"}`}>
            <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${isDark ? "bg-indigo-600" : "bg-indigo-600"}`}>
                T
              </div>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">
                {t.logo}
              </span>
            </div>
            
            <button
              onClick={handleToggleClick}
              className={`rounded-lg p-2 transition-all duration-150 border hidden lg:flex ${
                isDark
                  ? "border-slate-800 bg-[#131929] text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              <SidebarIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 mt-4">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium border ${
                isDark
                  ? "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarVisible ? "opacity-100" : "opacity-0"}`}>
                {t.overview}
              </span>
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold shadow-sm border ${
                isDark
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarVisible ? "opacity-100" : "opacity-0"}`}>
                {t.analytics}
              </span>
            </Link>
          </nav>

          <button
            onClick={logoutUser}
            className={`mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium border border-transparent ${
              isDark
                ? "text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                : "text-red-600 hover:bg-red-50 hover:border-red-100"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarVisible ? "opacity-100" : "opacity-0"}`}>
              {t.logout}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 lg:p-10 lg:pt-12 transition-all duration-300 w-full max-w-6xl mx-auto ${
          isPinned ? "lg:ml-60" : "lg:ml-16"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-20">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex flex-col gap-2 relative z-50 w-60 ${
              !isPinned ? "-ml-6 lg:-ml-14 pl-6 lg:pl-14" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {t.analyticsTitle}
              </h1>
              <button
                onClick={handleToggleClick}
                className={`rounded-lg p-2 cursor-pointer flex-shrink-0 border transition-all duration-150 relative z-50 ${
                  isDark
                    ? "border-slate-800/60 bg-[#131929] text-slate-300 hover:text-slate-100 hover:bg-slate-800/80"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                } ${isHovered ? (isDark ? "text-indigo-400 border-indigo-500/50 bg-[#161f38]" : "text-indigo-600 border-indigo-200 bg-indigo-50") : ""}`}
              >
                {isPinned ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </button>
            </div>
            <span className={`text-xs font-semibold truncate ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {displayName}
            </span>
          </div>

          {/* Settings bar */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={toggleLang}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 shadow-sm ${
                isDark
                  ? "border-slate-800 bg-slate-950/60 text-slate-300 hover:text-slate-100 hover:bg-slate-900/50"
                  : "border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {lang === "vi" ? "EN" : "VI"}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all duration-200 shadow-sm ${
                isDark
                  ? "border-slate-800 bg-slate-950/60 text-amber-400 hover:text-amber-300 hover:bg-slate-900/50"
                  : "border-slate-200 bg-white text-indigo-600 hover:text-indigo-700 hover:bg-slate-50"
              }`}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.58 1.58m9.02 9.02l1.58 1.58M3 12h2.25m13.5 0H21M5.75 5.75l1.58 1.58m9.02 9.02l1.58 1.58M12 7.75a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold border shadow-sm ${
                isDark ? "border-slate-800 bg-slate-950/60 text-indigo-400" : "border-slate-200 bg-white text-indigo-600"
              }`}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Stats Panels */}
        <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className={`rounded-xl border p-5 shadow-sm transition backdrop-blur-md ${
            isDark ? "border-slate-800/80 bg-slate-900/30 text-slate-200" : "border-slate-200 bg-white text-slate-800"
          }`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.totalTasks}
            </p>
            {loading ? <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (
              <p className="text-3xl font-bold">{data?.totalTasks || 0}</p>
            )}
          </div>
          <div className={`rounded-xl border p-5 shadow-sm transition backdrop-blur-md ${
            isDark ? "border-slate-800/80 bg-slate-900/30 text-slate-200" : "border-slate-200 bg-white text-slate-800"
          }`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.completionRate}
            </p>
            {loading ? <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (
              <p className="text-3xl font-bold text-indigo-500">{data?.completionRate || 0}%</p>
            )}
          </div>
          <div className={`rounded-xl border p-5 shadow-sm transition backdrop-blur-md ${
            isDark ? "border-slate-800/80 bg-slate-900/30 text-slate-200" : "border-slate-200 bg-white text-slate-800"
          }`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.totalTimeSpent}
            </p>
            {loading ? <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (
              <p className="text-3xl font-bold text-emerald-500">
                {data ? Math.round(data.totalTimeSpent / 3600) : 0} <span className="text-sm font-semibold">{t.hours}</span>
              </p>
            )}
          </div>
        </div>

        {/* Charts Container */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className={`rounded-xl border p-5 shadow-sm ${
            isDark ? "border-slate-800/80 bg-slate-900/30" : "border-slate-200 bg-white"
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {t.taskStatusDistribution}
            </h3>
            {loading ? <ChartSkeleton isDark={isDark} /> : (
              <div className="h-72 w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-full flex items-center justify-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {t.noData}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className={`rounded-xl border p-5 shadow-sm ${
            isDark ? "border-slate-800/80 bg-slate-900/30" : "border-slate-200 bg-white"
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {t.tasksCompletedLast7Days}
            </h3>
            {loading ? <ChartSkeleton isDark={isDark} /> : (
              <div className="h-72 w-full">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                      <XAxis 
                        dataKey="_id" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }}
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={isDark ? "#818cf8" : "#6366f1"} 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-full flex items-center justify-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {t.noData}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
