import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "./config";

const TOKEN_KEY = "mobile_auth_token";

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string } }>("/api/mobile/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string } }>("/api/mobile/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },
  expenses: {
    list: (params?: { projectId?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.projectId) qs.set("projectId", params.projectId);
      if (params?.limit) qs.set("limit", String(params.limit));
      return request<any[]>(`/api/mobile/expenses?${qs}`);
    },
    create: (data: { title: string; amount: number; date: string; categoryId: string; projectId?: string; description?: string }) =>
      request<any>("/api/mobile/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ title: string; amount: number; date: string; categoryId: string; description: string }>) =>
      request<any>(`/api/mobile/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/mobile/expenses/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => request<any[]>("/api/mobile/projects"),
    create: (name: string) =>
      request<any>("/api/mobile/projects", { method: "POST", body: JSON.stringify({ name }) }),
    update: (id: string, name: string) =>
      request<any>(`/api/mobile/projects/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/mobile/projects/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: (projectId?: string) => {
      const qs = projectId ? `?projectId=${projectId}` : "";
      return request<any[]>(`/api/mobile/categories${qs}`);
    },
  },
};
