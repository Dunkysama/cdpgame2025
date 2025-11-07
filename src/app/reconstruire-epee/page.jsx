"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReconstruireEpeePage() {
  const router = useRouter();
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZone, setDropZone] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState({});

  // Définition des défis avec leurs segments corrects et faux
  const challenges = [
    {
      id: 1,
      instruction: "Créer une fonction qui retourne la somme de deux nombres",
      correctOrder: ["function", "calculate", "()", "{", "return", "x", "+", "y", ";", "}"],
      fakeBlocks: ["const", "let", "=", "console.log", "if", "else"],
    },
    {
      id: 2,
      instruction: "Déclarer une constante et l'afficher dans la console",
      correctOrder: ["const", "x", "=", "5", ";", "console.log", "(", "x", ")", ";"],
      fakeBlocks: ["let", "var", "function", "return", "{", "}"],
    },
    {
      id: 3,
      instruction: "Créer un tableau et ajouter un élément",
      correctOrder: ["let", "arr", "=", "[", "1", ",", "2", "]", ";", "arr", ".", "push", "(", "3", ")", ";"],
      fakeBlocks: ["const", "pop", "shift", "unshift", "function", "return"],
    },
  ];

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const currentChallenge = challenges[currentChallengeIndex];

  // Initialiser le défi au montage et quand on change de défi
  useEffect(() => {
    // Mélanger les vrais et faux blocs
    const allBlocks = [...challenges[currentChallengeIndex].correctOrder, ...challenges[currentChallengeIndex].fakeBlocks];
    const shuffled = allBlocks.sort(() => Math.random() - 0.5);
    
    // Créer des objets avec id unique pour le drag & drop
    const blocksWithId = shuffled.map((block, index) => ({
      id: `block-${currentChallengeIndex}-${index}`,
      text: block,
      isCorrect: challenges[currentChallengeIndex].correctOrder.includes(block),
    }));

    setAvailableBlocks(blocksWithId);
    setDropZone([]);
    setShowResult(false);
  }, [currentChallengeIndex]);

  const handleDragStart = (e, block) => {
    setDraggedItem(block);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnDropZone = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Vérifier si le bloc vient de la zone disponible
    const indexInAvailable = availableBlocks.findIndex((b) => b.id === draggedItem.id);
    if (indexInAvailable !== -1) {
      // Retirer le bloc de la zone disponible
      const newAvailableBlocks = availableBlocks.filter((b) => b.id !== draggedItem.id);
      setAvailableBlocks(newAvailableBlocks);

      // Ajouter le bloc à la fin de la zone de dépôt
      setDropZone([...dropZone, draggedItem]);
    } else {
      // Le bloc vient déjà de la zone de dépôt, on peut le réorganiser si nécessaire
      // Pour l'instant, on ne fait rien car le bloc est déjà dans la zone
    }

    setDraggedItem(null);
  };

  const handleDropOnDropZoneItem = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    // Vérifier si le bloc vient de la zone disponible
    const indexInAvailable = availableBlocks.findIndex((b) => b.id === draggedItem.id);
    if (indexInAvailable !== -1) {
      // Retirer le bloc de la zone disponible
      const newAvailableBlocks = availableBlocks.filter((b) => b.id !== draggedItem.id);
      setAvailableBlocks(newAvailableBlocks);

      // Insérer le bloc à la position cible
      const newDropZone = [...dropZone];
      newDropZone.splice(targetIndex, 0, draggedItem);
      setDropZone(newDropZone);
    } else {
      // Réorganiser les blocs dans la zone de dépôt
      const draggedIndex = dropZone.findIndex((b) => b.id === draggedItem.id);
      if (draggedIndex !== -1) {
        const newDropZone = [...dropZone];
        const [removed] = newDropZone.splice(draggedIndex, 1);
        newDropZone.splice(targetIndex, 0, removed);
        setDropZone(newDropZone);
      }
    }

    setDraggedItem(null);
  };

  const handleDropOnAvailable = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Si le bloc vient de la zone de dépôt, le remettre dans les disponibles
    const indexInDropZone = dropZone.findIndex((b) => b.id === draggedItem.id);
    if (indexInDropZone !== -1) {
      const newDropZone = [...dropZone];
      newDropZone.splice(indexInDropZone, 1);
      setDropZone(newDropZone);

      setAvailableBlocks([...availableBlocks, draggedItem]);
      setDraggedItem(null);
    }
  };

  const handleRemoveFromDropZone = (block) => {
    const newDropZone = dropZone.filter((b) => b.id !== block.id);
    setDropZone(newDropZone);
    setAvailableBlocks([...availableBlocks, block]);
  };

  const handleValidate = () => {
    const userOrder = dropZone.map((block) => block.text);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(currentChallenge.correctOrder);

    // Sauvegarder le résultat de ce défi
    setResults((prev) => {
      const newResults = {
        ...prev,
        [currentChallengeIndex]: {
          isCorrect,
          userOrder: [...userOrder],
          correctOrder: [...currentChallenge.correctOrder],
          instruction: currentChallenge.instruction,
        },
      };

      // Si c'est le dernier défi, afficher les résultats
      if (currentChallengeIndex === challenges.length - 1) {
        setShowResult(true);
      }

      return newResults;
    });

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      // Sauvegarder le résultat avant de passer au suivant
      const userOrder = dropZone.map((block) => block.text);
      const isCorrect = JSON.stringify(userOrder) === JSON.stringify(currentChallenge.correctOrder);

      setResults((prev) => ({
        ...prev,
        [currentChallengeIndex]: {
          isCorrect,
          userOrder: [...userOrder],
          correctOrder: [...currentChallenge.correctOrder],
          instruction: currentChallenge.instruction,
        },
      }));

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(currentChallengeIndex - 1);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    const allBlocks = [...currentChallenge.correctOrder, ...currentChallenge.fakeBlocks];
    const shuffled = allBlocks.sort(() => Math.random() - 0.5);
    
    const blocksWithId = shuffled.map((block, index) => ({
      id: `block-${currentChallengeIndex}-${index}`,
      text: block,
      isCorrect: currentChallenge.correctOrder.includes(block),
    }));

    setAvailableBlocks(blocksWithId);
    setDropZone([]);
    setShowResult(false);
  };

  const isLastChallenge = currentChallengeIndex === challenges.length - 1;
  const allChallengesCompleted = Object.keys(results).length === challenges.length;

  // Sauvegarder la progression (pour le Boss Final) quand les résultats sont affichés
  useEffect(() => {
    const completed = Object.keys(results).length === challenges.length;
    if (showResult || completed) {
      const percent = Math.round((score / challenges.length) * 100);
      
      // Sauvegarder dans la base de données
      const saveProgress = async () => {
        try {
          if (typeof window !== "undefined") {
            const savedCharacter = localStorage.getItem("selectedCharacter");
            if (savedCharacter) {
              const character = JSON.parse(savedCharacter);
              const idPersonnage = character.id;

              if (idPersonnage) {
                const response = await fetch("/api/boss-mini-progress", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    nomMiniJeu: "epee",
                    pourcentage: percent,
                    idPersonnage: idPersonnage,
                    addPenalty: percent < 75, // Ajouter une pénalité si échec
                  }),
                });

                if (!response.ok) {
                  console.error("Erreur lors de la sauvegarde de la progression epee");
                  // Fallback sur localStorage en cas d'erreur
                  localStorage.setItem("epeeProgress", String(percent));
                  if (percent < 75) {
                    const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
                    localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
                  }
                }
              } else {
                // Fallback sur localStorage si pas d'ID de personnage
                localStorage.setItem("epeeProgress", String(percent));
                if (percent < 75) {
                  const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
                  localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
                }
              }
            } else {
              // Fallback sur localStorage si pas de personnage sélectionné
              localStorage.setItem("epeeProgress", String(percent));
              if (percent < 75) {
                const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
                localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de la progression epee:", error);
          // Fallback sur localStorage en cas d'erreur
          try {
            localStorage.setItem("epeeProgress", String(percent));
            if (percent < 75) {
              const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
              localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
            }
          } catch {}
        }
      };

      saveProgress();
    }
  }, [showResult, results, score, challenges.length]);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      {/* Bouton fixe retour au Boss Final */}
      
      <div className="w-full max-w-4xl px-6 relative z-10">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-pixel text-white mb-4">
            RECONSTRUIRE L'ÉPÉE
          </h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="text-lg font-pixel text-yellow-400">
              Défi {currentChallengeIndex + 1}/{challenges.length}
            </div>
          </div>
        </div>
        

        {!showResult ? (
          <>
            {/* Instruction */}
            <div className="mb-6 bg-zinc-900 border-2 border-zinc-600 rounded-lg p-4">
              <p className="text-sm font-pixel text-white/90 leading-relaxed">
                {currentChallenge.instruction}
              </p>
            </div>

            {/* Zone de dépôt */}
            <div className="mb-6 bg-zinc-900 border-4 border-white rounded-lg p-6 min-h-[100px]">
              <div className="mb-2">
                <span className="text-xs font-pixel text-white/60">Zone de dépôt</span>
              </div>
              <div
                className="bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg p-4 flex flex-wrap items-center gap-2 min-h-[80px]"
                onDragOver={handleDragOver}
                onDrop={handleDropOnDropZone}
              >
                {dropZone.length === 0 ? (
                  <p className="text-xs font-pixel text-white/40 w-full text-center">
                    Glissez les segments ici pour reconstruire le code
                  </p>
                ) : (
                  dropZone.map((block, index) => (
                    <div
                      key={block.id}
                      className="bg-zinc-700 border-2 border-zinc-500 rounded px-3 py-2 text-sm font-mono text-white cursor-move relative group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, block)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnDropZoneItem(e, index)}
                    >
                      {block.text}
                      <button
                        onClick={() => handleRemoveFromDropZone(block)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Blocs disponibles */}
            <div className="mb-8 bg-zinc-900 border-4 border-white rounded-lg p-6">
              <div className="mb-2">
                <span className="text-xs font-pixel text-white/60">Blocs disponibles</span>
              </div>
              <div
                className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-4 flex flex-wrap items-center gap-2"
                onDragOver={handleDragOver}
                onDrop={handleDropOnAvailable}
              >
                {availableBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="bg-zinc-700 border-2 border-zinc-500 rounded px-3 py-2 text-sm font-mono text-white cursor-move hover:bg-zinc-600 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                  >
                    {block.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={handlePrevious}
                disabled={currentChallengeIndex === 0}
                className="rounded-lg font-pixel bg-zinc-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-800"
              >
                ← PRÉCÉDENT
              </button>
              {isLastChallenge ? (
                <button
                  onClick={handleValidate}
                  disabled={dropZone.length === 0}
                  className="rounded-lg font-pixel bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 border-2 border-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900"
                >
                  VALIDER
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={dropZone.length === 0}
                  className="rounded-lg font-pixel bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 border-2 border-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900"
                >
                  VALIDER ET CONTINUER →
                </button>
              )}
            </div>
          </>
        ) : (
          /* Résultats */
          <div className="mb-8 space-y-6">
            {/* Score global */}
            <div className="bg-zinc-900 border-4 border-white rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold font-pixel text-white mb-4">
                RÉSULTAT
              </h2>
              <div className="text-xl font-pixel text-yellow-400 mb-4">
                Score: {score} / {challenges.length}
              </div>
            </div>

            {/* Affichage des résultats par défi */}
            <div className="space-y-4">
              {challenges.map((challenge, index) => {
                const result = results[index];
                const isCompleted = result !== undefined;
                const isCorrect = result?.isCorrect;

                return (
                  <div key={challenge.id} className="bg-zinc-900 border-4 border-white rounded-lg p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-pixel text-white/60">Défi {challenge.id}</span>
                        {isCompleted && (
                          <span className={`text-xs font-pixel ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                            {isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
                          </span>
                        )}
                      </div>
                      <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-3 mb-3">
                        <p className="text-sm font-pixel text-white/90 leading-relaxed">
                          {challenge.instruction}
                        </p>
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="space-y-2">
                        {!isCorrect && (
                          <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-3">
                            <div className="text-sm font-pixel text-white/80 mb-1">
                              Réponse attendue :
                            </div>
                            <code className="text-sm font-mono text-green-400">
                              {challenge.correctOrder.join(" ")}
                            </code>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-3">
                        <p className="text-xs font-pixel text-white/60 text-center">
                          Défi non complété
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Boutons de fin uniquement si c'est le dernier défi */}
            {isLastChallenge && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setResults({});
                    setScore(0);
                    setCurrentChallengeIndex(0);
                    setShowResult(false);
                  }}
                  className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
                >
                  RECOMMENCER
                </button>
                <button
                  onClick={() => router.push('/boss-final')}
                  className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
                >
                  RETOUR AU BOSS FINAL
                </button>
              </div>
            )}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          {!showResult && (
            <button
              onClick={() => router.push("/")}
              className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
            >
              RETOUR
            </button>
          )}
          {showResult && (
            <button
              onClick={() => router.push("/")}
              className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
            >
              RETOUR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

