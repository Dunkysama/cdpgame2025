"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VictoryPage() {
  const [confettis, setConfettis] = useState([]);

  useEffect(() => {
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
  }, []);

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
      </div>
    </div>
  );
}
