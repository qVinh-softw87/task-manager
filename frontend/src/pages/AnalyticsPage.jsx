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
  const buttonRef = useRef(null);
  const [buttonRight, setButtonRight] = useState(240);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== "undefined") {
      const isMobileSize = window.innerWidth < 768;
      if (isMobileSize) return false;
      return localStorage.getItem("sidebar_pinned") !== "false";
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const { user, logoutUser } = useAuth();
  const { data, loading, error } = useAnalytics();

  const t = translations[lang] || translations.vi;
  const isDark = theme === "dark";

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsPinned(false);
      } else {
        const pinned = localStorage.getItem("sidebar_pinned") !== "false";
        setIsPinned(pinned);
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
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
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRight(rect.right);
    }
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  function handleToggleClick() {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setIsHovered(false);
      setIsPinned((prev) => {
        const newVal = !prev;
        localStorage.setItem("sidebar_pinned", newVal ? "true" : "false");
        return newVal;
      });
    }
  }

  const isSidebarVisible = isMobile ? isMobileOpen : (isPinned || isHovered);

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
      {/* Mobile Sidebar Backdrop */}
      {isMobile && isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Hover Bridge for smooth UX between sidebar and toggle button */}
      {!isPinned && isHovered && !isMobile && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ width: `${buttonRight}px` }}
          className="fixed left-0 top-[96px] h-[16px] z-30 bg-transparent pointer-events-auto"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={false}
        animate={{
          x: isSidebarVisible ? 0 : -240,
          opacity: isSidebarVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 34,
          mass: 0.8,
        }}
        className={`
          flex flex-col border-r fixed left-0 w-60 z-50
          ${isMobile ? "top-0 h-screen" : (isPinned ? "top-0 h-screen" : "top-[112px] h-[calc(100vh-112px)]")}
          ${(!isPinned && isSidebarVisible) || isMobile ? "shadow-2xl" : ""}
          ${isDark ? "border-slate-900/60 bg-[#0c101b]" : "border-slate-200/80 bg-white"}
        `}
      >
        {/* Workspace Brand - only shown when pinned or on mobile */}
        {(isPinned || isMobile) && (
          <div className="mx-3 mt-3 flex items-center justify-between p-1 border-b pb-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg flex-1 transition">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white shadow-md transition-all duration-300 ${
                isDark 
                  ? "bg-indigo-600 shadow-indigo-600/30" 
                  : "bg-slate-950 shadow-slate-950/10"
              }`}>
                TM
              </div>
              <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t.logo || "TaskManager"}</span>
            </div>
            
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className={`rounded-lg p-1.5 border transition-all duration-150 cursor-pointer ${
                  isDark
                    ? "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-3 text-sm">
          <Link
            to="/"
            className={`rounded-lg px-3.5 py-2 font-semibold flex items-center gap-2.5 transition ${
              isDark
                ? "text-slate-400 hover:bg-slate-800/45 hover:text-slate-100 border border-transparent"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            }`}
          >
            <svg xmlns="http://www.w3.org/2050/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>{t.overview}</span>
          </Link>

          <Link
            to="/analytics"
            className={`rounded-lg px-3.5 py-2 font-semibold flex items-center gap-2.5 transition ${
              isDark
                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                : "bg-indigo-50 border border-indigo-200/50 text-indigo-650"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span>{t.analytics}</span>
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Sidebar Footer */}
        <div className={`border-t p-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <button
            onClick={logoutUser}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold border transition-all duration-200 ${
              isDark
                ? "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-red-400 hover:border-red-950/50 hover:bg-red-950/20"
                : "border-slate-200 bg-white text-slate-650 hover:text-red-650 hover:border-red-200 hover:bg-red-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2050/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {t.logout}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`min-w-0 flex-1 px-4 pt-14 pb-8 md:px-6 md:pt-16 lg:pr-14 transition-all duration-300 w-full max-w-6xl mx-auto ${
          isPinned
            ? "pl-[264px] lg:pl-[296px]"
            : "lg:pl-14"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-20">
          <div
            className="flex flex-col gap-2 relative z-30 w-60"
          >
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {t.analyticsTitle}
              </h1>
              <button
                ref={buttonRef}
                onClick={handleToggleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`rounded-lg p-2 cursor-pointer flex-shrink-0 border transition-all duration-150 relative z-30 ${
                  isDark
                    ? "border-slate-800/60 bg-[#131929] text-slate-300 hover:text-slate-100 hover:bg-slate-800/80"
                    : "border-slate-200 bg-white text-slate-650 hover:text-slate-900 hover:bg-slate-50"
                } ${isHovered && !isMobile ? (isDark ? "text-indigo-400 border-indigo-500/50 bg-[#161f38]" : "text-indigo-600 border-indigo-200 bg-indigo-50") : ""}`}
              >
                {isSidebarVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                  </svg>
                ) : (
                  isMobile ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                    </svg>
                  )
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
