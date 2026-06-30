"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

interface PublicSchool {
  _id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor?: string;
}

export default function HomePage() {
  const [schools, setSchools] = useState<PublicSchool[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ schools: PublicSchool[] }>("/api/schools/public")
      .then((d) => setSchools(d.schools))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  const current = schools.find((s) => s._id === selected);

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold">Portail des cours</span>
          <Link href="/connexion" className="btn-outline">
            Se connecter
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Le partage de cours, pour toutes les écoles
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Une plateforme multi-écoles, multi-classes et multi-délégués pour
          diffuser et retrouver vos documents académiques en toute sécurité.
        </p>

        <div className="mx-auto mt-10 max-w-md">
          <label htmlFor="school-select" className="label text-left">
            Choisissez votre école
          </label>
          <select
            id="school-select"
            className="input"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={loading}
          >
            <option value="">
              {loading ? "Chargement…" : "— Sélectionner une école —"}
            </option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>

          {current && (
            <div
              className="mt-4 rounded-lg p-4 text-white"
              style={{ backgroundColor: current.primaryColor || "#1d4ed8" }}
            >
              Bienvenue sur l&apos;espace <strong>{current.name}</strong>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/inscription-etudiant" className="btn-primary">
              S&apos;inscrire comme étudiant
            </Link>
            <Link href="/connexion" className="btn-outline">
              Espace délégué
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-3">
          <Stat label="Écoles" value={schools.length} />
          <Stat label="Accès sécurisé" value="JWT" />
          <Stat label="Rôles" value={4} />
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-500">
        Vous représentez une nouvelle école ?{" "}
        <Link href="/inscription-ecole" className="font-semibold underline">
          Inscrire mon école
        </Link>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
