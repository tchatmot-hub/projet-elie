"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api, type CurrentUser } from "@/lib/client";

interface Doc {
  _id: string;
  title: string;
  subject: string;
  professor: string;
  type: string;
  fileUrl: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

export default function StudentPage() {
  return (
    <DashboardShell allow={["student"]} title="Espace étudiant">
      {(user) => <StudentDashboard user={user} />}
    </DashboardShell>
  );
}

function StudentDashboard({ user }: { user: CurrentUser }) {
  const classId = user.classId!;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("tous");
  const [error, setError] = useState("");

  async function loadDocs() {
    try {
      const params = new URLSearchParams({ classId });
      if (query) params.set("q", query);
      if (type !== "tous") params.set("type", type);
      const d = await api.get<{ documents: Doc[] }>(`/api/documents?${params}`);
      setDocs(d.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  }

  useEffect(() => {
    api
      .get<{ announcements: Announcement[] }>(`/api/announcements?classId=${classId}`)
      .then((a) => setAnnouncements(a.announcements))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(loadDocs, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type]);

  async function download(d: Doc) {
    try {
      const res = await api.post<{ fileUrl: string }>(`/api/documents/${d._id}/download`);
      window.open(res.fileUrl, "_blank");
    } catch {
      window.open(d.fileUrl, "_blank");
    }
  }

  async function toggleFavorite(id: string) {
    const res = await api
      .post<{ favorited: boolean }>(`/api/documents/${id}/favorite`)
      .catch(() => null);
    if (!res) return;
    setFavorites((f) => (res.favorited ? [...f, id] : f.filter((x) => x !== id)));
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-600">{error}</p>}

      {announcements.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Annonces</h2>
          {announcements.map((a) => (
            <div key={a._id} className="card border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{a.title}</h3>
                <span className="text-xs uppercase text-slate-400">{a.priority}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{a.content}</p>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Bibliothèque de documents</h2>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="input"
            placeholder="Rechercher (titre, matière, professeur)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="input sm:w-48" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="tous">Tous les types</option>
            <option value="course">Cours</option>
            <option value="td">TD</option>
            <option value="tp">TP</option>
            <option value="exam">Examen</option>
            <option value="correction">Correction</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div key={d._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                  {d.type}
                </span>
                <button
                  onClick={() => toggleFavorite(d._id)}
                  aria-label="Favori"
                  className="text-xl leading-none"
                >
                  {favorites.includes(d._id) ? "★" : "☆"}
                </button>
              </div>
              <h3 className="mt-2 font-semibold">{d.title}</h3>
              <p className="text-sm text-slate-500">
                {d.subject} · {d.professor}
              </p>
              <button onClick={() => download(d)} className="btn-primary mt-3 w-full">
                Télécharger
              </button>
            </div>
          ))}
          {docs.length === 0 && (
            <p className="col-span-full py-6 text-center text-slate-400">
              Aucun document trouvé.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
