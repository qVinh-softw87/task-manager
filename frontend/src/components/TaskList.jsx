import TaskCard from "./TaskCard";

import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "../utils/constants";

export default function TaskList({ tasks, onDeleteTask, onChangeStatus, onEditTask }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const filteredTasks = tasks.filter(
            (task) => task.status === status
          );

          return (
            <section
              key={status}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  {TASK_STATUS_LABELS[status]}
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {filteredTasks.length}
                </span>
              </div>

              {filteredTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks in this section.</p>
              ) : (
                <ul className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDeleteTask={onDeleteTask}
                      onChangeStatus={onChangeStatus}
                      onEditTask={onEditTask}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
    </div>
  );
}
