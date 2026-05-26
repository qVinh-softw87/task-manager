import { useState } from "react";

import {
    TASK_STATUSES,
    TASK_STATUS_LABELS,
} from "../utils/constants";

export default function TaskCard({
    task,
    onDeleteTask,
    onChangeStatus,
    onEditTask,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);

    return (
        <li className="rounded-md border border-slate-200 bg-slate-50 p-3">
            {isEditing ? (
                <div className="space-y-2">
                    <input
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)} 
                    />

                    <div className="flex gap-2">
                        <button
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                            onClick={() => {
                                onEditTask(task.id, editTitle);
                                setIsEditing(false);
                            }}
                        >
                            Save
                        </button>

                        <button
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
                            onClick={() => {
                                setEditTitle(task.title);
                                setIsEditing(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-3 flex items-start justify-between gap-3">
                    <span
                        className="min-w-0 flex-1 text-sm"
                        style={{
                            textDecoration: 
                            task.status === "completed" ? "line-through" : "none",
                        }}
                    >
                        {task.title}
                    </span>

                    <button
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <select
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
                    value={task.status}
                    onChange={(e) => onChangeStatus(task.id, e.target.value)}
                >
                    {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {TASK_STATUS_LABELS[status]}
                        </option>
                    ))}
                </select>

                <button
                    className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => onDeleteTask(task.id)}
                >
                    Delete
                </button>
            </div>
        </li>
    );
}
