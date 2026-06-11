import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { formatTime } from "../utils/formatTime";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";
import ConfirmDialog from "./ConfirmDialog";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "../utils/constants";

function StatusDropdown({ status, onChangeStatus, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === "dark";
  const dropdownRef = useRef(null);
  const { lang } = useThemeLang();
  const t = translations[lang] || translations.vi;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusLabel = (s) => {
    if (s === "pending") return t.pendingCol;
    if (s === "in-progress") return t.inProgressCol;
    return t.completedCol;
  };

  return (
    <div className="relative min-w-0 flex-1" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 cursor-pointer transition-colors duration-150 ${isDark
            ? "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-900/50"
            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
      >
        <span>{getStatusLabel(status)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.0"
          stroke="currentColor"
          className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full left-0 mb-1 z-50 w-full min-w-[120px] rounded-lg border shadow-xl backdrop-blur-md py-1 transition-all duration-150 ${isDark
              ? "border-slate-800 bg-[#0c101b]/95 text-slate-300"
              : "border-slate-200 bg-white/95 text-slate-700 shadow-slate-100"
            }`}
        >
          {TASK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChangeStatus(s);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${status === s
                  ? isDark
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-400 border-l-2 border-indigo-500 font-bold"
                    : "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border-l-2 border-indigo-500 font-bold"
                  : isDark
                    ? "hover:bg-slate-800/60 text-slate-300 border-l-2 border-transparent"
                    : "hover:bg-slate-100/60 text-slate-700 border-l-2 border-transparent"
                }`}
            >
              {getStatusLabel(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskCard({
  task,
  onDeleteTask,
  onChangeStatus,
  onEditTask,
  theme = "dark",
  isOverlayPreview = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    disabled: isEditing || isOverlayPreview,
  });
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority || "medium");
  const [editDueDate, setEditDueDate] = useState(() => {
    if (!task.dueDate) return "";
    return new Date(task.dueDate).toISOString().split("T")[0];
  });
  const [showConfirm, setShowConfirm] = useState(false);



  const { lang } = useThemeLang();
  const t = translations[lang] || translations.vi;
  const isDark = theme === "dark";

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const isOverdue = (dateString) => {
    if (!dateString || task.status === "completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  const getDeadlineBadge = (dateString) => {
    if (!dateString || task.status === "completed") return null;
    const now = new Date();
    const dueDate = new Date(dateString);

    const diffTime = dueDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { text: t.overdue, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    } else if (diffHours <= 12) {
      return { text: t.dueSoon, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    return null;
  };

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;

    onEditTask(task._id, {
      title: trimmedTitle,
      description: editDescription.trim() || null,
      priority: editPriority,
      dueDate: editDueDate || null,
    });
    setIsEditing(false);
  };

  const dragStyle = (transform && !isOverlayPreview) ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : undefined,
  } : undefined;

  const dragClass = isOverlayPreview
    ? isDark
      ? "cursor-grabbing border-indigo-500 bg-[#0f172a] shadow-2xl scale-[1.04] rotate-[1.5deg] z-50 relative"
      : "cursor-grabbing border-indigo-300 bg-white shadow-2xl scale-[1.04] rotate-[1.5deg] z-50 relative"
    : isDragging
      ? isDark
        ? "opacity-15 border-dashed border-slate-700 bg-slate-950/40"
        : "opacity-15 border-dashed border-slate-300 bg-slate-200/20"
      : "cursor-grab";

  return (
    <motion.div
      ref={setNodeRef}
      style={dragStyle}
      {...(!isOverlayPreview ? listeners : {})}
      {...(!isOverlayPreview ? attributes : {})}
      layout={isOverlayPreview ? false : "position"}
      initial={isOverlayPreview ? false : { opacity: 0, y: 8 }}
      animate={isOverlayPreview ? false : { opacity: 1, y: 0 }}
      exit={isOverlayPreview ? false : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className={`flex flex-col justify-between rounded-xl border p-4 shadow-lg backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-150 ${dragClass} ${isOverlayPreview
          ? ""
          : isDark
            ? "border-slate-800/80 bg-slate-900/40 hover:border-slate-700/50 hover:shadow-indigo-950/10"
            : "border-slate-200/80 bg-white/75 hover:border-slate-300 shadow-slate-100/30 hover:shadow-xl hover:shadow-slate-200/45"
        }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          {/* Edit Title */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Title</label>
            <input
              className={`mt-1 w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors duration-150 ${isDark ? "border-slate-800 bg-slate-950/50 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          {/* Edit Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              className={`mt-1 w-full resize-none rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors duration-150 ${isDark ? "border-slate-800 bg-slate-950/50 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Edit Priority & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.priorityLabel}</label>
              <select
                className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 cursor-pointer transition-colors duration-150 ${isDark ? "border-slate-800 bg-slate-950/50 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
              >
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.dueDateLabel}</label>
              <input
                type="date"
                className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 cursor-pointer transition-colors duration-150 ${isDark ? "border-slate-800 bg-slate-950/50 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-755"
                  }`}
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                style={{ colorScheme: isDark ? "dark" : "light" }}
              />
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${isDark ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              onClick={() => {
                setEditTitle(task.title);
                setEditDescription(task.description || "");
                setEditPriority(task.priority || "medium");
                setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
                setIsEditing(false);
              }}
            >
              {t.cancel}
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
              onClick={handleSave}
            >
              {t.save}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            {/* Header badges and Checkbox */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${task.priority === "high"
                      ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                      : task.priority === "medium"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                        : isDark
                          ? "bg-slate-800/60 text-slate-400 border-slate-700/30"
                          : "bg-slate-100 text-slate-500 border-slate-200/50"
                    }`}
                >
                  {task.priority === "high" ? t.high : task.priority === "medium" ? t.medium : t.low}
                </span>

                {(() => {
                  const badge = getDeadlineBadge(task.dueDate);
                  if (badge) {
                    return (
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${badge.color}`}>
                        {badge.text}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {task.dueDate && (
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-semibold transition-colors duration-300 ${isOverdue(task.dueDate)
                      ? "text-rose-400"
                      : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                    stroke="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                  {formatDateForDisplay(task.dueDate)}
                </span>
              )}
            </div>

            {/* Task Title & Description */}
            <div className="mt-3">
              <h3
                className={`text-sm font-bold tracking-tight transition-colors duration-300 ${task.status === "completed"
                    ? "line-through text-slate-500"
                    : isDark
                      ? "text-slate-100"
                      : "text-slate-800"
                  }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-xs line-clamp-2 leading-relaxed transition-colors duration-300 ${isDark ? "text-slate-400" : "text-slate-650"
                  }`}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Time spent widget */}
            <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className={`h-4 w-4 ${task.status === "in-progress" ? "text-indigo-400 animate-pulse" : isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>
                {t.timeSpent}
                <span className={`font-semibold ${task.status === "in-progress" ? "text-indigo-500 dark:text-indigo-400" : isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {formatTime(task.timeSpent || 0)}
                </span>
              </span>
              {task.status === "in-progress" && (
                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-500/20 animate-pulse">
                  {t.activeBadge}
                </span>
              )}
            </div>
          </div>

          {/* Footer selectors and buttons */}
          <div className={`mt-4 flex items-center gap-2 border-t pt-3 transition-colors duration-300 ${isDark ? "border-slate-850/60" : "border-slate-100"
            }`}>
            <StatusDropdown
              status={task.status}
              onChangeStatus={(newStatus) => onChangeStatus(task._id, newStatus)}
              theme={theme}
            />

            <button
              className={`rounded-lg p-1.5 transition cursor-pointer ${isDark ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              onClick={() => setIsEditing(true)}
              title="Edit Task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
            </button>

            <button
              className={`rounded-lg p-1.5 transition cursor-pointer ${isDark ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-350" : "text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                }`}
              onClick={() => setShowConfirm(true)}
              title="Delete Task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9 9m9.768-1.503-.926 9a4.5 4.5 0 0 1-4.463 3.52H10.58a4.5 4.5 0 0 1-4.462-3.52L5.22 7.5M15 7.5a2.25 2.25 0 0 0-2.25-2.25h-1.5A2.25 2.25 0 0 0 9 7.5m5.437 0H9.563"
                />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        taskTitle={task.title}
        onConfirm={() => {
          setShowConfirm(false);
          onDeleteTask(task._id);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </motion.div>
  );
}
