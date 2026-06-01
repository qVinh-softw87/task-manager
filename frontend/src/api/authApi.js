import { getToken } from "../utils/tokenStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthHeaders() {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse(res, fallbackMessage) {
  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || fallbackMessage);
  }

  return result;
}

export async function register(userData) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseResponse(res, "Register failed");
}

export async function login(credentials) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return parseResponse(res, "Login failed");
}

export async function getMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  return parseResponse(res, "Get current user failed");
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(profileData),
  });

  return parseResponse(res, "Update profile failed");
}

export async function changePassword(passwordData) {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(passwordData),
  });

  return parseResponse(res, "Change password failed");
}
