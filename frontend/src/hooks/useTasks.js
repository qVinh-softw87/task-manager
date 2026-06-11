import { useEffect, useRef, useState } from "react";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    bulkUpdateTasks,
    restoreTask,
    permanentDeleteTask
} from "../api/taskApi";
import { useToast } from "../context/ToastContext";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";
import { getErrorMessage } from "../utils/errorHandler";

export function useTasks(isTrash = false) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination & Sorting state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [sortOption, setSortOption] = useState("-createdAt");

    const toast = useToast();
    const { lang } = useThemeLang();
    const t = translations[lang] || translations.vi;

    async function loadTasks(reset = false, currentPage = page) {
        if (reset) {
            setLoading(true);
        }
        try {
            const params = { page: currentPage, limit: 20, isTrash };
            const result = await getTasks(params);
            const fetchedTasks = result.data || result;

            if (reset) {
                setTasks(fetchedTasks);
            } else {
                setTasks(prev => [...prev, ...fetchedTasks]);
            }

            if (result.pagination) {
                setHasMore(result.pagination.page < result.pagination.totalPages);
            } else {
                setHasMore(false);
            }
            setError("");
        } catch (err) {
            const msg = getErrorMessage(err, t);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    function fetchNextPage() {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadTasks(false, nextPage);
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
            const msg = getErrorMessage(err, t, t.toastAddError);
            setError(msg);
            toast.error(msg);
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
            const msg = getErrorMessage(err, t, t.toastEditError);
            setError(msg);
            toast.error(msg);
        }
    }

    async function changeStatus(id, newStatus, isDragOver = false, revertStatus = null) {
        setTasks(prev => prev.map(task =>
            task._id === id ? { ...task, status: newStatus } : task
        ));

        if (isDragOver) return;

        toast.info(t.toastStatusChanged);

        try {
            const res = await updateTask(id, { status: newStatus });
            if (res && res.data) {
                setTasks(prev => prev.map(task => task._id === id ? res.data : task));
            }
            setError("");
        } catch (err) {
            if (revertStatus) {
                setTasks(prev => prev.map(task =>
                    task._id === id ? { ...task, status: revertStatus } : task
                ));
            }
            const msg = getErrorMessage(err, t, t.toastStatusError);
            setError(msg);
            toast.error(msg);
        }
    }

    async function removeTask(id) {
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(task => task._id !== id));
        toast.success(t.toastDeleteSuccess);

        try {
            await deleteTask(id);
            setError("");
        } catch (err) {
            setTasks(previousTasks);
            const msg = getErrorMessage(err, t, t.toastDeleteError);
            setError(msg);
            toast.error(msg);
        }
    }

    async function bulkRemove(ids) {
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(task => !ids.includes(task._id)));
        toast.success(t.toastDeleteSuccess);

        try {
            await bulkDeleteTasks(ids);
            setError("");
        } catch (err) {
            setTasks(previousTasks);
            const msg = getErrorMessage(err, t, t.toastDeleteError);
            setError(msg);
            toast.error(msg);
        }
    }

    async function bulkChangeStatus(ids, newStatus) {
        const previousTasks = [...tasks];
        setTasks(prev => prev.map(task => ids.includes(task._id) ? { ...task, status: newStatus } : task));
        toast.info(t.toastStatusChanged);

        try {
            await bulkUpdateTasks(ids, { status: newStatus });
            setError("");
        } catch (err) {
            setTasks(previousTasks);
            const msg = getErrorMessage(err, t, t.toastStatusError);
            setError(msg);
            toast.error(msg);
        }
    }

    async function handleRestore(id) {
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(task => task._id !== id));
        toast.success(t.toastRestoreSuccess);

        try {
            await restoreTask(id);
            setError("");
        } catch (err) {
            setTasks(previousTasks);
            const msg = getErrorMessage(err, t, t.toastRestoreError);
            setError(msg);
            toast.error(msg);
        }
    }

    async function handlePermanentDelete(id) {
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(task => task._id !== id));
        toast.error(t.toastPermDeleteSuccess);

        try {
            await permanentDeleteTask(id);
            setError("");
        } catch (err) {
            setTasks(previousTasks);
            const msg = getErrorMessage(err, t, t.toastPermDeleteError);
            setError(msg);
            toast.error(msg);
        }
    }

    // Global 1-second timer: tick timeSpent for all in-progress tasks
    useEffect(() => {
        if (isTrash) return;

        const timer = setInterval(() => {
            setTasks(prev => prev.map(task =>
                task.status === "in-progress"
                    ? { ...task, timeSpent: (task.timeSpent || 0) + 1 }
                    : task
            ));
        }, 1000);

        return () => clearInterval(timer);
    }, [isTrash]);

    // Background sync: save timeSpent to DB every 10 seconds for in-progress tasks
    useEffect(() => {
        if (isTrash) return;

        const syncTimer = setInterval(async () => {
            const inProgressTasks = tasks.filter(t => t.status === "in-progress" && t._id && !t._id.startsWith("temp_"));
            await Promise.all(
                inProgressTasks.map(task =>
                    updateTask(task._id, { timeSpent: task.timeSpent }).catch(err =>
                        console.error("Failed to sync timeSpent for task", task._id, err)
                    )
                )
            );
        }, 10000);

        return () => clearInterval(syncTimer);
    }, [isTrash, tasks]);

    useEffect(() => {
        setPage(1);
        loadTasks(true, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTrash]);

    function refreshTasks() {
        setPage(1);
        loadTasks(true, 1);
    }

    return {
        tasks,
        loading,
        error,
        page,
        hasMore,
        fetchNextPage,
        addTask,
        editTask,
        changeStatus,
        removeTask,
        handleRestore,
        handlePermanentDelete,
        refreshTasks
    };
}
