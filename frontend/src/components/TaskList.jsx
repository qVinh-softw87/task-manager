import TaskCard from "./TaskCard";

export default function TaskList({ task, onDeleteTask, onToggleTask }) {
    return (
        <ul>
            {task.map(() => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onDeleteTask={onDeleteTask}
                    onToggleTask={onToggleTask}
                />
            ))}
        </ul>
    );
}