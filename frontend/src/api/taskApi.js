import axiosClient from "./axiosClient";

export async function getTasks(params) {
  return axiosClient.get("/api/tasks", { params });
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

export async function bulkDeleteTasks(ids) {
  return axiosClient.post("/api/tasks/bulk-delete", { ids });
}

export async function bulkUpdateTasks(ids, updateData) {
  return axiosClient.post("/api/tasks/bulk-update", { ids, updateData });
}

export async function restoreTask(id) {
  return axiosClient.put(`/api/tasks/${id}/restore`);
}

export async function permanentDeleteTask(id) {
  return axiosClient.delete(`/api/tasks/${id}/permanent`);
}

export async function getAnalytics() {
  return axiosClient.get("/api/tasks/analytics");
}
