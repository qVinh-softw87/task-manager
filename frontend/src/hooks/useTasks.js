import { useEffect, useState } from "react";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../api/taskApi";
import { useToast } from "../context/ToastContext";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const toast = useToast();
    const { lang } = useThemeLang();
    const t = translations[lang] || translations.vi;

    async function loadTasks() {
        try {
            const result = await getTasks();
            setTasks(result.data || result);
            setError("");
        } catch (err) {
            setError(err.message);
            toast.error(t.toastLoadError);
        } finally {
            setLoading(false);
        }
    }

    async function addTask(taskData) {
        // Optimistic UI: show task immediately before API
        const tempId = `temp_${Date.now()}`;
        const optimisticTask = {
            _id: tempId,
            _uiKey: tempId,          // stable key for AnimatePresence
            title: taskData.title,
            description: taskData.description || "",
            priority: taskData.priority || "medium",
            dueDate: taskData.dueDate || null,
            status: "pending",
            timeSpent: 0,
            lastStartedAt: null,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [optimisticTask, ...prev]);
        toast.success(t.toastAddSuccess);

        try {
            const res = await createTask(taskData);
            if (res && res.data) {
                // Keep same _uiKey so AnimatePresence doesn't re-animate
                setTasks(prev => prev.map(t =>
                    t._id === tempId ? { ...res.data, _uiKey: tempId } : t
                ));
            }
            setError("");
        } catch (err) {
            setTasks(prev => prev.filter(t => t._id !== tempId));
            setError(err.message);
            toast.error(t.toastAddError);
        }
    }

    async function editTask(id, taskData) {
        if (taskData.title !== undefined) {
            taskData.title = taskData.title.trim();
            if (taskData.title === "") return;
        }

        toast.success(t.toastEditSuccess);
        try {
            const res = await updateTask(id, taskData);
            if (res && res.data) {
                setTasks(prev => prev.map(t => t._id === id ? res.data : t));
            }
            setError("");
        } catch (err) {
            setError(err.message);
            toast.error(t.toastEditError);
        }
    }

    async function changeStatus(id, newStatus, isDragOver = false, revertStatus = null) {
        // Simple optimistic update — only change status locally
        // Do NOT set lastStartedAt here; let TaskCard track local start time
        // to avoid timer reset when real server data arrives
        setTasks(prev => prev.map(task =>
            task._id === id ? { ...task, status: newStatus } : task
        ));

        // If this is just a drag-over preview update, skip the API call and toast notification
        if (isDragOver) return;

        toast.info(t.toastStatusChanged);

        try {
            const res = await updateTask(id, { status: newStatus });
            if (res && res.data) {
                setTasks(prev => prev.map(task => task._id === id ? res.data : task));
            }
            setError("");
        } catch (err) {
            // Revert to initial status if call fails
            if (revertStatus) {
                setTasks(prev => prev.map(task =>
                    task._id === id ? { ...task, status: revertStatus } : task
                ));
            }
            setError(err.message);
            toast.error(t.toastStatusError);
        }
    }

    async function removeTask(id) {
        const previousTasks = [...tasks];

        // Optimistically remove from UI immediately
        setTasks(prev => prev.filter(task => task._id !== id));
        toast.success(t.toastDeleteSuccess);

        try {
            await deleteTask(id);
            setError("");
        } catch (err) {
            // Revert state if backend request fails
            setTasks(previousTasks);
            setError(err.message);
            toast.error(t.toastDeleteError);
        }
    }

    useEffect(() => {
        const timerId = setTimeout(() => {
            loadTasks();
        }, 0);

        return () => clearTimeout(timerId);
    }, []);

    return {
        tasks,
        loading,
        error,
        addTask,
        editTask,
        changeStatus,
        removeTask,
    };
}

