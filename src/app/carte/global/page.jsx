"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";
import globalPlaine from "@/asset/global__plaine.png";
import plateforme from "@/asset/plateforme.png";
import elfFemelle from "@/asset/elf_femelle.png";
import heart from "@/asset/heart.jpg";
import heartless from "@/asset/heartless.jpg";
import coin from "@/asset/coin.jpg";
import token from "@/asset/token.png";
import { recordQuizCompletion } from "@/app/utils/badges";

export default function GlobalQuizPage() {
  const initialQuestions = useMemo(
    () => [
      // Niveau Facile (3)
      {
        level: "facile",
        question: "Qui est considéré comme l'inventeur du World Wide Web (WWW) ?",
        options: ["Tim Berners-Lee", "Bill Gates", "Mark Zuckerberg", "Steve Jobs"],
        correctIndex: 0,
        hint: "Il travaillait au CERN.",
      },
      {
        level: "facile",
        question: "Quel est le moteur de recherche le plus utilisé dans le monde ?",
        options: ["Google", "Bing", "Yahoo", "DuckDuckGo"],
        correctIndex: 0,
        hint: "Son nom est devenu un verbe.",
      },
      {
        level: "facile",
        question: "Que signifie “Wi-Fi” ?",
        options: ["Wireless Fidelity", "Wireless Fiber", "Web Frequency Interface", "Wide Field Internet"],
        correctIndex: 0,
        hint: "Souvent utilisé pour se connecter sans fil.",
      },

      // Niveau Moyen (3)
      {
        level: "moyen",
        question: "Quel est le nom du premier programme informatique au monde ?",
        options: [
          "Le programme de la machine analytique d’Ada Lovelace",
          "MS-DOS",
          "Fortran",
          "Unix",
        ],
        correctIndex: 0,
        hint: "Écrit par une femme au 19e siècle.",
      },
      {
        level: "moyen",
        question: "Quelle entreprise a été fondée en premier ?",
        options: ["IBM", "Microsoft", "Apple", "Google"],
        correctIndex: 0,
        hint: "Fondée en 1911.",
      },
      {
        level: "moyen",
        question: "Quelle unité mesure la rapidité de transfert des données sur un réseau ?",
        options: ["Mbps (Megabits par seconde)", "RPM", "Hz", "KBH"],
        correctIndex: 0,
        hint: "Utilisée pour la vitesse Internet.",
      },

      // Niveau Difficile (2)
      {
        level: "difficile",
        question: "Quel était le surnom du premier réseau lié à Internet ?",
        options: ["ARPANET", "NETSPACE", "COBRANET", "WEBFIRST"],
        correctIndex: 0,
        hint: "Créé par l’armée américaine.",
      },
      {
        level: "difficile",
        question: "Quelle entreprise a popularisé le concept du \"cloud computing\" avec sa plateforme AWS ?",
        options: ["Amazon", "Microsoft", "Google", "IBM"],
        correctIndex: 0,
        hint: "À l’origine, c’était une librairie en ligne.",
      },
    ], []);

  // Questions bonus (hors des 8 déjà en place)
  const bonusQuestions = useMemo(
    () => [
      {
        level: "bonus",
        question: "Quel langage est principalement utilisé pour le style des pages web ?",
        options: ["CSS", "HTML", "Python", "C#"],
        correctIndex: 0,
        hint: "Couleurs, marges, police, positionnement…",
      },
      {
        level: "bonus",
        question: "Quelle base de données est de type NoSQL parmi ces choix ?",
        options: ["MongoDB", "MySQL", "PostgreSQL", "SQLite"],
        correctIndex: 0,
        hint: "Documents au lieu de tables",
      },
      {
        level: "bonus",
        question: "Quelle entreprise développe le navigateur Chrome ?",
        options: ["Google", "Mozilla", "Microsoft", "Apple"],
        correctIndex: 0,
        hint: "Android, Gmail, YouTube…",
      },
      {
        level: "bonus",
        question: "Que signifie ‘CPU’ ?",
        options: ["Central Processing Unit", "Core Peripheral Unit", "Computer Power Unit", "Control Program Unit"],
        correctIndex: 0,
        hint: "Le cerveau de l’ordinateur",
      },
    ], []);

  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(15);
  const [lives, setLives] = useState(3);
  const [tokens, setTokens] = useState(1);
  const [responseTimes, setResponseTimes] = useState([]); // Temps de réponse pour chaque question
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    setShowHint(false);
    setTimer(15);
  }, [currentIndex]);

  useEffect(() => {
    if (answered) return; // stop countdown after answering
    if (timer <= 0) {
      setAnswered(true);
      // Enregistrer le temps de réponse (temps écoulé = 15 secondes)
      setResponseTimes(prev => [...prev, 15]);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
          setAnswered(false);
          setSelectedIndex(null);
          setTimer(15);
        } else {
          // Quiz terminé
          setQuizCompleted(true);
        }
      }, 1000);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, answered, currentIndex]);

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

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index) => {
    if (answered) return;
    setSelectedIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswered(true);
    
    // Enregistrer le temps de réponse (temps écoulé depuis le début de la question)
    const responseTime = 15 - timer; // Temps restant depuis le début
    setResponseTimes(prev => [...prev, responseTime]);
    
    if (isCorrect) {
      setScore((s) => s + 1);
      playSuccessTone();
    } else {
      setLives((l) => Math.max(0, l - 1));
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        setSelectedIndex(null);
      } else {
        // Quiz terminé
        setQuizCompleted(true);
      }
    }, 1000);
  };

  // Enregistrer les résultats du quiz quand il est terminé
  useEffect(() => {
    if (quizCompleted) {
      // Une victoire signifie avoir terminé le quiz avec au moins une vie restante
      const isWin = lives > 0;
      recordQuizCompletion(score, questions.length, responseTimes, isWin);
      setQuizCompleted(false); // Réinitialiser pour éviter les appels multiples
    }
  }, [quizCompleted, score, questions.length, lives, responseTimes]);

  // Consommer un token pour révéler l'indice
  const handleRevealHint = () => {
    if (answered) return; // ne pas révéler après avoir répondu
    if (showHint) return; // déjà visible
    if (tokens <= 0) return; // pas de token
    setTokens((t) => Math.max(0, t - 1));
    setShowHint(true);
  };

  // Consommer un token pour remplacer la question courante par une question bonus
  const handleChangeQuestion = () => {
    if (answered) return; // éviter de changer après réponse
    if (tokens <= 0) return; // pas de token disponible
    if (!bonusQuestions.length) return; // aucune question bonus définie

    // Choisir une question bonus aléatoire
    const nextBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];

    // Remplacer la question à l'index courant
    setQuestions((qs) => {
      const copy = [...qs];
      copy[currentIndex] = nextBonus;
      return copy;
    });

    // Consommer le token
    setTokens((t) => Math.max(0, t - 1));
    setShowHint(false);
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

  return (
    <QuizLayout
      title="THÈME 6 – QUIZ GLOBAL (Culture Tech)"
      level={currentQuestion?.level}
      question={currentQuestion.question}
      options={currentQuestion.options}
      correctIndex={currentQuestion.correctIndex}
      selectedIndex={selectedIndex}
      answered={answered}
      onSelect={handleAnswer}
      hint={currentQuestion.hint}
      showHint={showHint}
      onRevealHint={handleRevealHint}
      score={score}
      currentIndex={currentIndex}
      total={questions.length}
      visualImageSrc={globalPlaine.src}
      visualOverlayItems={platforms}
      visualCharacterSrc={elfFemelle.src}
      visualCharacterIndex={Math.max(
        -1,
        Math.min(
          score - 1,
          (Array.isArray(characterPositions) ? characterPositions.length - 1 : platforms.length - 1)
        )
      )}
      visualCharacterWidth="5%"
      visualCharacterStartTop="100%"
      visualCharacterStartLeft="50%"
      visualCharacterPositions={characterPositions}
      lives={lives}
      coinCount={score}
      heartFullSrc={heart.src}
      heartEmptySrc={heartless.src}
      coinSrc={coin.src}
      tokenSrc={token.src}
      tokens={tokens}
      onChangeQuestion={handleChangeQuestion}
      onNext={() => {
        if (!answered) return;
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        setSelectedIndex(null);
        setTimer(15);
      }}
      hasNext={currentIndex < questions.length - 1}
      timerSeconds={timer}
      timerTotalSeconds={15}
    />
  );
}