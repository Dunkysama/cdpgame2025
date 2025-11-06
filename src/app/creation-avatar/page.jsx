"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AvatarCreationPage() {
  const [pseudo, setPseudo] = useState("");
  const [race, setRace] = useState("humain");
  const [sexe, setSexe] = useState("male");
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // Fonction pour obtenir le chemin de l'image de l'avatar
  const getAvatarImagePath = () => {
    // Convertir la race et le sexe pour correspondre au format des fichiers
    // Format des fichiers : Race-Sexe.png (ex: Humain-male.png)
    const raceCapitalized = race.charAt(0).toUpperCase() + race.slice(1);
    const sexeCapitalized = sexe.charAt(0).toUpperCase() + sexe.slice(1);
    return `/asset/${raceCapitalized}-${sexeCapitalized}.png`;
  };

  // Réinitialiser l'erreur quand on change de race ou sexe
  const handleRaceChange = (newRace) => {
    setRace(newRace);
    setImageError(false);
  };

  const handleSexeChange = (newSexe) => {
    setSexe(newSexe);
    setImageError(false);
  };

  const handleValidate = async () => {
    // Vérifier que le pseudo est rempli
    if (!pseudo.trim()) {
      alert("Veuillez entrer un pseudo");
      return;
    }

    const payload = {
      pseudo: pseudo.trim(),
      race,
      sexe,
      imagePath: getAvatarImagePath(),
    };

    // Tenter la création côté serveur si connecté
    try {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.ok) {
        const createRes = await fetch("/api/personnages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}));
          const msg = err?.error || `Création refusée (${createRes.status})`;
          alert(msg);
          return;
        }

        // Succès côté serveur
        router.push("/");
        return;
      }
    } catch (e) {
      // Ignore: on tombera sur la création locale
      console.warn("Création serveur indisponible, bascule en local:", e);
    }

    // Fallback: création locale (non connecté)
    if (typeof window !== "undefined") {
      // Vérifier le nombre maximum d'avatars (local uniquement)
      const savedAvatars = localStorage.getItem("avatars");
      if (savedAvatars) {
        try {
          const avatars = JSON.parse(savedAvatars);
          if (avatars.length >= 3) {
            alert("Vous ne pouvez pas créer plus de 3 avatars (mode local)");
            return;
          }
        } catch (e) {
          console.error("Erreur lors de la vérification des avatars:", e);
        }
      }

      const newAvatar = {
        ...payload,
        tempsDeJeu: 0,
        niveau: 1,
        createdAt: new Date().toISOString(),
      };

      let avatars = [];
      if (savedAvatars) {
        try { avatars = JSON.parse(savedAvatars); } catch {}
      }
      avatars.push(newAvatar);
      localStorage.setItem("avatars", JSON.stringify(avatars));
    }

    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      <div className="w-full max-w-4xl px-6 relative z-10">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-pixel text-white mb-4">
            CRÉATION D'AVATAR
          </h1>
          <p className="text-xs font-pixel text-white/80">
            Choisissez votre race et votre sexe
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Cadre d'affichage de l'avatar (64x64 pixels) */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 border-4 border-zinc-700 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
              {!imageError ? (
                <div className="w-full h-full relative">
                  <Image
                    key={`${race}-${sexe}`}
                    src={getAvatarImagePath()}
                    alt={`Avatar ${race} ${sexe}`}
                    fill
                    className="object-contain"
                    onError={() => setImageError(true)}
                    sizes="256px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎮</div>
                    <p className="text-xs font-pixel text-white/60">
                      {race.toUpperCase()}
                    </p>
                    <p className="text-xs font-pixel text-white/60">
                      {sexe.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options de sélection */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Champ Pseudo */}
            <div>
              <label
                htmlFor="pseudo"
                className="block text-xs font-medium font-pixel text-white mb-2"
              >
                PSEUDO
              </label>
              <input
                id="pseudo"
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                maxLength={20}
                className="w-full rounded-lg font-pixel text-xs border border-zinc-300 bg-white px-4 py-3 text-black placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                placeholder="Entrez votre pseudo"
              />
            </div>

            {/* Sélection de la race */}
            <div>
              <label className="block text-xs font-medium font-pixel text-white mb-3">
                RACE
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["humain", "elfe", "nain"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRaceChange(r)}
                    className={`px-4 py-3 rounded-lg font-pixel text-xs font-semibold transition-all ${
                      race === r
                        ? "bg-zinc-900 text-white border-2 border-white"
                        : "bg-zinc-800 text-white/70 border-2 border-transparent hover:bg-zinc-700"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection du sexe */}
            <div>
              <label className="block text-xs font-medium font-pixel text-white mb-3">
                SEXE
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["male", "femelle"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSexeChange(s)}
                    className={`px-4 py-3 rounded-lg font-pixel text-xs font-semibold transition-all ${
                      sexe === s
                        ? "bg-zinc-900 text-white border-2 border-white"
                        : "bg-zinc-800 text-white/70 border-2 border-transparent hover:bg-zinc-700"
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Boutons Retour + Valider */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex-1 rounded-lg font-pixel bg-zinc-800 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-zinc-600"
              >
                ANNULER
              </button>
              <button
                onClick={handleValidate}
                className="flex-1 rounded-lg font-pixel bg-zinc-900 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                VALIDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
