"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, fetchCurrentUser, type CurrentUser } from "@/lib/client";
import type { Role } from "@/types";

const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Administrateur système",
  school_admin: "Administrateur école",
  delegate: "Délégué",
  student: "Étudiant",
};

export default function DashboardShell({
  allow,
  title,
  children,
}: {
  allow: Role[];
  title: string;
  children: (user: CurrentUser) => React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">("loading");

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u) {
        router.replace("/connexion");
        return;
      }
      if (!allow.includes(u.role)) {
        setStatus("denied");
        return;
      }
      setUser(u);
      setStatus("ready");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await api.post("/api/auth/logout").catch(() => {});
    router.push("/");
  }

  if (status === "loading") {
    return <div className="p-10 text-center text-slate-500">Chargement…</div>;
  }
  if (status === "denied" || !user) {
    return (
      <div className="p-10 text-center text-red-600">
        Accès refusé pour votre rôle.
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-xs text-slate-500">
              {user.name} · {ROLE_LABEL[user.role]}
            </p>
          </div>
          <button onClick={logout} className="btn-outline">
            Déconnexion
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children(user)}</main>
    </div>
  );
}
