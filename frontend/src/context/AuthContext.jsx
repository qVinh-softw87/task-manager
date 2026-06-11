import { useEffect, useState } from "react";
import * as authApi from "../api/authApi";
import { setAccessToken } from "../api/axiosClient";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loginUser(credentials) {
    try {
      setLoading(true);
      setError(null);

      const result = await authApi.login(credentials);
      const authUser = result.data;

      setAccessToken(authUser.token);
      setUser(authUser);

      return authUser;
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function registerUser(userData) {
    try {
      setLoading(true);
      setError(null);

      const result = await authApi.register(userData);
      const authUser = result.data;

      setAccessToken(authUser.token);
      setUser(authUser);

      return authUser;
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Register failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser() {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    try {
      setLoading(true);
      setError(null);

      const result = await authApi.refresh();

      if (result && result.data) {
        setAccessToken(result.data.token);
        setUser(result.data.user);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleLogout = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);

    loadCurrentUser();

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        loginUser,
        registerUser,
        logoutUser,
        loadCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
