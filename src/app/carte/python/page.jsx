"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";

export default function PythonQuizPage() {
  const questions = useMemo(
    () => [
      // Niveau Facile (5)
      {
        level: "facile",
        question: "Que signifie le mot \"Python\" dans le langage de programmation Python ?",
        options: [
          "Le nom vient des Monty Python",
          "Un serpent particulier",
          "Le nom d’un algorithme",
          "Une combinaison hybride",
        ],
        correctIndex: 0,
        hint: "Créé en référence à une troupe comique.",
      },
      {
        level: "facile",
        question: "Quel est le mot-clé pour afficher du texte en Python ?",
        options: ["print()", "echo()", "display()", "console.log()"],
        correctIndex: 0,
        hint: "Il imprime du texte dans le terminal.",
      },
      {
        level: "facile",
        question: "Quelle extension ont les fichiers Python ?",
        options: [".py", ".python", ".pt", ".p"],
        correctIndex: 0,
        hint: "Elle n’est composée que de deux lettres.",
      },
      {
        level: "facile",
        question: "Comment déclare-t-on une variable en Python ?",
        options: ["x = 10", "var x = 10", "int x = 10", "declare x 10"],
        correctIndex: 0,
        hint: "On attribue simplement une valeur.",
      },
      {
        level: "facile",
        question: "Quelle fonction permet d'obtenir la longueur d'une liste en Python ?",
        options: ["len()", "count()", "length()", "size()"],
        correctIndex: 0,
        hint: "C’est un mot court pour “length”.",
      },

      // Niveau Moyen (5)
      {
        level: "moyen",
        question: "Comment s’appelle le gestionnaire de paquets par défaut de Python ?",
        options: ["pip", "npm", "apt", "conda"],
        correctIndex: 0,
        hint: "Signifie “pip installs packages”.",
      },
      {
        level: "moyen",
        question: "Quel type de données représente une valeur booléenne en Python ?",
        options: ["True ou False", "1 ou 0", "‘yes’ ou ‘no’", "‘true’ ou ‘false’"],
        correctIndex: 0,
        hint: "Ces mots commencent par une majuscule.",
      },
      {
        level: "moyen",
        question: "Quelle est la sortie de print(3 * 'ab') ?",
        options: ["ababab", "3ab", "ab3", "error"],
        correctIndex: 0,
        hint: "En Python, on peut multiplier des chaînes.",
      },
      {
        level: "moyen",
        question: "Quel mot-clé permet de gérer les exceptions en Python ?",
        options: ["try", "catch", "error", "exception"],
        correctIndex: 0,
        hint: "On l’utilise avec except.",
      },
      {
        level: "moyen",
        question: "Comment importez-vous une bibliothèque en Python ?",
        options: ["import math", "include math", "load_library math", "use math"],
        correctIndex: 0,
        hint: "Utilisé en début de fichier.",
      },

      // Niveau Difficile (5)
      {
        level: "difficile",
        question: "Quel est le paradigme principal de Python ?",
        options: [
          "Multi-paradigme (impératif, objet, fonctionnel)",
          "Programmation purement logique",
          "Programmation à base de règles",
          "Programmation strictement fonctionnelle",
        ],
        correctIndex: 0,
        hint: "Il s'adapte à plusieurs styles de programmation.",
      },
      {
        level: "difficile",
        question: "Quelle est la différence entre une liste et un tuple en Python ?",
        options: [
          "Le tuple est immuable, la liste est mutable",
          "Le tuple ne peut contenir que des nombres",
          "La liste ne peut contenir que des chaînes",
          "Il n’y a aucune différence",
        ],
        correctIndex: 0,
        hint: "Une fois créé, un tuple ne change pas.",
      },
      {
        level: "difficile",
        question: "Quel est le décorateur utilisé pour créer une méthode statique dans une classe ?",
        options: ["@staticmethod", "@class", "@static", "@method"],
        correctIndex: 0,
        hint: "Il commence par “static”.",
      },
      {
        level: "difficile",
        question: "Quelle structure de données est idéale pour garantir l’unicité des éléments ?",
        options: ["set", "list", "tuple", "dict"],
        correctIndex: 0,
        hint: "Elle s’apparente à un ensemble mathématique.",
      },
      {
        level: "difficile",
        question: "Quelle version de Python a introduit les f-strings ?",
        options: ["Python 3.6", "Python 2.7", "Python 3.2", "Python 3.10"],
        correctIndex: 0,
        hint: "Sortie en 2016.",
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
      title="THÈME 5 – QUIZ PYTHON"
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