import { useState } from "react";

export default function App() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);

  function handleAddTask() {
    if (title.trim() === "") return;

    const newTask = {
      id: Date.now(),
      title: title,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTitle("");
  }

  function handleDeleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function handleToggleTask(id) {
    setTasks(
      tasks.map((task) => {
        if(task.id === id) {
          return {
          ...task,
          completed: !task.completed,
        };
        }
        return task;
      })
    );
  }

  return (
    <>
      <h1>Task Manager</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
      />

      <button onClick={handleAddTask}>Add Task</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span
              onClick={() => handleToggleTask(task.id)}
              style={{
                cursor: "pointer",
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.completed ? "✅" : "❌"} {task.title}
            </span>

            <button onClick={() => handleDeleteTask(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}