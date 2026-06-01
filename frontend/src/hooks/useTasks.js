import { useEffect, useState } from "react";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../api/taskApi";

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); 

    async function loadTasks() {
        try {
            const result = await getTasks();
            setTasks(result.data || result);
            setError("");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function addTask(taskData) {
        await createTask(taskData);
        await loadTasks();
    }

    async function editTask(id, newTitle) {
        const trimmedTitle = newTitle.trim();

        if (trimmedTitle === "") return;

        await updateTask(id, {
            title: trimmedTitle,
        });
        await loadTasks();
    }

    async function changeStatus(id, newStatus) {
        await updateTask(id, {
            status: newStatus,
        });

        await loadTasks();
    }

    async function removeTask(id) {
        await deleteTask(id);
        await loadTasks();
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
