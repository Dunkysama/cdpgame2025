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
  const router = useRouter();

  // Charger les avatars depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAvatars = localStorage.getItem("avatars");
      if (savedAvatars) {
        try {
          const parsedAvatars = JSON.parse(savedAvatars);
          setAvatars(parsedAvatars);
        } catch (e) {
          console.error("Erreur lors du chargement des avatars:", e);
          console.error("Erreur lors du chargement des avatars:", e);
        }
      }
    }
  }, []);

  const handlePlay = () => {
    if (selectedPseudo) {
      router.push("/carte");
    }
  };

  const getAvatarImagePath = (avatar) => {
    // Si l'avatar a déjà un imagePath sauvegardé, l'utiliser
    if (avatar.imagePath) {
      return avatar.imagePath;
    }
    // Sinon, construire le chemin avec le nouveau format
    // Format des fichiers : Race-Sexe.png (ex: Humain-male.png)
    const raceCapitalized = (avatar.race || 'humain').charAt(0).toUpperCase() + (avatar.race || 'humain').slice(1);
    const sexeCapitalized = (avatar.sexe || 'male').charAt(0).toUpperCase() + (avatar.sexe || 'male').slice(1);
    return `/asset/${raceCapitalized}-${sexeCapitalized}.png`;
  };

  const handleDeleteClick = (avatar, index, e) => {
    e.stopPropagation(); // Empêcher la sélection de l'avatar
    setAvatarToDelete({ avatar, index });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (avatarToDelete && typeof window !== "undefined") {
      // Récupérer les avatars depuis localStorage
      const savedAvatars = localStorage.getItem("avatars");
      if (savedAvatars) {
        try {
          let avatarsArray = JSON.parse(savedAvatars);
          // Supprimer l'avatar à l'index spécifié
          avatarsArray = avatarsArray.filter((_, index) => index !== avatarToDelete.index);
          // Sauvegarder dans localStorage
          localStorage.setItem("avatars", JSON.stringify(avatarsArray));
          // Mettre à jour l'état
          setAvatars(avatarsArray);
          // Si l'avatar supprimé était sélectionné, désélectionner
          if (selectedPseudo === avatarToDelete.avatar) {
            setSelectedPseudo(null);
          }
        } catch (e) {
          console.error("Erreur lors de la suppression de l'avatar:", e);
        }
      }
    }
    // Fermer la popup
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
    if (heures > 0) {
      return `${heures}h ${mins}min`;
    }
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
              VOS AVATARS
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
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Afficher les avatars créés */}
            {avatars.map((avatar, index) => (
              <div key={index} className="flex flex-col items-center relative group">
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
                    alt={`Avatar ${avatar.race} ${avatar.sexe}`}
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
                  {/* Placeholder si l'image n'existe pas ou n'a pas encore chargé */}
                  {imageErrors[index] !== false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 pointer-events-none z-0">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🎮</div>
                      </div>
                    </div>
                  )}
                  {/* Bouton de suppression */}
                  <button
                    onClick={(e) => handleDeleteClick(avatar, index, e)}
                    className="absolute top-0 right-0 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-bl-lg flex items-center justify-center text-sm font-pixel transition-colors z-10"
                    aria-label="Supprimer l'avatar"
                  >
                    ×
                  </button>
                </div>
                {/* Affichage du pseudo */}
                <p className="text-xs font-pixel text-white mt-2 text-center max-w-[128px] truncate">
                  {avatar.pseudo || "Sans nom"}
                </p>
                {/* Tooltip avec les informations au hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-zinc-900 border-2 border-white rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="space-y-2">
                    <div className="border-b border-zinc-700 pb-2">
                      <p className="text-xs font-pixel text-white font-bold">
                        {avatar.pseudo || "Sans nom"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-pixel text-white/80">
                        <span className="text-white/60">Race:</span> {avatar.race?.toUpperCase() || "N/A"}
                      </p>
                      <p className="text-[10px] font-pixel text-white/80">
                        <span className="text-white/60">Sexe:</span> {avatar.sexe?.toUpperCase() || "N/A"}
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

          <Link
            href="/furie-sanguinaire"
            className="w-full max-w-md rounded-lg font-pixel bg-zinc-900 px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 mx-auto text-center block"
          >
            FURIE
          </Link>
          <Link
            href="/code-complet"
            className="w-full max-w-md rounded-lg font-pixel bg-zinc-900 px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 mx-auto text-center block"
          >
            SORT
          </Link>
          <Link
            href="/reconstruire-epee"
            className="w-full max-w-md rounded-lg font-pixel bg-zinc-900 px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 mx-auto text-center block"
          >
            ÉPÉE
          </Link>
        </div>

        {/* Popup de confirmation de suppression */}
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
