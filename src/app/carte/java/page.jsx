"use client";

import { useEffect, useMemo, useState } from "react";
import QuizLayout from "@/app/components/QuizLayout";

export default function JavaQuizPage() {
  const questions = useMemo(
    () => [
      // Niveau Facile (5)
      {
        level: "facile",
        question: "Java est principalement utilisé pour :",
        options: [
          "Développer des applications multiplateformes",
          "Créer des sites web statiques",
          "Gérer uniquement des bases de données",
          "Éditer des images",
        ],
        correctIndex: 0,
        hint: "Il fonctionne sur tous les systèmes grâce à la JVM.",
      },
      {
        level: "facile",
        question: "Quelle est l’extension habituelle d’un fichier Java ?",
        options: [".java", ".jav", ".class", ".js"],
        correctIndex: 0,
        hint: "C’est le fichier source avant compilation.",
      },
      {
        level: "facile",
        question: "Quel mot-clé est utilisé pour déclarer une classe en Java ?",
        options: ["class", "struct", "define", "object"],
        correctIndex: 0,
        hint: "On parle de programmation orientée objet.",
      },
      {
        level: "facile",
        question: "Quel est le symbole utilisé pour terminer une instruction en Java ?",
        options: [";", ":", ".", "/"],
        correctIndex: 0,
        hint: "Il marque la fin de chaque ligne d’exécution.",
      },
      {
        level: "facile",
        question: "Quel mot-clé permet d’afficher un texte à l’écran ?",
        options: ["System.out.println()", "echo()", "print()", "display()"],
        correctIndex: 0,
        hint: "Il envoie du texte vers la console.",
      },

      // Niveau Moyen (5)
      {
        level: "moyen",
        question:
          "Quelle méthode représente le point d’entrée principal d’un programme Java ?",
        options: [
          "public static void main(String[] args)",
          "startProgram()",
          "execute()",
          "runApp()",
        ],
        correctIndex: 0,
        hint: "Sans elle, le programme ne démarre pas.",
      },
      {
        level: "moyen",
        question: "Quelle est la différence entre une classe et un objet ?",
        options: [
          "Une classe est un modèle, un objet est une instance de ce modèle",
          "Une classe et un objet sont identiques",
          "Un objet contient des classes",
          "Une classe ne peut pas exister sans objet",
        ],
        correctIndex: 0,
        hint: "L’objet “naît” de la classe.",
      },
      {
        level: "moyen",
        question:
          "Quelle structure conditionnelle utilise-t-on pour exécuter un code selon une condition ?",
        options: ["if / else", "when / otherwise", "choose / case", "verify / then"],
        correctIndex: 0,
        hint: "C’est la base des conditions.",
      },
      {
        level: "moyen",
        question: "Que permet la boucle for en Java ?",
        options: [
          "Répéter un bloc de code un nombre déterminé de fois",
          "Répéter indéfiniment sans condition",
          "Définir une méthode",
          "Créer une classe",
        ],
        correctIndex: 0,
        hint: "Elle contient une variable d’incrémentation.",
      },
      {
        level: "moyen",
        question: "Quelle est la différence entre == et .equals() ?",
        options: [
          "== compare les références, .equals() compare les valeurs",
          "Les deux comparent les valeurs",
          "== compare les types",
          ".equals() sert uniquement pour les nombres",
        ],
        correctIndex: 0,
        hint: "L’un teste l’adresse mémoire, l’autre le contenu.",
      },

      // Niveau Difficile (5)
      {
        level: "difficile",
        question: "Quelle est la signification de JVM ?",
        options: [
          "Java Virtual Machine",
          "Java Visual Model",
          "Java Version Manager",
          "Java Variable Module",
        ],
        correctIndex: 0,
        hint: "C’est elle qui exécute le code Java.",
      },
      {
        level: "difficile",
        question: "Que permet le mot-clé extends en Java ?",
        options: [
          "Hériter d’une autre classe",
          "Étendre une variable",
          "Ajouter une méthode à une interface",
          "Fusionner deux classes",
        ],
        correctIndex: 0,
        hint: "Il s’agit d’héritage en POO.",
      },
      {
        level: "difficile",
        question: "Quelle est la différence entre ArrayList et LinkedList ?",
        options: [
          "ArrayList est basée sur un tableau, LinkedList sur une liste chaînée",
          "Elles sont identiques",
          "LinkedList est plus rapide dans tous les cas",
          "ArrayList n’accepte pas les doublons",
        ],
        correctIndex: 0,
        hint: "L’une accède vite par index, l’autre insère vite.",
      },
      {
        level: "difficile",
        question: "Quelle interface Java est utilisée pour les threads ?",
        options: ["Runnable", "Executable", "Threadable", "Process"],
        correctIndex: 0,
        hint: "Elle contient la méthode run().",
      },
      {
        level: "difficile",
        question: "Que signifie l’annotation @Override ?",
        options: [
          "Indique qu’une méthode redéfinit une méthode héritée",
          "Déclare une méthode publique",
          "Supprime une méthode",
          "Force l’exécution d’une méthode",
        ],
        correctIndex: 0,
        hint: "Elle vérifie qu’on réécrit bien une méthode parent.",
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
      title="THÈME 1 – QUIZ JAVA"
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