"use client";

import { useEffect, useRef, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { api, type CurrentUser } from "@/lib/client";

interface Doc {
  _id: string;
  title: string;
  subject: string;
  professor: string;
  type: string;
  fileUrl: string;
  downloads: number;
}

interface AccessCode {
  _id: string;
  code: string;
  isUsed: boolean;
}

const DOC_TYPES = [
  { value: "course", label: "Cours" },
  { value: "td", label: "TD" },
  { value: "tp", label: "TP" },
  { value: "exam", label: "Examen" },
  { value: "correction", label: "Correction" },
];

export default function DelegatePage() {
  return (
    <DashboardShell allow={["delegate"]} title="Espace délégué">
      {(user) => <DelegateDashboard user={user} />}
    </DashboardShell>
  );
}

function DelegateDashboard({ user }: { user: CurrentUser }) {
  const classId = user.classId!;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [docForm, setDocForm] = useState({
    title: "",
    subject: "",
    professor: "",
    type: "course",
  });
  const [annForm, setAnnForm] = useState({ title: "", content: "", priority: "normal" });

  async function load() {
    try {
      const [d, c] = await Promise.all([
        api.get<{ documents: Doc[] }>(`/api/documents?classId=${classId}`),
        api.get<{ codes: AccessCode[] }>(`/api/codes?classId=${classId}`),
      ]);
      setDocs(d.documents);
      setCodes(c.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function publishDoc(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Échec de l'upload.");

      await api.post("/api/documents", {
        ...docForm,
        classId,
        fileUrl: upData.url,
        fileType: upData.fileType,
        fileSize: upData.size,
      });
      setDocForm({ title: "", subject: "", professor: "", type: "course" });
      if (fileRef.current) fileRef.current.value = "";
      setMsg("Document publié.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  }

  async function removeDoc(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    await api.del(`/api/documents/${id}`).catch(() => {});
    load();
  }

  async function publishAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/announcements", { ...annForm, classId });
      setAnnForm({ title: "", content: "", priority: "normal" });
      setMsg("Annonce publiée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  }

  async function generateCodes() {
    await api.post("/api/codes/generate", { classId, count: 5 }).catch(() => {});
    load();
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-600">{error}</p>}
      {msg && <p className="text-green-600">{msg}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Publier un document</h2>
          <form onSubmit={publishDoc} className="space-y-3">
            <input className="input" placeholder="Titre" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Matière" value={docForm.subject} onChange={(e) => setDocForm({ ...docForm, subject: e.target.value })} required />
              <input className="input" placeholder="Professeur" value={docForm.professor} onChange={(e) => setDocForm({ ...docForm, professor: e.target.value })} required />
            </div>
            <select className="input" value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input ref={fileRef} type="file" className="input" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" required />
            <button className="btn-primary w-full">Publier</button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Publier une annonce</h2>
          <form onSubmit={publishAnnouncement} className="space-y-3">
            <input className="input" placeholder="Titre" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} required />
            <textarea className="input" placeholder="Contenu" rows={3} value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} required />
            <select className="input" value={annForm.priority} onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}>
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
            <button className="btn-primary w-full">Diffuser</button>
          </form>
        </section>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Codes d&apos;accès étudiants</h2>
          <button onClick={generateCodes} className="btn-outline">
            Générer 5 codes
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {codes.map((c) => (
            <span
              key={c._id}
              className={`rounded-md px-3 py-1 font-mono text-sm ${
                c.isUsed ? "bg-slate-200 text-slate-400 line-through" : "bg-blue-100 text-blue-800"
              }`}
            >
              {c.code}
            </span>
          ))}
          {codes.length === 0 && <p className="text-slate-400">Aucun code généré.</p>}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Documents de la classe</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2">Titre</th>
                <th>Matière</th>
                <th>Type</th>
                <th>Téléch.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d._id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{d.title}</td>
                  <td>{d.subject}</td>
                  <td>{d.type}</td>
                  <td>{d.downloads}</td>
                  <td className="text-right">
                    <button onClick={() => removeDoc(d._id)} className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Aucun document.
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
