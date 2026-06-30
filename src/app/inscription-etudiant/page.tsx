"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";

export default function RegisterStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    accessCode: "",
    name: "",
    email: "",
    password: "",
    studentNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/register-student", form);
      router.push("/etudiant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold">Inscription étudiant</h1>
        <p className="mt-1 text-sm text-slate-500">
          Saisissez le code d&apos;accès fourni par votre délégué.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Code d&apos;accès</label>
            <input
              className="input uppercase tracking-widest"
              value={form.accessCode}
              onChange={update("accessCode")}
              maxLength={8}
              required
            />
          </div>
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={form.name} onChange={update("name")} required />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <label className="label">Numéro étudiant (optionnel)</label>
            <input className="input" value={form.studentNumber} onChange={update("studentNumber")} />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" className="input" value={form.password} onChange={update("password")} required />
            <p className="mt-1 text-xs text-slate-500">
              8+ caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Inscription…" : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link href="/connexion" className="underline">
            J&apos;ai déjà un compte
          </Link>
          <Link href="/" className="underline">
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
