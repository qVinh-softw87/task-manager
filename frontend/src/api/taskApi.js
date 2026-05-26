const API_URL = import.meta.env.VITE_API_URL||"http://localhost:3000";

export async function getTasks() {
  const res = await fetch(`${API_URL}/api/tasks`)

  if(!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return res.json();
}

export async function createTask(taskData) {
  const res = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if(!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return res.json();
}

export async function updateTask(id, taskData) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method:"PUT",
    header: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if(!res.ok) {
    throw new Error("Failed to update task");
  }

  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });

  if(!res.ok) {
    throw new Error("Failed to delete task");
  }

  return res.json;
}