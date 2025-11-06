"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BossQuizLayout from "./quizLayout";
import wall from "@/asset/wall.jpg";
// Le sprite du personnage sera chargé dynamiquement depuis localStorage
import monstre from "@/asset/Global_monstre.png";
import heart from "@/asset/heart.jpg";
import heartless from "@/asset/heartless.jpg";
import globalQuestionsData from "@/data/global-questions.json";
import mageMessagesData from "@/data/mage-messages.json";

// Configuration spécifique au Boss Final
const BOSS_CONFIG = {
  MAX_SCORE: 8,
  TIMER_START: 15,
  TIMER_MAX: 30,
  TIMER_BONUS_SECONDS: 10,
  MAX_LIVES: 3,
};

export default function BossFinalPage() {
  const router = useRouter();

  // Fonction pour normaliser le sexe depuis la BD vers le format attendu
  const normalizeSexe = (sexe) => {
    if (!sexe) return 'male';
    const s = sexe.toString().toLowerCase();
    // Gérer les formats de la BD : 'Femme' -> 'femelle', 'Homme' -> 'male'
    if (s === 'femme' || s === 'femelle') return 'femelle';
    if (s === 'homme' || s === 'male') return 'male';
    return s; // Fallback si format inconnu
  };

  // Fonction pour normaliser la race depuis la BD vers le format attendu
  const normalizeRace = (race) => {
    if (!race) return 'humain';
    const r = race.toString().toLowerCase();
    // Gérer les formats de la BD : 'Elfe' -> 'elfe', 'Nain' -> 'nain', 'Humain' -> 'humain'
    if (r === 'elfe') return 'elfe';
    if (r === 'nain') return 'nain';
    if (r === 'humain') return 'humain';
    return r; // Fallback si format inconnu
  };

  // Fonction pour construire le chemin de l'avatar à partir de race et sexe
  const getAvatarImagePath = (race = 'humain', sexe = 'male', imagePath = null) => {
    // Si imagePath est fourni et valide, l'utiliser directement
    if (imagePath && typeof imagePath === 'string' && imagePath.trim() !== '') {
      return imagePath;
    }
    // Normaliser race et sexe (gère les formats de la BD et du code)
    const raceNormalized = normalizeRace(race);
    const sexeNormalized = normalizeSexe(sexe);
    // Capitaliser la première lettre pour le chemin de fichier
    const raceCapitalized = raceNormalized.charAt(0).toUpperCase() + raceNormalized.slice(1);
    const sexeCapitalized = sexeNormalized.charAt(0).toUpperCase() + sexeNormalized.slice(1);
    return `/asset/${raceCapitalized}-${sexeCapitalized}.png`;
  };

  // Charger le sprite du personnage sélectionné depuis localStorage
  const [characterSprite, setCharacterSprite] = useState(() => {
    // Valeur initiale : toujours utiliser humain male par défaut
    // Le useEffect se chargera de charger depuis localStorage si disponible
    return '/asset/Humain-male.png';
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCharacter = localStorage.getItem("selectedCharacter");
      if (savedCharacter) {
        try {
          const character = JSON.parse(savedCharacter);
          
          // Vérifier que le personnage a les données nécessaires
          if (character && (character.race || character.sexe || character.imagePath)) {
            // Utiliser le chemin d'image du personnage si disponible, sinon construire depuis race/sexe
            const spritePath = getAvatarImagePath(character.race, character.sexe, character.imagePath);
            setCharacterSprite(spritePath);
          } else {
            // Données invalides, utiliser le défaut
            setCharacterSprite('/asset/Humain-male.png');
          }
        } catch (e) {
          console.error("Erreur lors du chargement du personnage:", e);
          // En cas d'erreur, utiliser le sprite par défaut
          setCharacterSprite('/asset/Humain-male.png');
        }
      } else {
        // Si aucun personnage n'est sélectionné, utiliser le défaut
        setCharacterSprite('/asset/Humain-male.png');
      }
    }
  }, []);

  // Charger les questions
  const allQuestions = useMemo(() => globalQuestionsData.questions, []);
  const bonusQuestions = useMemo(() => globalQuestionsData.bonusQuestions, []);

  // Sélection déterministe pour éviter les erreurs d’hydratation
  const initialQuestion = allQuestions.length ? allQuestions[0] : null;
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(BOSS_CONFIG.TIMER_START);
  const [lives, setLives] = useState(BOSS_CONFIG.MAX_LIVES);
  const [maxLives, setMaxLives] = useState(BOSS_CONFIG.MAX_LIVES);
  const [tokens, setTokens] = useState(1);
  const [mageMessage, setMageMessage] = useState(mageMessagesData.welcome[0]);
  const [showMageMessage, setShowMageMessage] = useState(true);

  // Progression des mini-jeux (persistée côté client)
  const [miniProgress, setMiniProgress] = useState({ furie: 0, sort: 0, epee: 0 });

  useEffect(() => {
    try {
      const furie = parseInt(localStorage.getItem("furieProgress") || "0", 10);
      const sort = parseInt(localStorage.getItem("sortProgress") || "0", 10);
      const epee = parseInt(localStorage.getItem("epeeProgress") || "0", 10);
      setMiniProgress({ furie, sort, epee });
    } catch {}
  }, []);

  // Appliquer les pénalités de vies accumulées via les mini-jeux
  useEffect(() => {
    try {
      const penalty = parseInt(localStorage.getItem("bossLivesPenalty") || "0", 10);
      const startingLives = Math.max(0, BOSS_CONFIG.MAX_LIVES - Math.max(0, penalty));
      setLives(startingLives);
      setMaxLives(BOSS_CONFIG.MAX_LIVES);
    } catch {}
  }, []);

  const usedQuestionIds = useRef(new Set(initialQuestion ? [initialQuestion.id] : []));
  const lowTimerMessageShownRef = useRef(false);
  const hasAnsweredFirstQuestionRef = useRef(false);

  // Messages aléatoires du mage
  const getRandomMageMessage = useCallback((category) => {
    const messages = mageMessagesData[category];
    if (!messages || messages.length === 0) return "";
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  // Trouver une nouvelle question aléatoire non utilisée
  const findNewRandomQuestion = useCallback((currentQuestionId) => {
    const availableQuestions = allQuestions.filter(
      (q) => !usedQuestionIds.current.has(q.id) && q.id !== currentQuestionId
    );

    const pool = availableQuestions.length > 0
      ? availableQuestions
      : allQuestions.filter((q) => q.id !== currentQuestionId);

    if (pool.length > 0) {
      const next = pool[Math.floor(Math.random() * pool.length)];
      return next;
    }
    return null;
  }, [allQuestions]);

  // Effets: Game Over
  useEffect(() => {
    if (lives <= 0) {
      router.push("/game-over");
    }
  }, [lives, router]);

  // Effet: message de victoire quand terminé
  useEffect(() => {
    if (score >= BOSS_CONFIG.MAX_SCORE) {
      setMageMessage(getRandomMageMessage("victory"));
      setShowMageMessage(true);
    }
  }, [score, getRandomMageMessage]);

  // Effet: mise à jour du message d’accueil / timer bas
  useEffect(() => {
    if (!answered && currentQuestion && score < BOSS_CONFIG.MAX_SCORE) {
      if (!hasAnsweredFirstQuestionRef.current) {
        setMageMessage(getRandomMageMessage("welcome"));
        setShowMageMessage(true);
      }
    }
  }, [currentQuestion?.id, answered, score, getRandomMageMessage]);

  // Effet: minuterie
  useEffect(() => {
    if (answered) return;
    if (score >= BOSS_CONFIG.MAX_SCORE) return;
    if (timer <= 0) {
      return;
    }

    if (timer <= 5 && timer > 0 && !answered && score < BOSS_CONFIG.MAX_SCORE) {
      if (timer === 5 && !lowTimerMessageShownRef.current) {
        setMageMessage(getRandomMageMessage("lowTimer"));
        setShowMageMessage(true);
        lowTimerMessageShownRef.current = true;
      }
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, answered, score, currentQuestion, findNewRandomQuestion, getRandomMageMessage]);

  const handleAnswer = (index) => {
    if (answered) return;
    if (score >= BOSS_CONFIG.MAX_SCORE) return;
    if (!currentQuestion) return;

    setSelectedIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswered(true);

    if (!hasAnsweredFirstQuestionRef.current) {
      hasAnsweredFirstQuestionRef.current = true;
    }

    if (isCorrect) {
      setMageMessage(getRandomMageMessage("correct"));
      setShowMageMessage(true);

      setScore((s) => Math.min(s + 1, BOSS_CONFIG.MAX_SCORE));
      setGold((g) => g + 10);

      setTimeout(() => {
        setScore((s) => {
          if (s >= BOSS_CONFIG.MAX_SCORE) return s;
          const nextQ = currentQuestion ? findNewRandomQuestion(currentQuestion.id) : null;
          if (nextQ) {
            usedQuestionIds.current.add(nextQ.id);
            setCurrentQuestion(nextQ);
            setAnswered(false);
            setSelectedIndex(null);
            setShowHint(false);
            setTimer(BOSS_CONFIG.TIMER_START);
            lowTimerMessageShownRef.current = false;
          }
          return s;
        });
      }, 1000);
    } else {
      setMageMessage(getRandomMageMessage("incorrect"));
      setShowMageMessage(true);
      setLives((l) => Math.max(0, l - 1));

      setTimeout(() => {
        if (score < BOSS_CONFIG.MAX_SCORE) {
          const nextQ = currentQuestion ? findNewRandomQuestion(currentQuestion.id) : null;
          if (nextQ) {
            usedQuestionIds.current.add(nextQ.id);
            setCurrentQuestion(nextQ);
            setAnswered(false);
            setSelectedIndex(null);
            setShowHint(false);
            setTimer(BOSS_CONFIG.TIMER_START);
            lowTimerMessageShownRef.current = false;
          }
        }
      }, 1000);
    }
  };

  const handleRevealHint = () => {
    if (answered || showHint || tokens <= 0 || score >= BOSS_CONFIG.MAX_SCORE) return;
    setTokens((t) => Math.max(0, t - 1));
    setShowHint(true);
  };

  const handleChangeQuestion = () => {
    if (answered || tokens <= 0 || !bonusQuestions.length || score >= BOSS_CONFIG.MAX_SCORE) return;
    const nextBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
    setCurrentQuestion(nextBonus);
    setShowHint(false);
    setTokens((t) => Math.max(0, t - 1));
  };

  // Déterminer succès et cœurs du boss
  const furieSucceeded = miniProgress.furie >= 75;
  const sortSucceeded = miniProgress.sort >= 75;
  const epeeSucceeded = miniProgress.epee >= 75;
  const heartsRemoved = [furieSucceeded, sortSucceeded, epeeSucceeded].filter(Boolean).length;
  const bossHeartsCount = Math.max(0, 3 - heartsRemoved);

  // Redirection vers la victoire si le boss n'a plus de cœurs
  useEffect(() => {
    if (bossHeartsCount === 0) {
      router.push("/victoire");
    }
  }, [bossHeartsCount, router]);

  // Construire les overlays dynamiquement (personnage sélectionné, boss, cœurs du boss)
  const overlayItems = [
    { src: characterSprite, top: "85%", left: "15%", width: "8%" },
    { src: monstre.src, top: "50%", left: "75%", width: "50%" },
    ...Array.from({ length: bossHeartsCount }).map((_, idx) => ({
      src: heart.src,
      top: "7%",
      left: ["72.6%", "75%", "77.4%"][idx],
      width: "40px",
    })),
  ];

  // Styles des boutons
  const baseBtn = "rounded-2xl border-2 font-pixel text-sm md:text-base px-4 py-4";
  const furieClass = furieSucceeded
    ? `${baseBtn} bg-green-600 border-green-600 text-white`
    : `${baseBtn} bg-black hover:bg-zinc-900 text-white border-white`;
  const sortClass = sortSucceeded
    ? `${baseBtn} bg-green-600 border-green-600 text-white`
    : `${baseBtn} bg-black hover:bg-zinc-900 text-white border-white`;
  const epeeClass = epeeSucceeded
    ? `${baseBtn} bg-green-600 border-green-600 text-white`
    : `${baseBtn} bg-black hover:bg-zinc-900 text-white border-white`;

  return (
    <>
      <BossQuizLayout
        title="BOSS FINAL – Défi Ultime"
        level={currentQuestion?.level}
        question={"Vaillant aventurier, pour vaincre le maître des lieux, tu devras triompher des trois épreuves : Furie, Boule de Feu et Épée Légendaire. Chacune exige au moins 75 % de réussite pour  affaiblir le Boss et triomphé dans cet ultime combat."}
        questionTitle="Objectif"
        options={currentQuestion?.options || []}
        correctIndex={currentQuestion?.correctIndex ?? 0}
        selectedIndex={selectedIndex}
        answered={answered}
        onSelect={handleAnswer}
        hint={currentQuestion?.hint || ""}
        showHint={showHint}
        onRevealHint={handleRevealHint}
        onChangeQuestion={handleChangeQuestion}
        score={Math.min(score, BOSS_CONFIG.MAX_SCORE)}
        currentIndex={0}
        total={BOSS_CONFIG.MAX_SCORE}
        onNext={() => {}}
        hasNext={false}
        timerSeconds={timer}
        timerTotalSeconds={BOSS_CONFIG.TIMER_START}
        visualImageSrc={wall.src}
        visualImageFit="cover"
        visualOverlayItems={overlayItems}
        visualCharacterSrc={undefined}
        visualCharacterIndex={-1}
        visualCharacterPositions={[]}
        lives={lives}
        maxLives={maxLives}
        heartFullSrc={heart.src}
        heartEmptySrc={heartless.src}
        showOptions={false}
        customOptionsContent={(
          <div className="grid grid-cols-3 gap-3 text-center">
            <Link
              href="/furie-sanguinaire"
              className={furieClass}
            >
              FURIE SANGUINAIRE
            </Link>
            <Link
              href="/code-complet"
              className={sortClass}
            >
              BOULE DE FEU
            </Link>
            <Link
              href="/reconstruire-epee"
              className={epeeClass}
            >
              ÉPÉE LÉGENDAIRE
            </Link>
          </div>
        )}
        customOptionsTopMarginClass="mt-10"
        showHintButton={false}
        showChangeButton={false}
        showScore={false}
        showTimer={false}
      />

    </>
  );
}