import { useEffect, useState } from "react";
import * as authApi from "../api/authApi";
import { getToken, removeToken, setToken } from "../utils/tokenStorage";
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

      setToken(authUser.token);
      setUser(authUser);

      return authUser;
    } catch (error) {
      setError(error.message || "Login failed");
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

      setToken(authUser.token);
      setUser(authUser);

      return authUser;
    } catch (error) {
      setError(error.message || "Register failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logoutUser() {
    removeToken();
    setUser(null);
    setError(null);
  }

  async function loadCurrentUser() {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await authApi.getMe();

      setUser(result.data);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadCurrentUser();
    }, 0);

    return () => clearTimeout(timerId);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
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
