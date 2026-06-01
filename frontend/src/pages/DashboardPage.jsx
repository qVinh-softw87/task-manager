import { useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";

export default function DashboardPage() {
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {sidebarOpen && (
        <aside className="sticky top-0 flex h-screen w-56 flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50">
          <div className="mx-2 mt-2 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 hover:bg-slate-100">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-xs">
              TM
            </div>
            <span className="flex-1 text-sm font-semibold">TaskManager</span>
          </div>

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

          <div className="border-t border-slate-200 p-2">
            <div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-slate-100">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {initials}
              </div>
              <span className="flex-1 truncate text-sm">{displayName}</span>
              <button
                className="text-xs text-slate-500 hover:text-slate-900"
                onClick={logoutUser}
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>
      )}

      <main className="min-w-0 flex-1 px-6 py-8 lg:px-16">
        <button
          className="mb-6 text-sm text-slate-400 hover:text-slate-700"
          onClick={() => setSidebarOpen((current) => !current)}
        >
          {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        </button>

        <div className="mb-6">
          <div className="mb-2 text-5xl">✅</div>
          <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
          <p className="mt-1 text-sm text-slate-500">
            Signed in as {user?.email || displayName}
          </p>
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
              Completed
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {completedTasks} / {totalTasks}
            </p>
          </div>
        </div>

        <TaskForm
          title={title}
          setTitle={setTitle}
          onAddTask={handleAddTask}
        />

        {loading && <p className="text-sm text-slate-500">Loading tasks...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <TaskList
          tasks={tasks}
          onDeleteTask={removeTask}
          onChangeStatus={changeStatus}
          onEditTask={editTask}
        />
      </main>
    </div>
  );
}
