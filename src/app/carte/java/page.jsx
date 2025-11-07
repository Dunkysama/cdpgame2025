"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QuizLayout from "@/app/components/QuizLayout";
import globalPlaine from "@/asset/decor/fonds/tour_java.png";
import plateforme from "@/asset/decor/plateformes/plateforme_java.png";
import elfFemelle from "@/asset/elf_femelle.png";
import heart from "@/asset/heart.jpg";
import heartless from "@/asset/heartless.jpg";
import coin from "@/asset/coin.jpg";
import token from "@/asset/token.png";
import MarchandPage from "@/app/marchand/page.jsx";
import globalQuestionsData from "@/data/java-questions.json";


// Configuration du quiz
const QUIZ_CONFIG = {
  MAX_SCORE: 8,
};

// Configuration des effets
const MAX_LIVES = 3;
const TIMER_BONUS_SECONDS = 10;
const TIMER_MAX = 30;

export default function GlobalQuizPage() {
  const router = useRouter();
  // Charger toutes les questions depuis le JSON
  const allQuestions = useMemo(() => globalQuestionsData.questions, []);
  const bonusQuestions = useMemo(() => globalQuestionsData.bonusQuestions, []);

  // Sélectionner une question aléatoire au début
  const getRandomQuestion = () => {
    if (allQuestions.length === 0) return null;
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
  };

  // État du quiz - on garde toujours la même question actuelle jusqu'à ce qu'elle soit remplacée
  const initialQuestion = getRandomQuestion();
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(15);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);

  // Redirection Game Over quand il n'y a plus de vies
  useEffect(() => {
    if (lives <= 0) {
      router.push("/game-over");
    }
  }, [lives, router]);
  const [tokens, setTokens] = useState(1);
  const [isMerchantOpen, setIsMerchantOpen] = useState(false);
  const [hasVisitedMerchant, setHasVisitedMerchant] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set(initialQuestion ? [initialQuestion.id] : []));
  const usedQuestionIdsRef = useRef(new Set(initialQuestion ? [initialQuestion.id] : []));

  // Synchroniser le ref avec l'état
  useEffect(() => {
    usedQuestionIdsRef.current = usedQuestionIds;
  }, [usedQuestionIds]);

  // Trouver une nouvelle question aléatoire dans le JSON (non utilisée)
  const findNewRandomQuestion = useCallback((currentQuestionId, usedIds) => {
    // Trouver toutes les questions qui ne sont pas déjà utilisées
    const availableQuestions = allQuestions.filter(
      (q) => !usedIds.has(q.id) && q.id !== currentQuestionId
    );

    if (availableQuestions.length > 0) {
      const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      return randomQuestion;
    }

    // Si toutes les questions ont été utilisées, prendre n'importe quelle question différente
    const allOtherQuestions = allQuestions.filter((q) => q.id !== currentQuestionId);
    if (allOtherQuestions.length > 0) {
      const randomQuestion = allOtherQuestions[Math.floor(Math.random() * allOtherQuestions.length)];
      return randomQuestion;
    }

    return null;
  }, [allQuestions]);

  // Remplacer la question actuelle par une nouvelle du JSON
  const replaceCurrentQuestion = useCallback(() => {
    setCurrentQuestion((prevQuestion) => {
      if (!prevQuestion) return prevQuestion;
      
      // Utiliser le ref pour avoir la valeur actuelle
      const currentUsedIds = usedQuestionIdsRef.current;
      const updated = new Set([...currentUsedIds, prevQuestion.id]);
      const newQuestion = findNewRandomQuestion(prevQuestion.id, currentUsedIds);
      
      if (newQuestion) {
        updated.add(newQuestion.id);
        setUsedQuestionIds(updated);
        setTimeout(() => {
          setAnswered(false);
          setSelectedIndex(null);
        }, 0);
        return newQuestion;
      }
      
      setUsedQuestionIds(updated);
      return prevQuestion;
    });
  }, [findNewRandomQuestion]);

  useEffect(() => {
    setShowHint(false);
    setTimer(15);
  }, [currentQuestion]);

  // Initialiser l'or depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGold = localStorage.getItem("playerGold");
      if (savedGold) {
        setGold(parseInt(savedGold, 10) || 0);
      } else {
        setGold(0);
        localStorage.setItem("playerGold", "0");
      }
    }
  }, []);

  useEffect(() => {
    if (answered) return; // stop countdown after answering
    if (isMerchantOpen) return; // pause countdown while merchant modal is open
    if (score >= QUIZ_CONFIG.MAX_SCORE) return; // stop countdown if quiz is finished
    if (timer <= 0) {
      // Temps écoulé : marquer comme répondu et perdre une vie
      setAnswered(true);
      setLives((l) => Math.max(0, l - 1));
      setTimeout(() => {
        // Temps écoulé : remplacer la question par une nouvelle
        if (score < QUIZ_CONFIG.MAX_SCORE && currentQuestion) {
          replaceCurrentQuestion();
        }
      }, 1000);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, answered, isMerchantOpen, score, currentQuestion, replaceCurrentQuestion]);

  const playSuccessTone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  // Calculer si le quiz est terminé
  const isQuizFinished = score >= QUIZ_CONFIG.MAX_SCORE;

  const handleAnswer = (index) => {
    if (isMerchantOpen) return;
    if (answered) return;
    if (isQuizFinished) return; // Ne pas répondre si le quiz est terminé
    if (!currentQuestion) return; // Ne pas répondre si pas de question
    
    setSelectedIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswered(true);
    
    if (isCorrect) {
      // Bonne réponse : incrémenter le score
      setScore((s) => {
        const nextScore = Math.min(s + 1, QUIZ_CONFIG.MAX_SCORE);
        // Ouvrir le marchand à la 8e bonne réponse
        if (nextScore === QUIZ_CONFIG.MAX_SCORE && !hasVisitedMerchant) {
          setIsMerchantOpen(true);
          setHasVisitedMerchant(true);
        }
        return nextScore;
      });

      // Récompense : +10 pièces d'or par bonne réponse
      setGold((g) => {
        const updated = g + 10;
        if (typeof window !== "undefined") {
          localStorage.setItem("playerGold", String(updated));
        }
        return updated;
      });
      playSuccessTone();
      
      // Si on atteint 8 bonnes réponses, le quiz est terminé - NE PAS remplacer la question
      setTimeout(() => {
        setScore((currentScore) => {
          const finalScore = Math.min(currentScore, QUIZ_CONFIG.MAX_SCORE);
          if (finalScore >= QUIZ_CONFIG.MAX_SCORE) {
            return finalScore; // Quiz terminé, ne rien faire
          }
          // Sinon, remplacer la question par une nouvelle du JSON
          replaceCurrentQuestion();
          return finalScore;
        });
      }, 1000);
    } else {
      // Mauvaise réponse : remplacer la question actuelle par une nouvelle du JSON
      // Le score n'est PAS incrémenté
      setLives((l) => Math.max(0, l - 1));
      setTimeout(() => {
        setScore((currentScore) => {
          if (currentScore >= QUIZ_CONFIG.MAX_SCORE) {
            return currentScore; // Quiz terminé, ne rien faire
          }
          // Remplacer la question par une nouvelle du JSON
          replaceCurrentQuestion();
          return currentScore;
        });
      }, 1000);
    }
  };

  // Appliquer les effets d'achat depuis le marchand
  const applyItemEffect = (itemId) => {
    switch (itemId) {
      case "coeur":
        setLives((l) => {
          // À plein, acheter un cœur augmente la capacité ET la vie
          if (l >= maxLives) {
            setMaxLives((m) => m + 1);
            return l + 1;
          }
          return Math.min(maxLives, l + 1);
        });
        break;
      case "tokenIndice": // Potion
        setLives(maxLives);
        break;
      case "sablier":
        setTimer((t) => Math.min(TIMER_MAX, t + TIMER_BONUS_SECONDS));
        break;
      default:
        break;
    }
  };

  // Synchroniser la monnaie affichée quand le marchand la modifie
  const handleGoldChange = (newGold) => {
    setGold(newGold);
  };

  // Quand le marchand se ferme après la 8e bonne réponse, le quiz est terminé
  useEffect(() => {
    if (!isMerchantOpen && hasVisitedMerchant && score >= QUIZ_CONFIG.MAX_SCORE) {
      // Quiz terminé, ne rien faire de plus
      return;
    }
  }, [isMerchantOpen, hasVisitedMerchant, score]);

  // Consommer un token pour révéler l'indice
  const handleRevealHint = () => {
    if (answered) return; // ne pas révéler après avoir répondu
    if (showHint) return; // déjà visible
    if (tokens <= 0) return; // pas de token
    if (isQuizFinished) return; // ne pas révéler si le quiz est terminé
    setTokens((t) => Math.max(0, t - 1));
    setShowHint(true);
  };

  // Consommer un token pour remplacer la question courante par une question bonus
  const handleChangeQuestion = () => {
    if (answered) return; // éviter de changer après réponse
    if (tokens <= 0) return; // pas de token disponible
    if (!bonusQuestions.length) return; // aucune question bonus définie
    if (isQuizFinished) return; // ne pas changer si le quiz est terminé

    // Choisir une question bonus aléatoire
    const nextBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];

    // Remplacer la question actuelle
    setCurrentQuestion(nextBonus);
    setShowHint(false);
    
    // Consommer le token
    setTokens((t) => Math.max(0, t - 1));
  };

  // Plateformes ordonnées du bas (top élevé) vers le haut (top faible)
  const platforms = [
    { src: plateforme.src, top: "74%", left: "39%", width: "10%" },
    { src: plateforme.src, top: "64%", left: "58%", width: "10%" },
    { src: plateforme.src, top: "54%", left: "39%", width: "10%" },
    { src: plateforme.src, top: "43%", left: "58%", width: "10%" },
    { src: plateforme.src, top: "32%", left: "39%", width: "10%" },
    { src: plateforme.src, top: "22%", left: "58%", width: "10%" },
    { src: plateforme.src, top: "10%", left: "39%", width: "10%" },
    
  ];

  // Positions manuelles du personnage (index basé sur le score-1)
  const characterPositions = [
    { top: "81%", left: "39%" },
    { top: "71%", left: "58%" },
    { top: "61%", left: "39%" },
    { top: "50%", left: "58%" },
    { top: "39%", left: "39%" },
    { top: "29%", left: "58%" },
    { top: "17%", left: "39%" },
    { top: "34%", left: "48%" },
  ];

  // Index actuel du personnage basé sur le score
  const currentCharacterIndex = Math.max(
    -1,
    Math.min(
      score - 1,
      (Array.isArray(characterPositions) ? characterPositions.length - 1 : 0)
    )
  );

  // Ouvrir la modale du marchand quand l'elfe arrive à { top: "39%", left: "39%" }
  const merchantIndex = 4;
  useEffect(() => {
    if (currentCharacterIndex === merchantIndex && !hasVisitedMerchant) {
      setIsMerchantOpen(true);
      setHasVisitedMerchant(true);
    }
  }, [currentCharacterIndex, hasVisitedMerchant]);

  const closeMerchant = () => setIsMerchantOpen(false);

  return (
    <>
    <QuizLayout
      title="THÈME 6 – QUIZ GLOBAL (Culture Tech)"
      level={currentQuestion?.level}
      question={currentQuestion?.question || ""}
      options={currentQuestion?.options || []}
      correctIndex={currentQuestion?.correctIndex ?? 0}
      selectedIndex={selectedIndex}
      answered={answered}
      onSelect={handleAnswer}
      hint={currentQuestion?.hint || ""}
      showHint={showHint}
      onRevealHint={handleRevealHint}
      score={Math.min(score, QUIZ_CONFIG.MAX_SCORE)}
      currentIndex={0}
      total={QUIZ_CONFIG.MAX_SCORE}
      visualImageSrc={globalPlaine.src}
      visualOverlayItems={platforms}
      visualCharacterSrc={elfFemelle.src}
      visualCharacterIndex={currentCharacterIndex}
      visualCharacterWidth="5%"
      visualCharacterStartTop="100%"
      visualCharacterStartLeft="50%"
      visualCharacterPositions={characterPositions}
      lives={lives}
      maxLives={maxLives}
      coinCount={gold}
      heartFullSrc={heart.src}
      heartEmptySrc={heartless.src}
      coinSrc={coin.src}
      tokenSrc={token.src}
      tokens={tokens}
      onChangeQuestion={handleChangeQuestion}
      onNext={() => {
        // Bouton désactivé car on ne passe plus à la question suivante
        // On remplace toujours la question actuelle
        return;
      }}
      hasNext={false}
      timerSeconds={timer}
      timerTotalSeconds={15}
    />

    {isMerchantOpen && (
      <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center">
        <div className="relative w-[90%] max-w-4xl h-[55vh] overflow-auto bg-zinc-900 border-4 border-white rounded-lg p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-pixel text-white text-xl">Marchand</h2>
          </div>
          <MarchandPage onClose={closeMerchant} onApplyItem={applyItemEffect} onGoldChange={handleGoldChange} />
        </div>
      </div>
    )}
    </>
  );
}
