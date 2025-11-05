"use client";

import Image from "next/image";
import carteImage from "@/asset/carte.jpg";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function PageCarte() {
  const searchParams = useSearchParams();
  const zone = searchParams.get("zone");
  const isPhpQuiz = zone === "php";

  // Questions du quiz PHP (15 questions : 5 faciles, 5 moyennes, 5 difficiles)
  const phpQuestions = useMemo(() => ([
    // Facile
    {
      level: "facile",
      question: "PHP est principalement utilisé pour :",
      options: [
        "Générer des pages web dynamiques",
        "Créer des images vectorielles",
        "Compiler des programmes en C",
        "Gérer une base de données sans serveur",
      ],
      correctIndex: 0,
      hint: "Il est surtout côté serveur et interprété.",
    },
    {
      level: "facile",
      question: "Quelle est l’extension habituelle d’un fichier PHP ?",
      options: [".php", ".ph", ".htmlphp", ".phtmlx"],
      correctIndex: 0,
      hint: "Comme le nom du langage.",
    },
    {
      level: "facile",
      question: "Dans quel environnement PHP fonctionne-t-il principalement ?",
      options: ["Serveur Web", "Application mobile native", "Terminal Linux", "Navigateur sans serveur"],
      correctIndex: 0,
      hint: "Il est exécuté côté serveur, pas côté client.",
    },
    {
      level: "facile",
      question: "Le symbole utilisé pour déclarer une variable en PHP est :",
      options: ["$", "#", "@", "%"],
      correctIndex: 0,
      hint: "Comme en JavaScript.",
    },
    {
      level: "facile",
      question: "Quelle balise commence un bloc de code PHP dans un fichier HTML ?",
      options: ["<?php", "<php>", "<?>", "</php>"],
      correctIndex: 0,
      hint: "Ce sont des balises spéciales commençant par <?.",
    },

    // Moyen
    {
      level: "moyen",
      question: "Quelle fonction permet d’afficher du texte en PHP ?",
      options: ["echo", "print_text", "display()", "printf()"],
      correctIndex: 0,
      hint: "Ce mot peut signifier “répéter”.",
    },
    {
      level: "moyen",
      question: "Que signifie PHP ?",
      options: ["Hypertext Preprocessor", "Personal Home Page", "Procedural Hyper Program", "Programmatic HTML Parser"],
      correctIndex: 0,
      hint: "Ce nom est une rétro-acronymie.",
    },
    {
      level: "moyen",
      question: "Quel mot-clé est utilisé pour inclure un fichier externe en PHP ?",
      options: ["include", "import", "require_once_all", "load_file()"],
      correctIndex: 0,
      hint: "On l’utilise pour charger un fichier dans un autre.",
    },
    {
      level: "moyen",
      question: "Quelle superglobale contient les données envoyées par une requête GET ?",
      options: ["$_GET", "$_REQUEST", "$_URL", "$_ACTION"],
      correctIndex: 0,
      hint: "Le nom de la variable contient la méthode elle-même.",
    },
    {
      level: "moyen",
      question: "Quelle est la dernière version majeure de PHP (à titre indicatif début 2025) ?",
      options: ["PHP 8.3", "PHP 6.0", "PHP 9.1", "PHP 5.8"],
      correctIndex: 0,
      hint: "La version 6 n’a jamais existé officiellement.",
    },

    // Difficile
    {
      level: "difficile",
      question: "Quelle interface permet à PHP de communiquer avec différentes bases de données, comme MySQL ou PostgreSQL ?",
      options: ["PDO", "SQLi", "PSQL", "DataConnector"],
      correctIndex: 0,
      hint: "Ces lettres signifient “PHP Data Objects”.",
    },
    {
      level: "difficile",
      question: "Quel type de programmation PHP supporte-t-il depuis PHP 5 ?",
      options: ["Programmation orientée objet", "Programmation only script", "Programmation modulaire obligataire", "Programmation isochrone"],
      correctIndex: 0,
      hint: "On parle de classes et d’objets.",
    },
    {
      level: "difficile",
      question: "Quelle est la durée de vie d'une variable de session PHP par défaut ?",
      options: ["Jusqu’à fermeture du navigateur", "24h par défaut", "5 minutes", "Jusqu'au prochain refresh"],
      correctIndex: 0,
      hint: "Elle vit tant que la session est active.",
    },
    {
      level: "difficile",
      question: "Quelle fonction permet de hacher une chaîne de caractères de manière sécurisée en PHP ?",
      options: ["password_hash()", "md5()", "crypt_secure()", "encode()"],
      correctIndex: 0,
      hint: "Une fonction spécialement dédiée aux mots de passe.",
    },
    {
      level: "difficile",
      question: "Comment définit-on une constante en PHP ?",
      options: ["define(\"NOM\", valeur)", "$const NOM = valeur", "constant NOM = valeur", "set(NOM, valeur)"],
      correctIndex: 0,
      hint: "Ce mot signifie “définir”.",
    },
  ]), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);

  // Petit son sur bonne réponse (facultatif)
  const playSuccessTone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880; // La
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const currentQuestion = phpQuestions[currentIndex];

  const handleAnswer = (index) => {
    if (answered) return;
    setSelectedIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswered(true);
    if (isCorrect) {
      setScore((s) => s + 1);
      playSuccessTone();
    }
    // Passage automatique à la prochaine question
    setTimeout(() => {
      if (currentIndex < phpQuestions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        setSelectedIndex(null);
      }
    }, 1000);
  };

  const closeQuizHref = "/carte"; // Retour à la carte sans paramètre
  return (
    <main className="p-0 m-0">
      {/* Conteneur centré avec ratio de l'image pour positionner précisément les zones */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Bouton retour vers la page d'accueil */}
        <Link
          href="/"
          className="absolute top-4 left-4 z-[5] font-pixel text-xs md:text-sm lg:text-base bg-black/70 border-2 border-white text-white px-3 py-2 rounded hover:bg-black/80 transition-colors"
        >
          ← RETOUR
        </Link>

        {/* Fond flouté pour remplir les zones noires */}
        <div
          style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
          aria-hidden
        >
          <Image
            src={carteImage}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              filter: "blur(16px) brightness(0.4)",
              transform: "scale(1.08)",
            }}
          />
        </div>

        <div
          className="relative"
          style={{
            width: "90vw",
            maxWidth: "1200px",
            maxHeight: "90vh",
            aspectRatio: `${carteImage.width}/${carteImage.height}`,
            zIndex: 1,
          }}
        >
          <Image
            src={carteImage}
            alt="Carte"
            fill
            priority
            sizes="(max-width: 1200px) 90vw, 1200px"
            style={{ objectFit: "contain", objectPosition: "center" }}
          />

          {/* Libellés des zones (cliquables) */}
          <div className="absolute inset-0 z-[2]">
            {/* CSS - coin supérieur gauche */}
            <Link
              href="/carte/css"
              prefetch={false}
              className="absolute font-pixel text-white text-xs md:text-sm lg:text-base bg-black/60 border border-white rounded-sm px-2 py-1 hover:bg-black/80 transition-colors cursor-pointer"
              style={{ top: "50%", left: "25%" }}
            >
              CSS
            </Link>

            {/* JS - coin supérieur droit */}
            <Link
              href="/carte/js"
              prefetch={false}
              className="absolute font-pixel text-white text-xs md:text-sm lg:text-base bg-black/60 border border-white rounded-sm px-2 py-1 hover:bg-black/80 transition-colors cursor-pointer"
              style={{ top: "7%", right: "45%" }}
            >
              JS
            </Link>

            {/* GLOBAL - centre */}
            <Link
              href="/carte/global"
              prefetch={false}
              className="absolute font-pixel text-white text-sm md:text-base lg:text-lg bg-black/70 border-2 border-white rounded px-3 py-1 hover:bg-black/80 transition-colors cursor-pointer"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              GLOBAL
            </Link>

            {/* PHP - milieu gauche */}
            <Link
              href="/carte/php"
              prefetch={false}
              className="absolute font-pixel text-white text-xs md:text-sm lg:text-base bg-black/60 border border-white rounded-sm px-2 py-1 hover:bg-black/80 transition-colors cursor-pointer"
              style={{ top: "70%", left: "12%" }}
            >
              PHP
            </Link>

            {/* JAVA - milieu droit */}
            <Link
              href="/carte/java"
              prefetch={false}
              className="absolute font-pixel text-white text-xs md:text-sm lg:text-base bg-black/60 border border-white rounded-sm px-2 py-1 hover:bg-black/80 transition-colors cursor-pointer"
              style={{ top: "45%", right: "20%" }}
            >
              JAVA
            </Link>

            {/* PYTHON - bas centré */}
            <Link
              href="/carte/python"
              prefetch={false}
              className="absolute font-pixel text-white text-xs md:text-sm lg:text-base bg-black/60 border border-white rounded-sm px-2 py-1 hover:bg-black/80 transition-colors cursor-pointer"
              style={{ bottom: "70%", left: "13%", transform: "translateX(-50%)" }}
            >
              PYTHON
            </Link>
          </div>

          {/* Quiz PHP (overlay) */}
          {isPhpQuiz && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="w-[92%] max-w-xl bg-zinc-900/95 border-2 border-white rounded-lg p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-pixel text-white text-base md:text-lg">QUIZ PHP</h2>
                  <Link href={closeQuizHref} className="font-pixel text-[10px] text-white/80 hover:text-white underline">Fermer</Link>
                </div>

                {/* Progression */}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-pixel text-[10px] text-white/80">
                    Question {currentIndex + 1} / {phpQuestions.length} · Niveau {currentQuestion?.level?.toUpperCase()}
                  </p>
                  <p className="font-pixel text-[10px] text-white/80">Score: {score}</p>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <p className="font-pixel text-xs md:text-sm text-white">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    const showWrong = answered && isSelected && !isCorrect;
                    const showCorrect = answered && isCorrect;
                    const base = "rounded-lg border-2 font-pixel text-xs md:text-sm px-3 py-3 transition-colors";
                    const disabledClass = answered ? "pointer-events-none" : "cursor-pointer";
                    let color = "bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700";
                    if (showWrong) color = "bg-red-700 border-red-500 text-white";
                    if (showCorrect) color = "bg-green-700 border-green-500 text-white";
                    const ring = showCorrect ? " ring-2 ring-green-400" : "";
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={`${base} ${color} ${disabledClass}${ring}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Indice */}
                <div className="mt-2">
                  <p className="font-pixel text-[10px] text-white/60">
                    Indice : {currentQuestion.hint}
                  </p>
                </div>

                {/* Boutons de navigation / fin */}
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={closeQuizHref}
                    className="font-pixel text-[10px] bg-black/70 border-2 border-white text-white px-3 py-2 rounded hover:bg-black/80"
                  >
                    ← RETOUR CARTE
                  </Link>
                  {currentIndex < phpQuestions.length - 1 ? (
                    <button
                      onClick={() => {
                        if (!answered) return;
                        setCurrentIndex((i) => i + 1);
                        setAnswered(false);
                        setSelectedIndex(null);
                      }}
                      className="font-pixel text-[10px] bg-zinc-800 border-2 border-white text-white px-3 py-2 rounded hover:bg-zinc-700 disabled:opacity-50"
                      disabled={!answered}
                    >
                      SUIVANT
                    </button>
                  ) : (
                    <div className="font-pixel text-xs text-white">
                      Quiz terminé · Score {score} / {phpQuestions.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}