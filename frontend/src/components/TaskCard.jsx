export default function TaskCard({ task, onDeleteTask, onToggleTask}) {
    return (
        <li>
           <span
            onClick={() => onToggleTask(task.id)}
            style={{
                cursor: "pointer",
                textDecoration: task.completed ? "line-through" : "none",
            }}
           >
                {task.completed ? "✅" : "❌"} {task.title}
           </span> 

           <button onClick={() => onDeleteTask(task.id)}>
                Delete
           </button>
        </li>
    );
}