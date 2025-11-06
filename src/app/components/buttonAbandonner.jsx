"use client";

import Button from "./Button";
import { useRouter } from "next/navigation";

/**
 * Bouton Abandonner qui redirige vers la page d'accueil
 */
export default function ButtonAbandonner({ className = "", ...props }) {
  const router = useRouter();

  const handleAbandon = async () => {
    // Réinitialiser la progression et les pénalités pour le Boss Final
    try {
      if (typeof window !== "undefined") {
        const savedCharacter = localStorage.getItem("selectedCharacter");
        if (savedCharacter) {
          const character = JSON.parse(savedCharacter);
          const idPersonnage = character.id;

          if (idPersonnage) {
            try {
              const response = await fetch(`/api/boss-mini-progress?idPersonnage=${idPersonnage}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                console.error("Erreur lors de la réinitialisation de la progression");
                // Fallback sur localStorage en cas d'erreur
                localStorage.setItem("furieProgress", "0");
                localStorage.setItem("sortProgress", "0");
                localStorage.setItem("epeeProgress", "0");
                localStorage.setItem("bossLivesPenalty", "0");
              }
            } catch (error) {
              console.error("Erreur lors de la réinitialisation de la progression:", error);
              // Fallback sur localStorage en cas d'erreur
              localStorage.setItem("furieProgress", "0");
              localStorage.setItem("sortProgress", "0");
              localStorage.setItem("epeeProgress", "0");
              localStorage.setItem("bossLivesPenalty", "0");
            }
          } else {
            // Fallback sur localStorage si pas d'ID de personnage
            localStorage.setItem("furieProgress", "0");
            localStorage.setItem("sortProgress", "0");
            localStorage.setItem("epeeProgress", "0");
            localStorage.setItem("bossLivesPenalty", "0");
          }
        } else {
          // Fallback sur localStorage si pas de personnage sélectionné
          localStorage.setItem("furieProgress", "0");
          localStorage.setItem("sortProgress", "0");
          localStorage.setItem("epeeProgress", "0");
          localStorage.setItem("bossLivesPenalty", "0");
        }
      }
    } catch {}

    // Rediriger vers la page d'accueil
    router.push("/");
  };

  return (
    <Button
      onClick={handleAbandon}
      variant="primary"
      className={`bg-red-600! hover:bg-red-500 cursor-pointer focus:ring-red-400 text-white! ${className}`}
      {...props}
    >
      Abandonner
    </Button>
  );
}