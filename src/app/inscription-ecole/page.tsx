"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    code: "",
    domain: "",
    primaryColor: "#1d4ed8",
    secondaryColor: "#1e293b",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
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
      await api.post("/api/auth/register-school", form);
      router.push("/admin/ecole");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Inscrire mon école</h1>
      <p className="mt-1 text-sm text-slate-500">
        Créez l&apos;espace de votre école et son compte administrateur.
      </p>

      <form onSubmit={onSubmit} className="card mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de l'école" value={form.name} onChange={update("name")} required />
          <Field label="Code unique (ex: UCAO)" value={form.code} onChange={update("code")} required />
          <Field label="Domaine (optionnel)" value={form.domain} onChange={update("domain")} />
          <div>
            <label className="label">Couleur principale</label>
            <input type="color" className="input h-10 p-1" value={form.primaryColor} onChange={update("primaryColor")} />
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />
        <h2 className="font-semibold">Compte administrateur</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de l'admin" value={form.adminName} onChange={update("adminName")} required />
          <Field label="E-mail" type="email" value={form.adminEmail} onChange={update("adminEmail")} required />
        </div>
        <Field
          label="Mot de passe (8+ car., 1 majuscule, 1 chiffre, 1 spécial)"
          type="password"
          value={form.adminPassword}
          onChange={update("adminPassword")}
          required
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm underline">
            Annuler
          </Link>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Création…" : "Créer l'école"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} className="input" value={value} onChange={onChange} required={required} />
    </div>
  );
}
