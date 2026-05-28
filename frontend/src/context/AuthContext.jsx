import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, clearAuth, getSavedUser, getToken, saveAuth } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser());
  const [isLoading, setIsLoading] = useState(Boolean(getToken()));

  const refreshUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      const me = await apiRequest("/auth/me");
      setUser(me);
      localStorage.setItem("buddyconnect_user", JSON.stringify(me));
      return me;
    } catch {
      clearAuth();
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    saveAuth(data.token, data.user);
    await refreshUser();
    return data.user;
  }, [refreshUser]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshUser, isAuthenticated: Boolean(user) }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
