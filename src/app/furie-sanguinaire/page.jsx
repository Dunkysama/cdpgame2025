"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FurieSanguinairePage() {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);

  // Cartes de code avec leurs réponses (true = correct, false = erreur)
  const codeCards = [
    {
      code: "const x = 5; console.log(x);",
      isCorrect: true,
      explanation: "Code correct : déclaration et utilisation de variable valide.",
    },
    {
      code: "function test() { return x + y }",
      isCorrect: false,
      explanation: "Erreur : manque le point-virgule à la fin de la déclaration return.",
    },
    {
      code: "let arr = [1, 2, 3]; arr.push(4);",
      isCorrect: true,
      explanation: "Code correct : création d'un tableau et ajout d'un élément.",
    },
  ];

  const currentCard = codeCards[currentCardIndex];

  useEffect(() => {
    // Réinitialiser la position de la carte quand on change de carte
    setDragOffset({ x: 0, y: 0 });
    setShowResult(false);
    setResult(null);
    setAlertMessage(null);
    setAlertType(null);
  }, [currentCardIndex]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    handleSwipe();
  };

  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    handleSwipe();
  };

  const handleSwipe = () => {
    const threshold = 100; // Distance minimale pour déclencher un swipe
    const swipeDirection = dragOffset.x > threshold ? "right" : dragOffset.x < -threshold ? "left" : null;

    if (swipeDirection) {
      const userAnswer = swipeDirection === "right"; // Droite = correct
      const correctAnswer = currentCard.isCorrect;
      const isCorrect = userAnswer === correctAnswer;

      setResult(isCorrect);
      setShowResult(true);

      // Afficher une alerte personnalisée
      setAlertType(isCorrect ? "success" : "error");
      setAlertMessage(currentCard.explanation);

      if (isCorrect) {
        setScore(score + 1);
      }
    } else {
      // Retour à la position initiale si le swipe n'est pas assez fort
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleCloseAlert = () => {
    setAlertMessage(null);
    setAlertType(null);
    // Passer à la carte suivante après fermeture
    if (currentCardIndex < codeCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const getCardRotation = () => {
    return dragOffset.x / 20; // Rotation basée sur le déplacement horizontal
  };

  const getCardOpacity = () => {
    return 1 - Math.abs(dragOffset.x) / 500;
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center font-sans relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Alerte personnalisée */}
      {alertMessage && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn"
          onClick={handleCloseAlert}
        >
          <div
            className={`bg-zinc-900 border-4 rounded-lg p-6 max-w-md mx-4 transform transition-all ${
              alertType === "success"
                ? "border-green-500 shadow-lg shadow-green-500/50"
                : "border-red-500 shadow-lg shadow-red-500/50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`text-6xl mb-4 ${alertType === "success" ? "text-green-400" : "text-red-400"}`}>
                {alertType === "success" ? "✓" : "✗"}
              </div>
              <h3
                className={`text-2xl font-bold font-pixel mb-4 ${
                  alertType === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {alertType === "success" ? "CORRECT !" : "INCORRECT !"}
              </h3>
              <p className="text-sm font-pixel text-white/90 leading-relaxed">
                {alertMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl px-6 relative z-10">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-pixel text-white mb-4">
            FURIE SANGUINAIRE
          </h1>
          <div className="flex justify-center items-center gap-4">
            <div className="text-lg font-pixel text-yellow-400">
              Score: {score}/{codeCards.length}
            </div>
            <div className="text-lg font-pixel text-white">
              Carte {currentCardIndex + 1}/{codeCards.length}
            </div>
          </div>
        </div>

        {!gameCompleted ? (
          <>
            {/* Instructions */}
            <div className="mb-6 text-center">
              <p className="text-sm font-pixel text-white/80">
                Swipez <span className="text-green-400">→ Droite</span> si le code est correct
              </p>
              <p className="text-sm font-pixel text-white/80">
                Swipez <span className="text-red-400">← Gauche</span> si le code contient une erreur
              </p>
            </div>

            {/* Zone de swipe */}
            <div className="relative h-96 flex items-center justify-center">
              {/* Carte */}
              <div
                className={`absolute w-full max-w-md bg-zinc-900 border-4 border-white rounded-lg p-6 cursor-grab active:cursor-grabbing transition-all ${
                  showResult ? "pointer-events-none" : ""
                }`}
                style={{
                  transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${getCardRotation()}deg)`,
                  opacity: getCardOpacity(),
                  transition: showResult ? "all 0.5s ease-out" : "none",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
              >
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-xs font-pixel text-white/60">Code:</span>
                  </div>
                  <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-4">
                    <code className="text-sm font-mono text-white break-all">
                      {currentCard.code}
                    </code>
                  </div>
                </div>
              </div>

              {/* Indicateurs de direction */}
              {Math.abs(dragOffset.x) > 50 && !showResult && (
                <>
                  {dragOffset.x > 50 && (
                    <div className="absolute left-4 text-6xl text-green-400 font-bold opacity-50 pointer-events-none">
                      ✓
                    </div>
                  )}
                  {dragOffset.x < -50 && (
                    <div className="absolute right-4 text-6xl text-red-400 font-bold opacity-50 pointer-events-none">
                      ✗
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Écran de fin de jeu */
          <div className="text-center">
            <div className="bg-zinc-900 border-4 border-white rounded-lg p-8 mb-6">
              <h2 className="text-3xl font-bold font-pixel text-white mb-4">
                FIN DU JEU
              </h2>
              <div className="text-2xl font-pixel text-yellow-400 mb-6">
                Score Final: {score}/{codeCards.length}
              </div>
              <p className="text-sm font-pixel text-white/80">
                {score === codeCards.length
                  ? "Parfait ! Vous avez réussi toutes les cartes !"
                  : score >= codeCards.length / 2
                  ? "Bon travail ! Vous avez fait la majorité des bonnes réponses."
                  : "Continuez à vous entraîner pour améliorer votre score !"}
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
            >
              RETOUR À L'ACCUEIL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

