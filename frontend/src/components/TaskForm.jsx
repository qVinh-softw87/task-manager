export default function TaskForm({ title, setTitle, onAddTask }) {
    return (
        <>
            <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
            />

            <button onClick={onAddTask}>Add Task</button>
        </>
    );
}