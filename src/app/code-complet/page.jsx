"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CodeCompletPage() {
  const router = useRouter();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Définition des 3 blocs de code avec leurs trous et options
  const codeBlocks = [
    {
      id: 1,
      explanation: "Déclarez une variable 'x' avec la valeur 5, puis affichez-la dans la console.",
      code: [
        { text: "const", type: "text" },
        { id: "1-1", type: "dropdown", options: ["x", "y", "z", "variable"], correct: "x" },
        { text: "=", type: "text" },
        { id: "1-2", type: "dropdown", options: ["5", "10", "15", "20"], correct: "5" },
        { text: ";", type: "text" },
        { text: "console.log(", type: "text" },
        { id: "1-3", type: "dropdown", options: ["x", "y", "z", "variable"], correct: "x" },
        { text: ");", type: "text" },
      ],
    },
    {
      id: 2,
      explanation: "Créez une fonction nommée 'calculate' qui retourne la somme de x et y.",
      code: [
        { text: "function", type: "text" },
        { id: "2-1", type: "dropdown", options: ["calculate", "compute", "process", "execute"], correct: "calculate" },
        { text: "() {", type: "text" },
        { text: "  return", type: "text" },
        { id: "2-2", type: "dropdown", options: ["x + y", "x - y", "x * y", "x / y"], correct: "x + y" },
        { text: ";", type: "text" },
        { text: "}", type: "text" },
      ],
    },
    {
      id: 3,
      explanation: "Créez un tableau 'arr' contenant [1, 2, 3], puis ajoutez l'élément 4 à la fin.",
      code: [
        { text: "let", type: "text" },
        { id: "3-1", type: "dropdown", options: ["arr", "array", "list", "items"], correct: "arr" },
        { text: "=", type: "text" },
        { text: "[", type: "text" },
        { id: "3-2", type: "dropdown", options: ["1, 2, 3", "1, 2", "1", "2, 3"], correct: "1, 2, 3" },
        { text: "];", type: "text" },
        { text: "arr.", type: "text" },
        { id: "3-3", type: "dropdown", options: ["push", "pop", "shift", "unshift"], correct: "push" },
        { text: "(4);", type: "text" },
      ],
    },
  ];

  const currentBlock = codeBlocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex === codeBlocks.length - 1;

  const handleSelectChange = (blockId, dropdownId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [dropdownId]: value,
    }));
  };

  const handleNext = () => {
    if (currentBlockIndex < codeBlocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  const handleValidate = () => {
    let correctCount = 0;
    let totalDropdowns = 0;

    codeBlocks.forEach((block) => {
      block.code.forEach((item) => {
        if (item.type === "dropdown") {
          totalDropdowns++;
          if (answers[item.id] === item.correct) {
            correctCount++;
          }
        }
      });
    });

    setScore(correctCount);
    setShowResult(true);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setScore(0);
    setCurrentBlockIndex(0);
  };

  // Sauvegarder la progression (pour le Boss Final) quand les résultats sont affichés
  useEffect(() => {
    if (showResult) {
      const totalDropdowns = codeBlocks.reduce(
        (total, block) => total + block.code.filter((item) => item.type === "dropdown").length,
        0
      );
      const percent = Math.round((score / totalDropdowns) * 100);
      
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
                    nomMiniJeu: "sort",
                    pourcentage: percent,
                    idPersonnage: idPersonnage,
                    addPenalty: percent < 75, // Ajouter une pénalité si échec
                  }),
                });

                if (!response.ok) {
                  console.error("Erreur lors de la sauvegarde de la progression sort");
                  // Fallback sur localStorage en cas d'erreur
                  localStorage.setItem("sortProgress", String(percent));
                  if (percent < 75) {
                    const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
                    localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
                  }
                }
              } else {
                // Fallback sur localStorage si pas d'ID de personnage
                localStorage.setItem("sortProgress", String(percent));
                if (percent < 75) {
                  const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
                  localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
                }
              }
            } else {
              // Fallback sur localStorage si pas de personnage sélectionné
              localStorage.setItem("sortProgress", String(percent));
              if (percent < 75) {
                const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
                localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de la progression sort:", error);
          // Fallback sur localStorage en cas d'erreur
          try {
            localStorage.setItem("sortProgress", String(percent));
            if (percent < 75) {
              const currentPenalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
              localStorage.setItem("bossLivesPenalty", String(currentPenalty + 1));
            }
          } catch {}
        }
      };

      saveProgress();
    }
  }, [showResult, score, codeBlocks]);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      {/* Bouton fixe retiré pour n'afficher le retour qu'en fin de jeu */}
      <div className="w-full max-w-4xl px-6 relative z-10">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-pixel text-white mb-4">
            CODE COMPLET
          </h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="text-lg font-pixel text-yellow-400">
              Bloc {currentBlockIndex + 1}/{codeBlocks.length}
            </div>
          </div>
        </div>

        

        {!showResult ? (
          <>
            {/* Explication du bloc actuel */}
            <div className="mb-6 bg-zinc-900 border-2 border-zinc-600 rounded-lg p-4">
              <p className="text-sm font-pixel text-white/90 leading-relaxed">
                {currentBlock.explanation}
              </p>
            </div>

            {/* Bloc de code actuel */}
            <div className="mb-8 bg-zinc-900 border-4 border-white rounded-lg p-6">
              <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-4 flex flex-wrap items-center gap-2">
                {currentBlock.code.map((item, index) => {
                  if (item.type === "text") {
                    return (
                      <span key={index} className="text-sm font-mono text-white">
                        {item.text}
                      </span>
                    );
                  } else if (item.type === "dropdown") {
                    return (
                      <select
                        key={item.id}
                        value={answers[item.id] || ""}
                        onChange={(e) => handleSelectChange(currentBlock.id, item.id, e.target.value)}
                        className="text-sm font-mono px-3 py-2 rounded border-2 bg-zinc-900 border-zinc-600 text-white hover:border-zinc-500 cursor-pointer transition-all"
                      >
                        <option value="">---</option>
                        {item.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={handlePrevious}
                disabled={currentBlockIndex === 0}
                className="rounded-lg font-pixel bg-zinc-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-800"
              >
                ← PRÉCÉDENT
              </button>
              {isLastBlock ? (
                <button
                  onClick={handleValidate}
                  className="rounded-lg font-pixel bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 border-2 border-transparent hover:border-white"
                >
                  VALIDER
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="rounded-lg font-pixel bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 border-2 border-transparent hover:border-white"
                >
                  SUIVANT →
                </button>
              )}
            </div>
          </>
        ) : (
          /* Résultats */
          <div className="mb-8 bg-zinc-900 border-4 border-white rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold font-pixel text-white mb-4">
              RÉSULTAT
            </h2>
            <div className="text-xl font-pixel text-yellow-400 mb-4">
              Score: {score} / {codeBlocks.reduce((total, block) => total + block.code.filter((item) => item.type === "dropdown").length, 0)}
            </div>
            <p className="text-sm font-pixel text-white/80 mb-6">
              {score === codeBlocks.reduce((total, block) => total + block.code.filter((item) => item.type === "dropdown").length, 0)
                ? "Parfait ! Toutes les réponses sont correctes !"
                : score >= codeBlocks.reduce((total, block) => total + block.code.filter((item) => item.type === "dropdown").length, 0) / 2
                ? "Bon travail ! Vous avez fait la majorité des bonnes réponses."
                : "Continuez à vous entraîner pour améliorer votre score !"}
            </p>
            
            {/* Affichage des résultats par bloc */}
            <div className="space-y-4 mt-6">
              {codeBlocks.map((block) => {
                const blockDropdowns = block.code.filter((item) => item.type === "dropdown");
                const blockCorrectAnswers = blockDropdowns.filter((item) => answers[item.id] === item.correct).length;
                const blockTotal = blockDropdowns.length;
                const isBlockCorrect = blockCorrectAnswers === blockTotal;

                return (
                  <div key={block.id} className="bg-zinc-900 border-4 border-white rounded-lg p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-pixel text-white/60">Bloc {block.id}</span>
                        <span className={`text-xs font-pixel ${isBlockCorrect ? "text-green-400" : "text-red-400"}`}>
                          {blockCorrectAnswers}/{blockTotal} correct{blockCorrectAnswers > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-3 mb-3">
                        <p className="text-sm font-pixel text-white/90 leading-relaxed">
                          {block.explanation}
                        </p>
                      </div>
                    </div>
                    <div className="bg-zinc-800 border-2 border-zinc-600 rounded-lg p-4 flex flex-wrap items-center gap-2">
                      {block.code.map((item, index) => {
                        if (item.type === "text") {
                          return (
                            <span key={index} className="text-sm font-mono text-white">
                              {item.text}
                            </span>
                          );
                        } else if (item.type === "dropdown") {
                          const isCorrect = answers[item.id] === item.correct;
                          const isIncorrect = answers[item.id] !== item.correct && answers[item.id];
                          
                          return (
                            <select
                              key={item.id}
                              value={answers[item.id] || ""}
                              disabled
                              className={`text-sm font-mono px-3 py-2 rounded border-2 bg-zinc-900 transition-all ${
                                isCorrect
                                  ? "border-green-500 text-green-400 bg-green-900/20"
                                  : isIncorrect
                                  ? "border-red-500 text-red-400 bg-red-900/20"
                                  : "border-zinc-600 text-white"
                              }`}
                            >
                              <option value="">---</option>
                              {item.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => router.push('/boss-final')}
                className="rounded-lg font-pixel bg-zinc-800 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
              >
                RETOUR AU BOSS FINAL
              </button>
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          {showResult ? (
            <button
              onClick={handleReset}
              className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
            >
              RECOMMENCER
            </button>
          ) : null}
          <button
            onClick={() => router.push("/")}
            className="rounded-lg font-pixel bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white"
          >
            RETOUR
          </button>
        </div>
      </div>
    </div>
  );
}

