"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";

export default function JsQuizPage() {
  const questions = useMemo(
    () => [
      // Niveau Facile (5)
      {
        level: "facile",
        question: "Que permet de faire JavaScript dans une page web ?",
        options: [
          "Ajouter des interactions dynamiques",
          "Créer des pages statiques",
          "Modifier la base de données",
          "Configurer le serveur",
        ],
        correctIndex: 0,
        hint: "Il rend la page web interactive.",
      },
      {
        level: "facile",
        question: "Quel mot-clé permet de déclarer une variable en JavaScript ?",
        options: ["let", "varname", "create", "load"],
        correctIndex: 0,
        hint: "C’est l’un des 3 mots-clés (let, const, var).",
      },
      {
        level: "facile",
        question: "Quelle méthode affiche un message dans la console ?",
        options: ["console.log()", "write.console()", "print.log()", "message()"],
        correctIndex: 0,
        hint: "Très souvent utilisée en debug.",
      },
      {
        level: "facile",
        question: "Comment commence un commentaire sur une seule ligne en JavaScript ?",
        options: ["//", "<!-- -->", "#", "/**/"],
        correctIndex: 0,
        hint: "Même syntaxe qu’en C ou Java.",
      },
      {
        level: "facile",
        question: "Quel type de langage est JavaScript ?",
        options: ["Langage interprété", "Langage compilé", "Langage assembleur", "Langage binaire"],
        correctIndex: 0,
        hint: "Exécuté directement par le navigateur.",
      },

      // Niveau Moyen (5)
      {
        level: "moyen",
        question: "Quelle fonction permet d'attendre un certain temps avant d'exécuter du code ?",
        options: ["setTimeout()", "wait()", "delay()", "timer()"],
        correctIndex: 0,
        hint: "On lui passe une fonction et un délai.",
      },
      {
        level: "moyen",
        question: "Quel est le type de retour de typeof null en JavaScript ?",
        options: ["object", "null", "undefined", "string"],
        correctIndex: 0,
        hint: "Bug historique de JavaScript.",
      },
      {
        level: "moyen",
        question: "Quelle méthode transforme une chaîne JSON en objet JavaScript ?",
        options: ["JSON.parse()", "JSON.stringify()", "parse.JSON()", "toObject()"],
        correctIndex: 0,
        hint: "Le mot-parole est “parse”.",
      },
      {
        level: "moyen",
        question: "Quel mot-clé empêche la réassignation d'une variable en JavaScript ?",
        options: ["const", "static", "let", "immutable"],
        correctIndex: 0,
        hint: "Sert pour déclarer une constante.",
      },
      {
        level: "moyen",
        question: "Quelle boucle permet d’itérer sur les clés d'un objet ?",
        options: ["for...in", "for...of", "loop.object", "foreach.keys"],
        correctIndex: 0,
        hint: "Elle parcourt les propriétés.",
      },

      // Niveau Difficile (5)
      {
        level: "difficile",
        question: "Que signifie l’expression “JavaScript est single-threaded” ?",
        options: [
          "Il exécute une instruction à la fois sur un seul fil d’exécution",
          "Il peut exécuter plusieurs tâches en simultané",
          "Il utilise plusieurs processeurs",
          "Il est bloqué si le CPU est surchargé",
        ],
        correctIndex: 0,
        hint: "Un seul thread.",
      },
      {
        level: "difficile",
        question: "Quelle est la sortie de console.log(0.1 + 0.2 === 0.3) ?",
        options: ["false", "true", "0.3", "undefined"],
        correctIndex: 0,
        hint: "À cause de la précision des flottants.",
      },
      {
        level: "difficile",
        question: "Quelle est la valeur de this dans une fonction fléchée (=>) ?",
        options: [
          "Hérite du contexte parent",
          "Se réfère globalement à window",
          "Change selon l'appel",
          "Est automatiquement undefined",
        ],
        correctIndex: 0,
        hint: "Elle ne crée pas son propre scope.",
      },
      {
        level: "difficile",
        question: "Quelle méthode JavaScript permet de lier un contexte (this) à une fonction ?",
        options: ["bind()", "connect()", "applyContext()", "link()"],
        correctIndex: 0,
        hint: "Sert souvent dans les callbacks.",
      },
      {
        level: "difficile",
        question: "Quel est le modèle de programmation de JavaScript pour la gestion des événements ?",
        options: [
          "Modèle asynchrone basé sur une boucle d'événements (event loop)",
          "Modèle strictement multi-thread",
          "Modèle synchrone bloquant",
          "Modèle orienté flux binaire uniquement",
        ],
        correctIndex: 0,
        hint: "Utilise une pile et une file d’attente.",
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
      // Temps écoulé : révéler et passer automatiquement à la suivante
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
      title="THÈME 4 – QUIZ JAVASCRIPT"
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