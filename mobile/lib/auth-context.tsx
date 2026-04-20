import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, removeToken } from "./api";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from secure storage on app start
    getToken().then((token) => {
      if (token) {
        // Token exists — parse user from it (stored separately)
        import("expo-secure-store").then(({ getItemAsync }) =>
          getItemAsync("mobile_auth_user").then((raw) => {
            if (raw) setUser(JSON.parse(raw));
          })
        );
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.auth.login(email, password);
    await setToken(token);
    const { setItemAsync } = await import("expo-secure-store");
    await setItemAsync("mobile_auth_user", JSON.stringify(user));
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    const { token, user } = await api.auth.register(email, password);
    await setToken(token);
    const { setItemAsync } = await import("expo-secure-store");
    await setItemAsync("mobile_auth_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await removeToken();
    const { deleteItemAsync } = await import("expo-secure-store");
    await deleteItemAsync("mobile_auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
