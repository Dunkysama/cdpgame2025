"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";

export default function CssQuizPage() {
  const questions = useMemo(
    () => [
      // Niveau Facile (5)
      {
        level: "facile",
        question: "Que signifie CSS ?",
        options: [
          "Cascading Style Sheets",
          "Computer Style System",
          "Creative Style Script",
          "Code Sheet Style",
        ],
        correctIndex: 0,
        hint: "Cela signifie \"feuilles de style en cascade\".",
      },
      {
        level: "facile",
        question: "Quelle propriété CSS permet de changer la couleur du texte ?",
        options: ["color", "text-color", "font-color", "text-style"],
        correctIndex: 0,
        hint: "C’est la même chose en anglais.",
      },
      {
        level: "facile",
        question: "Comment applique-t-on une classe CSS à un élément HTML ?",
        options: [
          "Avec l’attribut class",
          "Avec l’attribut css",
          "Avec l’attribut style-class",
          "Avec l'attribut .class",
        ],
        correctIndex: 0,
        hint: "On utilise un attribut qui sert aussi en JavaScript.",
      },
      {
        level: "facile",
        question: "Quelle propriété permet de définir la taille du texte ?",
        options: ["font-size", "text-size", "font-style", "size-text"],
        correctIndex: 0,
        hint: "Le mot \"font\" signifie police en anglais.",
      },
      {
        level: "facile",
        question: "Quel sélecteur permet de cibler un élément ayant l’ID \"menu\" ?",
        options: ["#menu", ".menu", "menu[]", "<menu>"],
        correctIndex: 0,
        hint: "En CSS, les ID commencent avec un symbole précis.",
      },

      // Niveau Moyen (5)
      {
        level: "moyen",
        question: "Comment centrer du texte dans un élément avec CSS ?",
        options: [
          "text-align: center;",
          "align-text: middle;",
          "center-text: all;",
          "justify-text: center;",
        ],
        correctIndex: 0,
        hint: "On utilise souvent cette propriété dans les titres.",
      },
      {
        level: "moyen",
        question: "Quelle propriété permet d'ajouter de l'espace à l’intérieur d’un élément ?",
        options: ["padding", "margin", "spacing", "inner-space"],
        correctIndex: 0,
        hint: "C'est l'opposé de margin.",
      },
      {
        level: "moyen",
        question: "Quelle unité permet de définir une taille relative à la taille du texte dans CSS ?",
        options: ["em", "px", "cm", "%px"],
        correctIndex: 0,
        hint: "Elle se base sur la taille de la police parente.",
      },
      {
        level: "moyen",
        question: "Comment sélectionner tous les éléments <p> dans une page ?",
        options: ["p { ... }", ".p { ... }", "#p { ... }", "<p> { ... }"],
        correctIndex: 0,
        hint: "On écrit simplement le nom de l’élément.",
      },
      {
        level: "moyen",
        question: "Quelle propriété permet de changer l’image d’arrière-plan d’un élément ?",
        options: [
          "background-image",
          "image-background",
          "bg-img",
          "background-photo",
        ],
        correctIndex: 0,
        hint: "Elle commence par \"background\".",
      },

      // Niveau Difficile (5)
      {
        level: "difficile",
        question: "Quelle propriété CSS active la flexbox sur un conteneur ?",
        options: [
          "display: flex;",
          "position: flex;",
          "flex-active: true;",
          "display: box;",
        ],
        correctIndex: 0,
        hint: "On la met dans la propriété display.",
      },
      {
        level: "difficile",
        question: "Quel est l’ordre correct du modèle de boîte CSS ?",
        options: [
          "margin > border > padding > content",
          "content > padding > border > margin",
          "padding > border > margin > content",
          "border > content > padding > margin",
        ],
        correctIndex: 0,
        hint: "De l’extérieur vers l’intérieur.",
      },
      {
        level: "difficile",
        question:
          "Quel sélecteur cible les éléments qui ont à la fois la classe \"btn\" et \"active\" ?",
        options: [
          ".btn.active",
          ".btn .active",
          "#btn.active",
          ".btn+active",
        ],
        correctIndex: 0,
        hint: "On met deux classes l’une après l’autre.",
      },
      {
        level: "difficile",
        question:
          "Quelle fonction CSS permet de créer un dégradé de couleurs en arrière-plan ?",
        options: [
          "linear-gradient()",
          "color-gradient()",
          "background-step()",
          "gradient()",
        ],
        correctIndex: 0,
        hint: "\"Linear\" veut dire \"en ligne droite\".",
      },
      {
        level: "difficile",
        question:
          "Quelle propriété permet de définir une grille CSS complexe à plusieurs colonnes ?",
        options: [
          "grid-template-columns",
          "column-grid-template",
          "flex-columns",
          "grid-column-set",
        ],
        correctIndex: 0,
        hint: "Elle fait partie du module CSS Grid.",
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
      title="THÈME 2 – QUIZ CSS"
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