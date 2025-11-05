"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";

export default function PhpQuizPage() {
  // Questions: 5 faciles, 5 moyennes, 5 difficiles
  const questions = useMemo(
    () => [
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
    ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);

  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(15);

  useEffect(() => {
    setShowHint(false);
    setTimer(15);
  }, [currentIndex]);

  useEffect(() => {
    if (answered) return; // stop countdown after answering
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
    if (isCorrect) {
      setScore((s) => s + 1);
      playSuccessTone();
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
        setSelectedIndex(null);
      }
    }, 1000);
  };

  return (
    <QuizLayout
      title="QUIZ PHP"
      level={currentQuestion?.level}
      question={currentQuestion.question}
      options={currentQuestion.options}
      correctIndex={currentQuestion.correctIndex}
      selectedIndex={selectedIndex}
      answered={answered}
      onSelect={handleAnswer}
      hint={currentQuestion.hint}
      showHint={showHint}
      onToggleHint={() => setShowHint((v) => !v)}
      score={score}
      currentIndex={currentIndex}
      total={questions.length}
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