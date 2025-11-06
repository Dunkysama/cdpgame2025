"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [avatars, setAvatars] = useState([]);
  const [selectedPseudo, setSelectedPseudo] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [avatarToDelete, setAvatarToDelete] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [source, setSource] = useState("local"); // 'local' | 'server'
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger les avatars: préférer la BD si l'utilisateur est connecté, sinon fallback localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Vérifie l'authentification
        const meRes = await fetch("/api/me", { cache: "no-store" });
        if (meRes.ok) {
          const me = await meRes.json();
          if (!cancelled) {
            console.log("[client] Session active:", {
              id: me.session?.id,
              iat: me.session?.iat,
              exp: me.session?.exp,
              user: me.user,
            });
          }
          // Auth OK -> récupérer les personnages depuis la BD
          const persRes = await fetch("/api/personnages", { cache: "no-store" });
          if (persRes.ok) {
            const data = await persRes.json();
            if (!cancelled) {
              setAvatars(data.personnages || []);
              setSource("server");
            }
          } else {
            // Si l'API échoue, fallback localStorage
            if (!cancelled) loadFromLocal();
          }
        } else {
          // Non authentifié -> localStorage
          if (!cancelled) {
            console.log("[client] Non connecté (pas de session valide)");
            loadFromLocal();
          }
        }
      } catch (e) {
        console.error("Erreur chargement avatars:", e);
        if (!cancelled) {
          loadFromLocal();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    function loadFromLocal() {
      if (typeof window !== "undefined") {
        const savedAvatars = localStorage.getItem("avatars");
        if (savedAvatars) {
          try {
            const parsedAvatars = JSON.parse(savedAvatars);
            setAvatars(parsedAvatars);
            setSource("local");
          } catch (e) {
            console.error("Erreur lors du chargement des avatars:", e);
          }
        } else {
          setAvatars([]);
          setSource("local");
        }
      }
    }

    return () => { cancelled = true; };
  }, []);

  const handlePlay = () => {
    if (selectedPseudo) {
      // Sauvegarder le personnage sélectionné dans localStorage
      if (typeof window !== "undefined") {
        console.log("Sauvegarde du personnage sélectionné:", selectedPseudo);
        localStorage.setItem("selectedCharacter", JSON.stringify(selectedPseudo));
        // Vérifier ce qui a été sauvegardé
        const saved = localStorage.getItem("selectedCharacter");
        console.log("Données sauvegardées dans localStorage:", saved);
      }
      router.push("/carte");
    }
  };

  // Fonction pour normaliser le sexe depuis la BD vers le format attendu
  const normalizeSexe = (sexe) => {
    if (!sexe) return 'male';
    const s = sexe.toString().toLowerCase();
    // Gérer les formats de la BD : 'Femme' -> 'femelle', 'Homme' -> 'male'
    if (s === 'femme' || s === 'femelle') return 'femelle';
    if (s === 'homme' || s === 'male') return 'male';
    return s; // Fallback si format inconnu
  };

  // Fonction pour normaliser la race depuis la BD vers le format attendu
  const normalizeRace = (race) => {
    if (!race) return 'humain';
    const r = race.toString().toLowerCase();
    // Gérer les formats de la BD : 'Elfe' -> 'elfe', 'Nain' -> 'nain', 'Humain' -> 'humain'
    if (r === 'elfe') return 'elfe';
    if (r === 'nain') return 'nain';
    if (r === 'humain') return 'humain';
    return r; // Fallback si format inconnu
  };

  const getAvatarImagePath = (avatar) => {
    // Si l'avatar vient de la BD et fournit une imagePath, l'utiliser
    if (avatar.imagePath) return avatar.imagePath;
    // Sinon, construire le chemin avec le nouveau format en normalisant depuis la BD
    const raceNormalized = normalizeRace(avatar.race);
    const sexeNormalized = normalizeSexe(avatar.sexe);
    const raceCapitalized = raceNormalized.charAt(0).toUpperCase() + raceNormalized.slice(1);
    const sexeCapitalized = sexeNormalized.charAt(0).toUpperCase() + sexeNormalized.slice(1);
    return `/asset/${raceCapitalized}-${sexeCapitalized}.png`;
  };

  const handleDeleteClick = (avatar, index, e) => {
    e.stopPropagation();
    
    setAvatarToDelete({ avatar, index });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (source === "server") {
      (async () => {
        try {
          const id = avatarToDelete?.avatar?.id;
          if (!id) throw new Error("ID du personnage manquant");

          // Suppression côté BD (soft delete)
          const delRes = await fetch(`/api/personnages?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          });

          if (!delRes.ok) {
            const msg = await delRes.text().catch(() => "");
            throw new Error(`Échec de la suppression (${delRes.status}) ${msg}`);
          }

          // Recharger la liste depuis la BD
          const persRes = await fetch("/api/personnages", { cache: "no-store" });
          if (persRes.ok) {
            const data = await persRes.json();
            setAvatars(data.personnages || []);
            // Si on avait sélectionné ce personnage, on désélectionne
            if (selectedPseudo && selectedPseudo.id === id) {
              setSelectedPseudo(null);
            }
          }
        } catch (e) {
          console.error("Erreur suppression serveur:", e);
        } finally {
          setShowConfirmDialog(false);
          setAvatarToDelete(null);
        }
      })();
      return;
    }
    if (avatarToDelete && typeof window !== "undefined") {
      const savedAvatars = localStorage.getItem("avatars");
      if (savedAvatars) {
        try {
          let avatarsArray = JSON.parse(savedAvatars);
          avatarsArray = avatarsArray.filter((_, index) => index !== avatarToDelete.index);
          localStorage.setItem("avatars", JSON.stringify(avatarsArray));
          setAvatars(avatarsArray);
          if (selectedPseudo === avatarToDelete.avatar) {
            setSelectedPseudo(null);
          }
        } catch (e) {
          console.error("Erreur lors de la suppression de l'avatar:", e);
        }
      }
    }
    setShowConfirmDialog(false);
    setAvatarToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setAvatarToDelete(null);
  };

  const formatTempsDeJeu = (minutes) => {
    if (!minutes) return "0 min";
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (heures > 0) return `${heures}h ${mins}min`;
    return `${mins}min`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      <div className="w-full max-w-2xl px-6 relative z-10">
        {/* Titre */}
        <div className="mb-12 text-center">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-bold font-pixel text-white flex-1">
              {source === 'server' ? 'VOS PERSONNAGES' : 'VOS AVATARS'}
            </h1>
            <div className="flex-1 flex justify-end">
              <Link
                href="/profil"
                className="rounded-lg font-pixel bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 border-2 border-transparent hover:border-white"
              >
                PROFIL
              </Link>
            </div>
          </div>
        </div>

        {/* Section Pseudo */}
        <div className="mb-8">
          {loading ? (
            <div className="text-center text-white font-pixel">Chargement...</div>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              {avatars.map((avatar, index) => (
                <div key={avatar.id ?? index} className="flex flex-col items-center relative group">
                  <div
                    onClick={() => setSelectedPseudo(avatar)}
                    className={`w-32 h-32 rounded-lg border-2 transition-all overflow-hidden relative cursor-pointer ${
                      selectedPseudo === avatar
                        ? "bg-zinc-900 border-white"
                        : "bg-zinc-800 border-zinc-600 hover:bg-zinc-700 hover:border-white"
                    }`}
                  >
                    <Image
                      src={getAvatarImagePath(avatar)}
                      alt={`Avatar ${avatar.race || ''} ${avatar.sexe || ''}`}
                      fill
                      className="object-contain"
                      unoptimized
                      onError={(e) => {
                        setImageErrors(prev => ({ ...prev, [index]: true }));
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        setImageErrors(prev => ({ ...prev, [index]: false }));
                      }}
                    />
                    {imageErrors[index] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 pointer-events-none z-0">
                        <div className="text-center">
                          <div className="text-3xl mb-1">🎮</div>
                        </div>
                      </div>
                    )}
                    {/* Bouton de suppression (actif pour local et BD) */}
                    <button
                      onClick={(e) => handleDeleteClick(avatar, index, e)}
                      className={`absolute top-0 right-0 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-bl-lg flex items-center justify-center text-sm font-pixel transition-colors z-10`}
                      aria-label="Supprimer l'avatar"
                      title={'Supprimer'}
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs font-pixel text-white mt-2 text-center max-w-32 truncate">
                    {avatar.pseudo || "Sans nom"}
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-zinc-900 border-2 border-white rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                    <div className="space-y-2">
                      <div className="border-b border-zinc-700 pb-2">
                        <p className="text-xs font-pixel text-white font-bold">
                          {avatar.pseudo || "Sans nom"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-pixel text-white/80">
                          <span className="text-white/60">Race:</span> {(avatar.race || "N/A").toString().toUpperCase()}
                        </p>
                        <p className="text-[10px] font-pixel text-white/80">
                          <span className="text-white/60">Sexe:</span> {(avatar.sexe || "N/A").toString().toUpperCase()}
                        </p>
                        <p className="text-[10px] font-pixel text-white/80">
                          <span className="text-white/60">Niveau:</span> {avatar.niveau || 1}
                        </p>
                        <p className="text-[10px] font-pixel text-white/80">
                          <span className="text-white/60">Temps de jeu:</span> {formatTempsDeJeu(avatar.tempsDeJeu || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* Bouton + (Création d'avatar) */}
            {avatars.length < 3 && (
              <div className="flex flex-col items-center">
                <Link
                  href="/creation-avatar"
                  className="w-32 h-32 rounded-lg font-pixel text-4xl border-2 border-zinc-600 bg-zinc-800 text-white/70 hover:bg-zinc-700 hover:border-white transition-all flex items-center justify-center"
                >
                  +
                </Link>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Bouton Jouer */}
        <div className="flex flex-col gap-4 justify-center mt-12">
          <button
            onClick={handlePlay}
            disabled={!selectedPseudo}
            className="w-full max-w-md rounded-lg font-pixel bg-zinc-900 px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-zinc-900 mx-auto"
          >
            JOUER
          </button>
        </div>

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border-2 border-white rounded-lg p-6 max-w-md mx-4">
              <h2 className="text-xl font-bold font-pixel text-white mb-4 text-center">
                SUPPRIMER L'AVATAR
              </h2>
              <p className="text-xs font-pixel text-white/80 mb-6 text-center">
                Êtes-vous sûr de vouloir supprimer l'avatar "{avatarToDelete?.avatar?.pseudo || "Sans nom"}" ?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg font-pixel bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-zinc-600"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg font-pixel bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 border-2 border-transparent hover:border-red-800"
                >
                  SUPPRIMER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
