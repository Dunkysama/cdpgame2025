"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GameOverPage() {
  const [isExploding, setIsExploding] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Créer des particules avec leurs positions calculées
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      const angle = (360 / 20) * i;
      const distance = 100 + Math.random() * 200;
      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians) * distance;
      const y = Math.sin(radians) * distance;
      
      newParticles.push({
        id: i,
        x,
        y,
        duration: 1 + Math.random(),
      });
    }
    setParticles(newParticles);

    // Déclencher l'animation après un court délai
    const timer = setTimeout(() => {
      setIsExploding(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Réinitialiser la progression des mini-jeux et les pénalités de vies
  useEffect(() => {
    const resetProgress = async () => {
      try {
        if (typeof window !== "undefined") {
          const savedCharacter = localStorage.getItem("selectedCharacter");
          if (savedCharacter) {
            const character = JSON.parse(savedCharacter);
            const idPersonnage = character.id;

            if (idPersonnage) {
              const response = await fetch(`/api/boss-mini-progress?idPersonnage=${idPersonnage}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                console.error("Erreur lors de la réinitialisation de la progression");
                // Fallback sur localStorage en cas d'erreur
                localStorage.removeItem("furieProgress");
                localStorage.removeItem("sortProgress");
                localStorage.removeItem("epeeProgress");
                localStorage.removeItem("bossLivesPenalty");
              }
            } else {
              // Fallback sur localStorage si pas d'ID de personnage
              localStorage.removeItem("furieProgress");
              localStorage.removeItem("sortProgress");
              localStorage.removeItem("epeeProgress");
              localStorage.removeItem("bossLivesPenalty");
            }
          } else {
            // Fallback sur localStorage si pas de personnage sélectionné
            localStorage.removeItem("furieProgress");
            localStorage.removeItem("sortProgress");
            localStorage.removeItem("epeeProgress");
            localStorage.removeItem("bossLivesPenalty");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la réinitialisation de la progression:", error);
        // Fallback sur localStorage en cas d'erreur
        try {
          localStorage.removeItem("furieProgress");
          localStorage.removeItem("sortProgress");
          localStorage.removeItem("epeeProgress");
          localStorage.removeItem("bossLivesPenalty");
        } catch {}
      }
    };

    resetProgress();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      <div className="w-full max-w-4xl px-6 relative z-10 text-center">
        <h1
          className={`text-6xl md:text-8xl font-bold font-pixel mb-8 transition-all duration-1000 ${
            isExploding
              ? "text-red-600 animate-explode"
              : "text-white"
          }`}
        >
          GAME OVER
        </h1>

        {/* Particules d'explosion */}
        {isExploding && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-red-600 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%)`,
              animation: `explode-particle ${particle.duration}s ease-out forwards`,
              '--x': `${particle.x}px`,
              '--y': `${particle.y}px`,
            }}
          />
        ))}

        <div className="mt-12">
          <Link
            href="/"
            className="inline-block rounded-lg font-pixel bg-zinc-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            RETOUR À L'ACCUEIL
          </Link>
        </div>
      </div>
    </div>
  );
}
