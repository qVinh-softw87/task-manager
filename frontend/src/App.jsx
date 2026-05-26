import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

export default function App() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);

  function handleAddTask() {
    const trimmedTitle = title.trim();

    if (trimmedTitle === "") return;

    const newTask = {
      id: Date.now(),
      title: trimmedTitle,
      status: "pending",
    };

    setTasks([...tasks, newTask]);
    setTitle("");
  }

  function handleDeleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function handleEditTask(id, newTitle) {
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === "") return;

    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            title: trimmedTitle,
          };
        }
        return task;
      })
    );
  }

  function handleChangeState(id, newStatus) {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: newStatus,
          };
        }
        return task;
      })
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-slate-50 px-4 py-8 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">Task Manager</h1>

      <TaskForm
        title={title}
        setTitle={setTitle}
        onAddTask={handleAddTask}
      />

      <TaskList
        tasks={tasks}
        onDeleteTask={handleDeleteTask}
        onChangeStatus={handleChangeState}
        onEditTask={handleEditTask}
      />
    </main>
  );
}
