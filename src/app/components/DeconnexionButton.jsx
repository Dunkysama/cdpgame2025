"use client";
import Button from "./Button";
import { useRouter } from "next/navigation";

/**
 * Bouton Déconnexion qui déconnecte l'utilisateur et redirige vers la page de connexion
 */

export default function ButtonDeconnexion({ className = "", ...props }) {
  const router = useRouter();

  /*
  const handleLogout = () => {
    // Supprime les données de session ou de stockage local
    if (typeof window !== "undefined") {
      localStorage.removeItem("user"); // Exemple : suppression des données utilisateur
      sessionStorage.removeItem("user"); // Exemple : suppression des données utilisateur
    }

    // Redirige vers la page de connexion
    router.push("/connexion");
  };*/

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST"});

      } catch (_) {
        // Ignorer les erreurs de déconnexion
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        }
        router.push("/connexion");
      }
    };

  return (
    <Button
      onClick={handleLogout}
      variant="secondary"
      className={`bg-white text-black hover:bg-gray-200 focus:ring-gray-400 ${className}`}
      {...props}
    >
      Déconnexion
    </Button>
  );
  
}