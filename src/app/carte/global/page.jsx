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
import MarchandPage from "@/app/marchand/page.jsx";

export default function GlobalQuizPage() {
  const initialQuestions = useMemo(
    () => [
      // 🔹 Niveau Facile (5 questions)
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
        question: "Que signifie \"Wi-Fi\" ?",
        options: ["Wireless Fidelity", "Wireless Fiber", "Web Frequency Interface", "Wide Field Internet"],
        correctIndex: 0,
        hint: "Souvent utilisé pour se connecter sans fil.",
      },
      {
        level: "facile",
        question: "Quel langage a été conçu pour rendre les pages web interactives ?",
        options: ["JavaScript", "HTML", "SQL", "C++"],
        correctIndex: 0,
        hint: "Abrégé par \"JS\".",
      },
      {
        level: "facile",
        question: "Quel est le système d’exploitation mobile de Google ?",
        options: ["Android", "iOS", "Windows Mobile", "HarmonyOS"],
        correctIndex: 0,
        hint: "Son symbole est un petit robot vert.",
      },

      // 🔹 Niveau Moyen (5 questions)
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
      {
        level: "moyen",
        question: "Quel est le nom du robot automatique envoyé sur Mars par la NASA en 2021 ?",
        options: ["Perseverance", "Curiosity", "Spirit", "Opportunity"],
        correctIndex: 0,
        hint: "Son nom évoque la ténacité.",
      },
      {
        level: "moyen",
        question: "Quel protocole est utilisé pour sécuriser les échanges sur un site web ?",
        options: ["HTTPS", "FTP", "SMTP", "TCP"],
        correctIndex: 0,
        hint: "Représenté par un cadenas dans le navigateur.",
      },

      // 🔹 Niveau Difficile (5 questions)
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
      {
        level: "difficile",
        question: "Quelle est la première cryptomonnaie apparue en 2009 ?",
        options: ["Bitcoin", "Ethereum", "Litecoin", "Monero"],
        correctIndex: 0,
        hint: "Créée par Satoshi Nakamoto.",
      },
      {
        level: "difficile",
        question: "Quel fondateur de PayPal est aussi à l’origine de SpaceX ?",
        options: ["Elon Musk", "Jeff Bezos", "Jack Dorsey", "Larry Page"],
        correctIndex: 0,
        hint: "Il dirige également Tesla.",
      },
      {
        level: "difficile",
        question: "Quelle est la méthode de chiffrement utilisée par HTTPS ?",
        options: ["TLS (Transport Layer Security)", "MD5", "SHA-1", "DES"],
        correctIndex: 0,
        hint: "Son nom contient \"Transport\" et \"Security\".",
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
  const [isMerchantOpen, setIsMerchantOpen] = useState(false);
  const [hasVisitedMerchant, setHasVisitedMerchant] = useState(false);

  useEffect(() => {
    setShowHint(false);
    setTimer(15);
  }, [currentIndex]);

  useEffect(() => {
    if (answered) return; // stop countdown after answering
    if (isMerchantOpen) return; // pause countdown while merchant modal is open
    if (timer <= 0) {
      setAnswered(true);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
          setAnswered(false);
          setSelectedIndex(null);
          setTimer(15);
        }
      }, 1000);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, answered, currentIndex, isMerchantOpen]);

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
    if (isMerchantOpen) return;
    if (answered) return;
    setSelectedIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswered(true);
    if (isCorrect) {
      // Incrémenter le score et ouvrir le marchand à la 8e bonne réponse
      setScore((s) => {
        const nextScore = s + 1;
        if (nextScore === 8 && !hasVisitedMerchant) {
          setIsMerchantOpen(true);
          setHasVisitedMerchant(true);
        }
        return nextScore;
      });
      playSuccessTone();
    } else {
      setLives((l) => Math.max(0, l - 1));
    }
    setTimeout(() => {
      // Ne pas avancer la question si le marchand est ouvert
      if (isMerchantOpen) return;
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        setSelectedIndex(null);
      }
    }, 1000);
  };

  // Reprendre le quiz quand le marchand se ferme après la 8e bonne réponse
  useEffect(() => {
    if (!isMerchantOpen && hasVisitedMerchant && answered) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        setSelectedIndex(null);
        setTimer(15);
      }
    }
  }, [isMerchantOpen]);

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
      visualCharacterIndex={currentCharacterIndex}
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

    {isMerchantOpen && (
      <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center">
        <div className="relative w-[90%] max-w-4xl h-[55vh] overflow-auto bg-zinc-900 border-4 border-white rounded-lg p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-pixel text-white text-xl">Marchand</h2>
          </div>
          <MarchandPage onClose={closeMerchant} />
        </div>
      </div>
    )}
    </>
  );
}