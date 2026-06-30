"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api, type CurrentUser } from "@/lib/client";

interface ClassItem {
  _id: string;
  name: string;
  code: string;
  level: string;
  academicYear: string;
}

interface SchoolStats {
  classes: number;
  delegates: number;
  students: number;
  documents: number;
}

export default function SchoolAdminPage() {
  return (
    <DashboardShell allow={["school_admin", "superadmin"]} title="Administration école">
      {(user) => <SchoolDashboard user={user} />}
    </DashboardShell>
  );
}

function SchoolDashboard({ user }: { user: CurrentUser }) {
  const schoolId = user.schoolId!;
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [error, setError] = useState("");

  const [classForm, setClassForm] = useState({
    name: "",
    code: "",
    level: "L1",
    academicYear: "2026-2027",
    department: "",
  });
  const [delForm, setDelForm] = useState({
    classId: "",
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [s, c] = await Promise.all([
        api.get<{ stats: SchoolStats }>(`/api/stats/school/${schoolId}`),
        api.get<{ classes: ClassItem[] }>(`/api/classes?schoolId=${schoolId}`),
      ]);
      setStats(s.stats);
      setClasses(c.classes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/classes", { ...classForm, schoolId });
      setClassForm({ name: "", code: "", level: "L1", academicYear: "2026-2027", department: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  }

  async function createDelegate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/api/delegates", { ...delForm, schoolId });
      setMessage(`Délégué ${delForm.name} créé.`);
      setDelForm({ classId: "", name: "", username: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  }

  async function removeClass(id: string) {
    if (!confirm("Supprimer cette classe ?")) return;
    await api.del(`/api/classes/${id}`).catch(() => {});
    load();
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-600">{error}</p>}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Classes" value={stats?.classes} />
        <StatCard label="Délégués" value={stats?.delegates} />
        <StatCard label="Étudiants" value={stats?.students} />
        <StatCard label="Documents" value={stats?.documents} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Créer une classe</h2>
          <form onSubmit={createClass} className="space-y-3">
            <input className="input" placeholder="Nom (ex: Licence 1 Informatique Groupe A)" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Code (ex: L1-INFO-A)" value={classForm.code} onChange={(e) => setClassForm({ ...classForm, code: e.target.value })} required />
              <input className="input" placeholder="Niveau (L1)" value={classForm.level} onChange={(e) => setClassForm({ ...classForm, level: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Année (2026-2027)" value={classForm.academicYear} onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })} required />
              <input className="input" placeholder="Département" value={classForm.department} onChange={(e) => setClassForm({ ...classForm, department: e.target.value })} />
            </div>
            <button className="btn-primary w-full">Ajouter la classe</button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Nommer un délégué</h2>
          <form onSubmit={createDelegate} className="space-y-3">
            <select className="input" value={delForm.classId} onChange={(e) => setDelForm({ ...delForm, classId: e.target.value })} required>
              <option value="">— Classe —</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Nom" value={delForm.name} onChange={(e) => setDelForm({ ...delForm, name: e.target.value })} required />
            <input className="input" placeholder="Nom d'utilisateur" value={delForm.username} onChange={(e) => setDelForm({ ...delForm, username: e.target.value })} required />
            <input type="email" className="input" placeholder="E-mail" value={delForm.email} onChange={(e) => setDelForm({ ...delForm, email: e.target.value })} required />
            <input type="password" className="input" placeholder="Mot de passe" value={delForm.password} onChange={(e) => setDelForm({ ...delForm, password: e.target.value })} required />
            <button className="btn-primary w-full">Créer le délégué</button>
            {message && <p className="text-sm text-green-600">{message}</p>}
          </form>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Classes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2">Nom</th>
                <th>Code</th>
                <th>Niveau</th>
                <th>Année</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td>{c.code}</td>
                  <td>{c.level}</td>
                  <td>{c.academicYear}</td>
                  <td className="text-right">
                    <button onClick={() => removeClass(c._id)} className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Aucune classe.
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
