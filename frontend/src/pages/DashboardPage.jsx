import { useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";

// Biểu tượng Sidebar chuẩn Notion
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
  const [title, setTitle] = useState("");
  
  // Notion Sidebar States
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("sidebar_pinned");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isHovered, setIsHovered] = useState(false);
  
  const { user, logoutUser } = useAuth();
  const {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    changeStatus,
    removeTask,
  } = useTasks();

  const displayName = user?.name || user?.email?.split("@")[0] || "You";
  const initials = displayName.slice(0, 2).toUpperCase();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;

  async function handleAddTask() {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") return;

    await addTask({
      title: trimmedTitle,
      status: "pending",
    });
    setTitle("");
  }

  const isSidebarVisible = isPinned || isHovered;

  return (
    <div className="flex min-h-screen bg-white text-slate-900 relative overflow-x-hidden">
      
      {/* 1. NÚT KÍCH HOẠT NỔI (Chỉ hiển thị khi Sidebar bị đóng hoàn toàn) */}
      {!isPinned && (
        <button
          onMouseEnter={() => setIsHovered(true)}
          onClick={() => {
            setIsPinned(true);
            setIsHovered(false);
            localStorage.setItem("sidebar_pinned", "true");
          }}
          className="fixed left-4 top-4 z-40 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 shadow-sm border border-slate-200/50 bg-white cursor-pointer"
          title="Open sidebar"
        >
          <SidebarIcon className="h-5 w-5" />
        </button>
      )}

      {/* 2. SIDEBAR CONTAINER */}
      <aside
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex h-screen flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 ease-in-out
          ${isPinned 
            ? "sticky top-0 w-56 flex-shrink-0 translate-x-0" 
            : "fixed left-0 top-0 z-50 w-56 shadow-2xl"
          }
          ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header Sidebar */}
        <div className="mx-2 mt-2 flex items-center justify-between rounded-md px-1 py-1">
          <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-100 flex-1">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-xs font-bold text-indigo-700">
              TM
            </div>
            <span className="text-sm font-semibold truncate">TaskManager</span>
          </div>
          
          {/* Nút ẩn sidebar chuẩn Notion */}
          <button
            onClick={() => {
              setIsPinned(false);
              setIsHovered(false);
              localStorage.setItem("sidebar_pinned", "false");
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            title="Close sidebar"
          >
            <SidebarIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-2 space-y-1 px-2 text-sm">
          <div className="rounded-md bg-indigo-50 px-3 py-2 font-medium text-indigo-700">
            All tasks
          </div>
          <div className="cursor-pointer rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            This week
          </div>
          <div className="cursor-pointer rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            Overview
          </div>
          <div className="cursor-pointer rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            Completed
          </div>
        </nav>

        <div className="flex-1" />

        {/* User profile footer */}
        <div className="border-t border-slate-200 p-2">
          <div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-slate-100">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials}
            </div>
            <span className="flex-1 truncate text-sm">{displayName}</span>
            <button
              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
              onClick={logoutUser}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* 3. NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <main 
        onMouseEnter={() => setIsHovered(false)}
        className="min-w-0 flex-1 px-6 py-8 lg:px-16 transition-all duration-300"
      >
        
        <div className="mb-6 flex items-center gap-4">
          <div className="mb-2 text-5xl">✅</div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
            <p className="mt-1 text-sm text-slate-500">
              Signed in as {user?.email || displayName}
            </p>
          </div>
        </div>

        {/* Task Form và Task List */}
        <div className="mb-6">
          <TaskForm 
            title={title} 
            setTitle={setTitle} 
            onAddTask={handleAddTask} 
          />
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total tasks
            </p>
            <p className="mt-1 text-2xl font-semibold">{totalTasks}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Completed tasks
            </p>
            <p className="mt-1 text-2xl font-semibold">{completedTasks}</p>
          </div>
        </div>

        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onEditTask={editTask}
          onChangeStatus={changeStatus}
          onRemoveTask={removeTask}
        />
      </main>
    </div>
  );
}
