"use client";

import Button from "./Button";
import { useRouter } from "next/navigation";

/**
 * Bouton Abandonner qui redirige vers la page d'accueil
 */
export default function ButtonAbandonner({ className = "", ...props }) {
  const router = useRouter();

  const handleAbandon = () => {
    // Redirige vers la page d'accueil
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