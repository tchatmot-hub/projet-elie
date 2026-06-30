"use client";

import type { AuthUser, Role } from "@/types";

export interface CurrentUser extends AuthUser {
  permissions: string[];
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Une erreur est survenue.");
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const data = await api.get<{ user: CurrentUser }>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case "superadmin":
      return "/admin/systeme";
    case "school_admin":
      return "/admin/ecole";
    case "delegate":
      return "/delegue";
    case "student":
      return "/etudiant";
    default:
      return "/";
  }
}
