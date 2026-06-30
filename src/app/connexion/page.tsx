"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, homePathForRole, type CurrentUser } from "@/lib/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await api.post<{ user: CurrentUser }>("/api/auth/login", {
        email,
        password,
      });
      router.push(homePathForRole(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accédez à votre espace (étudiant, délégué ou administrateur).
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link href="/inscription-etudiant" className="underline">
            Inscription étudiant
          </Link>
          <Link href="/" className="underline">
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
