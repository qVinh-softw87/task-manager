import axiosClient from "./axiosClient";

export async function getTasks() {
  return axiosClient.get("/api/tasks");
}

export async function createTask(taskData) {
  return axiosClient.post("/api/tasks", taskData);
}

export async function updateTask(id, taskData) {
  return axiosClient.put(`/api/tasks/${id}`, taskData);
}

export async function deleteTask(id) {
  return axiosClient.delete(`/api/tasks/${id}`);
}
