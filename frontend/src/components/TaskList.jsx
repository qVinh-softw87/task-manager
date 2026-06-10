import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import TaskCardSkeleton from "./TaskCardSkeleton";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

import {
  TASK_STATUSES,
} from "../utils/constants";

function DroppableColumn({ status, style, children, isDark }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 min-h-[280px] flex flex-col ${style.bg} ${
        isOver
          ? isDark
            ? "ring-2 ring-indigo-500/60 shadow-indigo-500/5 bg-slate-900/50 scale-[1.01]"
            : "ring-2 ring-indigo-500/60 shadow-indigo-500/5 bg-slate-50/50 scale-[1.01]"
          : ""
      }`}
    >
      {children}
    </section>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

const dropAnimationConfig = {
  duration: 120,
  easing: "cubic-bezier(0.18, 0.89, 0.32, 1.28)",
};

export default function TaskList({
  tasks,
  loading,
  onDeleteTask,
  onChangeStatus,
  onEditTask,
  theme = "dark"
}) {
  const { lang } = useThemeLang();
  const t = translations[lang] || translations.vi;
  const isDark = theme === "dark";
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dragStartStatusRef = useRef(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const task = tasks.find((t) => t._id === event.active.id);
    dragStartStatusRef.current = task ? task.status : null;
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== newStatus) {
      onChangeStatus(taskId, newStatus, true);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      if (dragStartStatusRef.current) {
        onChangeStatus(active.id, dragStartStatusRef.current, true);
      }
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    onChangeStatus(taskId, newStatus, false, dragStartStatusRef.current);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    if (dragStartStatusRef.current) {
      onChangeStatus(activeId, dragStartStatusRef.current, true);
    }
  };

  // Styles for different column headers
  const columnStyles = {
    pending: {
      text: isDark ? "text-slate-200" : "text-slate-800",
      dot: "bg-slate-500",
      bg: isDark ? "bg-gradient-to-b from-[#182030] to-[#080a10] border-slate-600" : "bg-gradient-to-b from-slate-200/90 to-slate-50/70 border-slate-400",
      emptyBg: isDark ? "border-slate-700 bg-slate-950/40" : "border-slate-350 bg-slate-200/20",
      headerBorder: isDark ? "border-slate-600" : "border-slate-400",
      counter: isDark ? "bg-slate-950 border-slate-600 text-slate-200" : "bg-white border-slate-400 text-slate-700 shadow-sm"
    },
    "in-progress": {
      text: "text-indigo-400 dark:text-indigo-300 font-extrabold",
      dot: "bg-indigo-500 animate-pulse",
      bg: isDark ? "bg-gradient-to-b from-[#1b2554] to-[#080a10] border-indigo-500/70" : "bg-gradient-to-b from-indigo-100/90 to-indigo-50/70 border-indigo-400",
      emptyBg: isDark ? "border-indigo-900/60 bg-slate-950/40" : "border-indigo-200 bg-indigo-100/10",
      headerBorder: isDark ? "border-indigo-500/60" : "border-indigo-400",
      counter: isDark ? "bg-slate-950 border-slate-600 text-slate-200" : "bg-white border-slate-400 text-indigo-700 shadow-sm"
    },
    completed: {
      text: "text-emerald-700 dark:text-emerald-300 font-extrabold",
      dot: "bg-emerald-500",
      bg: isDark ? "bg-gradient-to-b from-[#0e2d21] to-[#080a10] border-emerald-500/70" : "bg-gradient-to-b from-emerald-100/90 to-emerald-50/70 border-emerald-400",
      emptyBg: isDark ? "border-emerald-900/60 bg-slate-950/40" : "border-emerald-200 bg-emerald-100/10",
      headerBorder: isDark ? "border-emerald-500/60" : "border-emerald-400",
      counter: isDark ? "bg-slate-950 border-slate-600 text-slate-200" : "bg-white border-slate-400 text-emerald-700 shadow-sm"
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const filteredTasks = tasks.filter((task) => task.status === status);
          const style = columnStyles[status] || columnStyles.pending;

          return (
            <DroppableColumn key={status} status={status} style={style} isDark={isDark}>
              {/* Column Header */}
              <div className={`mb-4 flex items-center justify-between border-b pb-3 ${style.headerBorder}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  <h2 className={`text-sm font-bold tracking-tight uppercase ${style.text}`}>
                    {status === "pending" ? t.pendingCol : status === "in-progress" ? t.inProgressCol : t.completedCol}
                  </h2>
                </div>

                <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${style.counter}`}>
                  {loading ? "..." : filteredTasks.length}
                </span>
              </div>

              {/* Tasks list */}
              {loading ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-3 flex-1"
                >
                  <motion.div variants={itemVariants}>
                    <TaskCardSkeleton theme={theme} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <TaskCardSkeleton theme={theme} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <TaskCardSkeleton theme={theme} />
                  </motion.div>
                </motion.div>
              ) : filteredTasks.length === 0 ? (
                <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-10 text-center flex-1 ${style.emptyBg}`}>
                  {status === "pending" && (
                    <svg className="h-10 w-10 text-slate-400 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  {status === "in-progress" && (
                    <svg className="h-10 w-10 text-indigo-400 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  )}
                  {status === "completed" && (
                    <svg className="h-10 w-10 text-emerald-400 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {status === "pending" ? t.emptyPending : status === "in-progress" ? t.emptyInProgress : t.emptyCompleted}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {status === "pending" ? t.emptyPendingHint : status === "in-progress" ? t.emptyInProgressHint : t.emptyCompletedHint}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task._uiKey || task._id}
                        task={task}
                        onDeleteTask={onDeleteTask}
                        onChangeStatus={onChangeStatus}
                        onEditTask={onEditTask}
                        theme={theme}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay dropAnimation={dropAnimationConfig} adjustScale={true}>
        {activeId ? (
          <TaskCard
            task={tasks.find((t) => t._id === activeId)}
            theme={theme}
            isOverlayPreview={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
