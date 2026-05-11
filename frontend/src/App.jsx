import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

export default function App() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);

  function handleAddTask() {
    if(title.trim() === "") return 
    const newTask = {
      id = Date.now(),
      title,
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

      <TaskForm
        title={title}
        setTitle={setTitle}
        onAddTask={handleAddTask}
      />

      <TaskList
        tasks={tasks}
        onDeleteTask={onDeleteTask}
        onToggleTask={onToggleTask}
      />
    </>
  );
}