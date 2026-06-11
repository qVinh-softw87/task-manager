import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import TrashList from "../components/TrashList";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

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

export default function DashboardPage() {
  const { theme, toggleTheme, lang, toggleLang } = useThemeLang();
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
  const [showTrash, setShowTrash] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // isHovered: sidebar is floating open because user is hovering over toggle/sidebar
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

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
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
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
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  const { user, logoutUser } = useAuth();
  const dashboard = useTasks(false);
  const trash = useTasks(true);

  // Sync actions between dashboard and trash
  const handleRemoveTask = async (id) => {
    await dashboard.removeTask(id);
    trash.refreshTasks(); // Refresh trash in background so it appears instantly when switching
  };

  const handleRestoreTask = async (id) => {
    await trash.handleRestore(id);
    dashboard.refreshTasks();
  };

  const t = translations[lang] || translations.vi;

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  
  // Metrics always reflect Dashboard tasks
  const totalTasks = dashboard.tasks.length;
  const completedTasks = dashboard.tasks.filter((task) => task.status === "completed").length;
  const inProgressTasks = dashboard.tasks.filter((task) => task.status === "in-progress").length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  async function handleAddTask(taskData) {
    await dashboard.addTask(taskData);
  }

  // Sidebar is visible when pinned OR when user hovers toggle/sidebar while unpinned on desktop, or when opened via drawer on mobile
  const isSidebarVisible = isMobile ? isMobileOpen : (isPinned || isHovered);
  const isDark = theme === "dark";

  function handleToggleClick() {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (isPinned) {
        // Unpin: hide sidebar
        setIsPinned(false);
        setIsHovered(false);
        localStorage.setItem("sidebar_pinned", "false");
      } else {
        // Re-pin: sidebar stays permanently
        setIsPinned(true);
        setIsHovered(false);
        localStorage.setItem("sidebar_pinned", "true");
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`flex min-h-screen relative overflow-x-hidden transition-colors duration-300 ${
        isDark ? "bg-[#080b11] text-slate-100" : "bg-[#f8fafc] text-slate-900"
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
          className="fixed left-0 top-[96px] h-[16px] w-60 z-30 bg-transparent pointer-events-auto"
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
          type: "tween",
          ease: "easeOut",
          duration: 0.32,
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
              <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${isDark ? "text-slate-100" : "text-slate-900"}`}>TaskManager</span>
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
                <svg xmlns="http://www.w3.org/2050/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-3 text-sm">
          <div 
            onClick={() => setShowTrash(false)}
            className={`rounded-lg px-3.5 py-2 font-semibold flex items-center gap-2.5 transition ${
            !showTrash
              ? (isDark 
                ? "bg-slate-800/40 border border-slate-800/30 text-slate-200" 
                : "bg-slate-100 border border-slate-200/50 text-slate-800")
              : (isDark ? "text-slate-400 hover:bg-slate-800/45 hover:text-slate-100 border border-transparent" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent")
          }`}>
            {!showTrash && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
            {t.allTasks}
          </div>


          <div 
            onClick={() => setShowTrash(true)}
            className={`rounded-lg px-3.5 py-2 font-semibold flex items-center gap-2.5 transition ${
            showTrash
              ? (isDark 
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                : "bg-rose-50 border border-rose-200/50 text-rose-600")
              : (isDark ? "text-slate-400 hover:bg-slate-800/45 hover:text-rose-400 border border-transparent" : "text-slate-500 hover:bg-slate-50 hover:text-rose-600 border border-transparent")
          }`}>
            {showTrash && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
            {t.trash || "Thùng rác"}
          </div>
        </nav>

        <div className="flex-1" />

        {/* Sidebar Footer */}
        <div className={`border-t p-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <button
            onClick={logoutUser}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold border transition-all duration-200 ${
              isDark
                ? "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-rose-400 hover:border-rose-950/50 hover:bg-rose-950/20"
                : "border-slate-200 bg-white text-slate-600 hover:text-rose-650 hover:border-rose-200 hover:bg-rose-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {t.logout}
          </button>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <main
        className={`min-w-0 flex-1 px-4 pt-14 pb-8 md:px-6 md:pt-16 lg:pr-14 transition-all duration-300 ease-in-out ${
          isPinned
            ? "pl-[264px] lg:pl-[296px]"
            : "lg:pl-14"
        }`}
      >
        {/* Header Title & Controls (Notion-style page header) */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div
            className="flex flex-col gap-2 relative z-30 w-60"
          >
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {t.tasksTitle}
              </h1>
              <button
                onClick={handleToggleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`rounded-lg p-2 flex-shrink-0 border transition-all duration-150 relative z-30 cursor-pointer ${
                  isDark
                    ? "border-slate-800/60 bg-[#131929] text-slate-300 hover:text-slate-100 hover:bg-slate-800/80"
                    : "border-slate-200 bg-white text-slate-650 hover:text-slate-900 hover:bg-slate-50"
                } ${isHovered && !isMobile ? (isDark ? "text-indigo-400 border-indigo-500/50 bg-[#161f38]" : "text-indigo-600 border-indigo-200 bg-indigo-50") : ""}`}
              >
                {isSidebarVisible ? (
                  /* Collapse icon pointing left */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                  </svg>
                ) : (
                  /* Hamburger menu on mobile, or expand icon on desktop */
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

          {/* Settings bar: Language, Theme Toggle & User Avatar (Facebook style) */}
          <div className="flex items-center gap-3 mt-1.5">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer ${
                isDark
                  ? "border-slate-800 bg-slate-950/60 text-slate-300 hover:text-slate-100 hover:bg-slate-900/50"
                  : "border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Switch language"
            >
              {lang === "vi" ? "EN" : "VI"}
            </button>
 
             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className={`p-2 rounded-lg border transition-all duration-200 shadow-sm cursor-pointer ${
                 isDark
                   ? "border-slate-800 bg-slate-950/60 text-amber-400 hover:text-amber-300 hover:bg-slate-900/50"
                   : "border-slate-200 bg-white text-indigo-600 hover:text-indigo-700 hover:bg-slate-50"
               }`}
               title={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
 
             {/* Facebook-style User Avatar */}
             <div
               onClick={() => setIsProfileOpen(true)}
               className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold border transition-all duration-300 shadow-sm hover:opacity-85 overflow-hidden cursor-pointer ${
                 isDark 
                   ? "border-slate-800 bg-slate-950/60 text-indigo-400" 
                   : "border-slate-200 bg-white text-indigo-600"
               }`}
               title={user?.email || displayName}
             >
               {user?.avatar ? (
                 <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
               ) : (
                 initials
               )}
             </div>
          </div>
        </div>

        {/* Input Form - only show if not in Trash */}
        {!showTrash && (
          <div className="mb-6">
            <TaskForm onAddTask={handleAddTask} theme={theme} />
          </div>
        )}

        {/* Stats Panels */}
        <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className={`rounded-xl border p-4 shadow-sm transition backdrop-blur-md ${
            isDark 
              ? "border-slate-800/80 bg-slate-900/30 hover:border-slate-700/50 text-slate-200" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md text-slate-800"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.totalTasks}
            </p>
            <p className="mt-1 text-xl font-bold">{totalTasks}</p>
          </div>
          <div className={`rounded-xl border p-4 shadow-sm transition backdrop-blur-md ${
            isDark 
              ? "border-slate-800/80 bg-slate-900/30 hover:border-slate-700/50" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.inProgress}
            </p>
            <p className="mt-1 text-xl font-bold text-indigo-500">{inProgressTasks}</p>
          </div>
          <div className={`rounded-xl border p-4 shadow-sm transition backdrop-blur-md ${
            isDark 
              ? "border-slate-800/80 bg-slate-900/30 hover:border-slate-700/50" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.completed}
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-500">{completedTasks}</p>
          </div>
          <div className={`rounded-xl border p-4 shadow-sm transition backdrop-blur-md ${
            isDark 
              ? "border-slate-800/80 bg-slate-900/30 hover:border-slate-700/50 text-slate-200" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md text-slate-800"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t.completionRate}
            </p>
            <p className="mt-1 text-xl font-bold">{completionRate}%</p>
          </div>
        </div>

        {/* Tasks View */}
        {showTrash ? (
          <TrashList
            tasks={trash.tasks}
            loading={trash.loading}
            hasMore={trash.hasMore}
            onLoadMore={trash.fetchNextPage}
            onRestore={handleRestoreTask}
            onPermanentDelete={trash.handlePermanentDelete}
            theme={theme}
          />
        ) : (
          <TaskList
            tasks={dashboard.tasks}
            loading={dashboard.loading}
            error={dashboard.error}
            hasMore={dashboard.hasMore}
            onLoadMore={dashboard.fetchNextPage}
            onEditTask={dashboard.editTask}
            onChangeStatus={dashboard.changeStatus}
            onDeleteTask={handleRemoveTask}
            theme={theme}
          />
        )}
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </motion.div>
  );
}
