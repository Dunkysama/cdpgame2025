"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isBadgeUnlocked, BADGES } from "@/app/utils/badges";

export default function VictoryPage() {
  const [confettis, setConfettis] = useState([]);
  const [showSansFaute, setShowSansFaute] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showRapide, setShowRapide] = useState(false);
  const [animateRapideIn, setAnimateRapideIn] = useState(false);

  useEffect(() => {
    // Fin de run du Boss: autoriser une nouvelle tentative ultérieure
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("bossRunActive");
      }
    } catch {}

    // Créer des confettis avec différentes formes et couleurs
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088'];
    const newConfettis = [];

    for (let i = 0; i < 150; i++) {
      const shapes = ['square', 'circle', 'rectangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      newConfettis.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        shape: shape,
        rotation: Math.random() * 360,
      });
    }

    setConfettis(newConfettis);

    // Lire l’indicateur de victoire parfaite (sans perte de vie) et l'état du badge Rapide
    try {
      if (typeof window !== "undefined") {
        // 1) Via query param pour fiabilité
        const params = new URLSearchParams(window.location.search);
        const qp = params.get('sansfaute');
        let sansFauteOn = false;
        if (qp === '1') {
          sansFauteOn = true;
        } else if (qp === '0') {
          sansFauteOn = false;
        } else {
          // 2) Fallback via localStorage
          const flag = localStorage.getItem('lastWinSansFaute');
          sansFauteOn = flag === 'true';
          localStorage.removeItem('lastWinSansFaute');
        }

        setShowSansFaute(sansFauteOn);
        setAnimateIn(sansFauteOn);

        // Afficher le badge Rapide si débloqué et si Sans-faute n'est pas affiché
        const rapideUnlocked = isBadgeUnlocked(BADGES.RAPIDE.id);
        const showRapideNow = !sansFauteOn && !!rapideUnlocked;
        setShowRapide(showRapideNow);
        setAnimateRapideIn(showRapideNow);
      }
    } catch {}
  }, []);

  // Masquer le badge après 8 secondes
  useEffect(() => {
    if (showSansFaute) {
      const id = setTimeout(() => setShowSansFaute(false), 8000);
      return () => clearTimeout(id);
    }
  }, [showSansFaute]);

  // Synchroniser l'animation avec l'affichage du badge
  useEffect(() => {
    if (showSansFaute) {
      setAnimateIn(true);
    } else {
      setAnimateIn(false);
    }
  }, [showSansFaute]);

  // Synchroniser l'animation du badge Rapide
  useEffect(() => {
    if (showRapide) {
      setAnimateRapideIn(true);
    } else {
      setAnimateRapideIn(false);
    }
  }, [showRapide]);

  const getShapeClass = (shape) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full w-3 h-3';
      case 'rectangle':
        return 'w-2 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative overflow-hidden">
      {/* Confettis */}
      {confettis.map((confetti) => (
        <div
          key={confetti.id}
          className={`absolute ${getShapeClass(confetti.shape)}`}
          style={{
            backgroundColor: confetti.color,
            left: `${confetti.left}%`,
            top: '-20px',
            animation: `fall ${confetti.duration}s linear ${confetti.delay}s forwards`,
            transform: `rotate(${confetti.rotation}deg)`,
          }}
        />
      ))}

      <div className="w-[80%] px-6 relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-bold font-pixel text-yellow-400 mb-8 animate-bounce">
          VOUS AVEZ GAGNÉ !
        </h1>

        <div className="mt-12">
          <Link
            href="/carte"
            className="inline-block rounded-lg font-pixel bg-zinc-900 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            RETOUR À LA CARTE
          </Link>
        </div>

        {/* Badge Sans-faute sous le bouton Retour à la carte */}
        {showSansFaute && (
          <div className="fixed top-0 right-0 z-50">
            <div
              className={`bg-zinc-800 border-2 border-zinc-600 rounded-none px-2 py-2 shadow-md flex items-center gap-2 transform transition-all duration-700 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            >
              <img
                src="/asset/Sans-faute.png"
                alt="Sans faute"
                className="w-14 h-14 md:w-16 md:h-16 border-2 border-white rounded-full bg-zinc-900 shadow"
              />
              <div className="flex flex-col">
                <p className="text-xs md:text-sm font-pixel text-white leading-tight">
                  Succès: Sans faute !
                </p>
                <p className="text-[10px] md:text-xs font-pixel text-white/80 leading-tight">
                  Victoire parfaite: vaincre le Boss global sans perdre de vie.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge Rapide au même emplacement */}
        {showRapide && (
          <div className="fixed top-0 right-0 z-50">
            <div
              className={`bg-zinc-800 border-2 border-zinc-600 rounded-none px-2 py-2 shadow-md flex items-center gap-2 transform transition-all duration-700 ${animateRapideIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            >
              <img
                src="/asset/Rapide.png"
                alt="Rapide"
                className="w-14 h-14 md:w-16 md:h-16 border-2 border-white rounded-full bg-zinc-900 shadow"
              />
              <div className="flex flex-col">
                <p className="text-xs md:text-sm font-pixel text-white leading-tight">
                  Succès: Rapide !
                </p>
                <p className="text-[10px] md:text-xs font-pixel text-white/80 leading-tight">
                  Global: répondre à chaque question en moins de 5 secondes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
