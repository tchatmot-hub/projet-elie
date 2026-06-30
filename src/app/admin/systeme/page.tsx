"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/client";

interface School {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface SystemStats {
  schools: number;
  classes: number;
  delegates: number;
  students: number;
  documents: number;
}

export default function SystemAdminPage() {
  return (
    <DashboardShell allow={["superadmin"]} title="Administration système">
      {() => <SystemDashboard />}
    </DashboardShell>
  );
}

function SystemDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [s, sc] = await Promise.all([
        api.get<{ stats: SystemStats }>("/api/stats/system"),
        api.get<{ schools: School[] }>("/api/schools"),
      ]);
      setStats(s.stats);
      setSchools(sc.schools);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cette école et toutes ses données ?")) return;
    await api.del(`/api/schools/${id}`).catch(() => {});
    load();
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-600">{error}</p>}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Écoles" value={stats?.schools} />
        <StatCard label="Classes" value={stats?.classes} />
        <StatCard label="Délégués" value={stats?.delegates} />
        <StatCard label="Étudiants" value={stats?.students} />
        <StatCard label="Documents" value={stats?.documents} />
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Écoles</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2">Nom</th>
                <th>Code</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s._id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.isActive ? "Active" : "Inactive"}</td>
                  <td className="text-right">
                    <button onClick={() => remove(s._id)} className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Aucune école.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-blue-600">{value ?? "—"}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
