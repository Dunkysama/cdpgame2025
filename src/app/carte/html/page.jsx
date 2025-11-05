"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";

export default function HtmlQuizPage() {
  const questions = useMemo(
    () => [
      // Facile
      {
        level: "facile",
        question: "Que signifie HTML ?",
        options: [
          "HyperText Markup Language",
          "Hyper Transfer Markup Language",
          "HighText Machine Language",
          "HyperTabular Media Layout",
        ],
        correctIndex: 0,
        hint: "C’est le langage de base des pages web.",
      },
      {
        level: "facile",
        question: "Quel élément HTML est utilisé pour créer un lien hypertexte ?",
        options: ["<a>", "<link>", "<href>", "<url>"],
        correctIndex: 0,
        hint: "La balise commence par “ancre” en anglais.",
      },
      {
        level: "facile",
        question: "Quelle balise est utilisée pour insérer une image ?",
        options: ["<img>", "<image>", "<pic>", "<src>"],
        correctIndex: 0,
        hint: "Le mot vient d’“image” en anglais.",
      },
      {
        level: "facile",
        question: "Quelle balise représente le titre principal d’une page HTML ?",
        options: ["<h1>", "<head>", "<title>", "<header>"],
        correctIndex: 0,
        hint: "Il y a plusieurs niveaux de titres (h1 à h6).",
      },
      {
        level: "facile",
        question: "Dans quelle balise place-t-on le contenu visible d'une page HTML ?",
        options: ["<body>", "<main>", "<content>", "<html>"],
        correctIndex: 0,
        hint: "Le “corps” de la page.",
      },

      // Moyen
      {
        level: "moyen",
        question: "Quel attribut permet d’indiquer l'URL dans un lien HTML ?",
        options: ["href", "src", "url", "link"],
        correctIndex: 0,
        hint: "Signifie Hypertext Reference.",
      },
      {
        level: "moyen",
        question: "Comment définit-on un commentaire en HTML ?",
        options: ["<!-- Commentaire -->", "// Commentaire", "/* Commentaire */", "<! Commentaire !>"],
        correctIndex: 0,
        hint: "Ce sont les balises avec < !-- ... -->.",
      },
      {
        level: "moyen",
        question: "Quelle balise permet de structurer un tableau ?",
        options: ["<table>", "<tab>", "<tbody>", "<grid>"],
        correctIndex: 0,
        hint: "Traduction de tableau.",
      },
      {
        level: "moyen",
        question: "Quelle est la balise correcte pour afficher une liste à puces ?",
        options: ["<ul>", "<ol>", "<li>", "<list>"],
        correctIndex: 0,
        hint: "Liste non ordonnée.",
      },
      {
        level: "moyen",
        question: "Quel attribut HTML permet de définir du texte alternatif pour une image ?",
        options: ["alt", "title", "desc", "text"],
        correctIndex: 0,
        hint: "Sert à l’accessibilité.",
      },

      // Difficile
      {
        level: "difficile",
        question: "Quelle balise HTML5 est utilisée pour représenter une navigation principale ?",
        options: ["<nav>", "<navigation>", "<menu>", "<header>"],
        correctIndex: 0,
        hint: "Abréviation de “navigation”.",
      },
      {
        level: "difficile",
        question: "Quelle balise HTML5 représente un contenu indépendant ou autonome ?",
        options: ["<article>", "<section>", "<aside>", "<div>"],
        correctIndex: 0,
        hint: "Comme un article de blog.",
      },
      {
        level: "difficile",
        question: "Quel attribut HTML permet de rendre un champ <input> non modifiable ?",
        options: ["readonly", "disabled", "blocked", "frozen"],
        correctIndex: 0,
        hint: "Le champ reste lisible mais pas modifiable.",
      },
      {
        level: "difficile",
        question: "Quelle balise permet d'associer une légende à un tableau ?",
        options: ["<caption>", "<legend>", "<title>", "<description>"],
        correctIndex: 0,
        hint: "C’est la \"légende\" du tableau.",
      },
      {
        level: "difficile",
        question: "Quelle balise HTML est désormais obsolète pour gérer la mise en forme ?",
        options: ["<font>", "<span>", "<strong>", "<em>"],
        correctIndex: 0,
        hint: "Utilisée avant pour changer la couleur et la taille du texte.",
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
      title="THÈME 3 – QUIZ HTML"
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