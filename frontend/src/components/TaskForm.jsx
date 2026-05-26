export default function TaskForm({ title, setTitle, onAddTask }) {
    return (
        <div className="mb-6 flex gap-3">
            <input 
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
            />

            <button
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                onClick={onAddTask}
            >
                Add Task
            </button>
        </div>
    );
}
