import axiosClient from "./axiosClient";

export async function register(userData) {
  return axiosClient.post("/api/auth/register", userData);
}

export async function login(credentials) {
  return axiosClient.post("/api/auth/login", credentials);
}

export async function getMe() {
  return axiosClient.get("/api/auth/me");
}

export async function updateProfile(profileData) {
  return axiosClient.patch("/api/auth/profile", profileData);
}

export async function changePassword(passwordData) {
  return axiosClient.put("/api/auth/change-password", passwordData);
}

export async function logout() {
  return axiosClient.post("/api/auth/logout");
}
