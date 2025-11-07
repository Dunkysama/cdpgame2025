"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../components/Button";

export default function LoginPage() {
const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isLoading) return;
  setIsLoading(true);
  setError(null);

  try {
    const res = await fetch("/api/connexion", {  // 👈 ou /api/connexion si tu renomme le dossier
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
      cache: "no-store",
    });

    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = typeof payload === "string" ? payload : payload?.error;
      throw new Error(msg || "Nom d'utilisateur ou mot de passe incorrect");
    }

    if (typeof payload === "object" && payload?.ok === true) {
      // S'assurer que les clés de badges existent après connexion
      try {
        const unlocked = localStorage.getItem("unlockedBadges");
        if (!unlocked) localStorage.setItem("unlockedBadges", JSON.stringify([]));

        const stats = localStorage.getItem("gameStats");
        if (!stats) {
          localStorage.setItem(
            "gameStats",
            JSON.stringify({
              consecutiveWins: 0,
              totalGames: 0,
              perfectGames: 0,
              averageResponseTime: 0,
              responseTimes: [],
            })
          );
        }

        const cq = localStorage.getItem("completedQuizzes");
        if (!cq) localStorage.setItem("completedQuizzes", JSON.stringify({}));
      } catch {}

      router.push("/");
    } else {
      throw new Error(payload?.error || "Nom d'utilisateur ou mot de passe incorrect");
    }
  } catch (err) {
    setError(err.message || "Erreur de connexion");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      <div className="w-full max-w-md px-6 relative z-10">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-pixel text-white">
            CONNEXION
          </h1>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium font-pixel text-white mb-2"
            >
            E-MAIL UTILISATEUR
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg font-pixel text-xs border border-zinc-300 bg-white px-4 py-3 text-black placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
              placeholder="Le seigneur des bugs"
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium font-pixel text-white mb-2"
            >
              MOT DE PASSE
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full font-pixel text-xs rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-12 text-black placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m0 0l18 18m0 0l-3.228-3.228m0 0A10.45 10.45 0 0112 19.5m-6.772-1.228L12 19.5m0 0l3.228-3.228"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Lien mot de passe oublié */}
          <div className="text-right">
            <Link
              href="/mot-de-passe-oublie"
              className="text-[10px] font-medium font-pixel text-white hover:text-zinc-300"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg font-pixel bg-zinc-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-center">
            <p className="text-xs font-pixel text-red-400">{String(error)}</p>
          </div>
        )}

        {/* Lien vers l'inscription */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-medium font-pixel text-white">
            Vous n'avez pas de compte ?{" "}
            <Link
              href="/inscription"
              className="font-medium text-white hover:text-zinc-300 underline"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

