"use client";

import Image from "next/image";
import Link from "next/link";
import changeIcon from "@/asset/change.png";

export default function QuizLayout({
  title,
  level,
  question,
  options,
  correctIndex,
  selectedIndex,
  answered,
  onSelect,
  hint,
  showHint,
  onToggleHint,
  onRevealHint,
  onChangeQuestion,
  score,
  currentIndex,
  total,
  onNext,
  hasNext,
  timerSeconds,
  timerTotalSeconds,
  visualImageSrc,
  visualOverlaySrc,
  visualOverlayItems,
  visualCharacterSrc,
  visualCharacterIndex,
  visualCharacterStartTop,
  visualCharacterStartLeft,
  visualCharacterWidth,
  visualCharacterPositions,
  lives,
  coinCount,
  heartFullSrc,
  heartEmptySrc,
  coinSrc,
  tokenSrc,
  tokens,
}) {
  return (
    <main className="w-screen h-screen bg-black text-white">
      {/* Grand cadre écran noir/blanc pleine page */}
      <div className="relative w-full h-full bg-white text-black border-4 border-black rounded-3xl shadow-md overflow-hidden flex flex-col">
        {/* Zone visuelle – occupe ~2/3 supérieurs (image en dehors de la zone question) */}
        <div className="flex-[2] w-full bg-white relative">
          {visualImageSrc && (
            <Image
              src={visualImageSrc}
              alt=""
              fill
              className="object-contain"
              priority
            />
          )}
          {Array.isArray(visualOverlayItems) && visualOverlayItems.length > 0 ? (
            visualOverlayItems.map((item, idx) => (
              <img
                key={idx}
                src={item.src}
                alt=""
                className="absolute pointer-events-none"
                style={{
                  top: item.top ?? "auto",
                  left: item.left ?? "auto",
                  right: item.right ?? undefined,
                  bottom: item.bottom ?? undefined,
                  transform: "translate(-50%, -50%)",
                  width: item.width ?? "10%",
                  height: "auto",
                }}
              />
            ))
          ) : (
            visualOverlaySrc && (
              <img
                src={visualOverlaySrc}
                alt=""
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[30%] h-auto pointer-events-none"
              />
            )
          )}

          {/* Personnage : soit sur plateforme courante, soit sur position de départ */}
          {visualCharacterSrc && (() => {
            const hasPlatforms = Array.isArray(visualOverlayItems) && visualOverlayItems.length > 0;
            const hasCharPositions = Array.isArray(visualCharacterPositions) && visualCharacterPositions.length > 0;
            const validCharIndex =
              typeof visualCharacterIndex === "number" &&
              visualCharacterIndex >= 0 &&
              hasCharPositions && visualCharacterIndex < visualCharacterPositions.length;
            const validOverlayIndex =
              typeof visualCharacterIndex === "number" &&
              visualCharacterIndex >= 0 &&
              hasPlatforms && visualCharacterIndex < visualOverlayItems.length;

            let topPx = undefined;
            let leftPx = undefined;
            const widthPx = visualCharacterWidth ?? "5%"; // taille réduite par défaut
            let transform = "translate(-50%, -100%)"; // pieds au contact du haut de la plateforme
            let transformOrigin = "center bottom";

            if (validCharIndex) {
              const pos = visualCharacterPositions[visualCharacterIndex] || {};
              topPx = pos.top ?? "70%";
              leftPx = pos.left ?? "50%";
              const leftNum = parseFloat(String(leftPx).replace("%", ""));
              const faceScale = leftNum < 50 ? 1 : -1; // gauche regarde droite, droite regarde gauche
              transform = `translate(-50%, -100%) scaleX(${faceScale})`;
            } else if (validOverlayIndex) {
              const pos = visualOverlayItems[visualCharacterIndex];
              topPx = pos.top ?? "70%";
              leftPx = pos.left ?? "50%";
              const leftNum = parseFloat(String(leftPx).replace("%", ""));
              const faceScale = leftNum < 50 ? 1 : -1; // gauche regarde à droite, droite regarde à gauche
              transform = `translate(-50%, -100%) scaleX(${faceScale})`;
            } else if (visualCharacterStartTop) {
              // Position de départ précise fournie
              topPx = String(visualCharacterStartTop);
              leftPx = String(visualCharacterStartLeft ?? "50%");
              const leftNum = parseFloat(String(leftPx).replace("%", ""));
              const faceScale = leftNum < 50 ? 1 : -1; // orientation inversée côté
              transform = `translate(-50%, -100%) scaleX(${faceScale})`;
            } else {
              return null;
            }

            return (
              <img
                src={visualCharacterSrc}
                alt="personnage"
                className="absolute pointer-events-none"
                style={{
                  top: topPx,
                  left: leftPx,
                  transform,
                  width: widthPx,
                  height: "auto",
                  transformOrigin,
                }}
              />
            );
          })()}

          {/* Cœurs (vies) et pièce (coins) en overlay en haut à gauche */}
          {typeof lives === "number" && heartFullSrc && heartEmptySrc && (
            <div className="absolute top-2 left-2 flex flex-col items-start gap-2 pointer-events-none">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <img
                    key={i}
                    src={i < lives ? heartFullSrc : heartEmptySrc}
                    alt={i < lives ? "vie" : "vie perdue"}
                    className="w-10 h-10"
                  />
                ))}
              </div>
              {coinSrc && (
                <div className="flex items-center gap-1">
                  <img src={coinSrc} alt="coin" className="w-10 h-10" />
                  {typeof coinCount === "number" && (
                    <span className="font-pixel text-xs text-black">{coinCount}</span>
                  )}
                </div>
              )}
              {tokenSrc && typeof tokens === "number" && tokens > 0 && (
                <div className="flex items-center gap-1">
                  <img src={tokenSrc} alt="token" className="w-10 h-10" />
                  {tokens > 1 && (
                    <span className="font-pixel text-xs text-black">{tokens}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bandeau 'Question' au-dessus des réponses, centré, avec traits latéraux */}
        <div className="relative px-4 pb-6 flex-[1]">
          <div className="flex items-center gap-3">
            {/* Trait gauche */}
            <div className="hidden md:block h-[2px] bg-black flex-1" />

            {/* Encadré centré */}
            <div className="border-2 border-black rounded-2xl px-6 py-3 bg-white text-center max-w-250 w-full mx-auto">
              <div className="font-pixel text-base md:text-xl">Question</div>
              <div className="mt-2 font-pixel text-xs md:text-sm">{question}</div>
            </div>

          {/* Trait droit */}
          <div className="hidden md:block h-[2px] bg-black flex-1" />
          </div>
          {/* Boutons verticaux juste en dessous de la ligne, à droite */}
          <div className="mt-1 flex justify-end">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => (onRevealHint ? onRevealHint() : onToggleHint?.())}
                className="w-9 h-9 border-2 border-black rounded-xl bg-white hover:bg-gray-100 font-pixel"
                aria-label="Indice"
              >
                ?
              </button>
              <button
                className="w-9 h-9 border-2 border-black rounded-xl bg-white hover:bg-gray-100 font-pixel"
                aria-label="Changer"
                onClick={() => onChangeQuestion?.()}
              >
                <img src={changeIcon.src} alt="change" className="w-6 h-6 inline-block" />
              </button>
            </div>
          </div>
          
          {/* Grille des 4 réponses – deux lignes, deux colonnes */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-center max-w-400 w-full mx-auto">
            {options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === correctIndex;
              const showWrong = answered && isSelected && !isCorrect;
              const showCorrect = answered && isCorrect; // vrai pour la bonne réponse (cliquée ou non)
              const base = "rounded-2xl border-2 font-pixel text-sm md:text-base px-4 py-5 transition-colors";
              const interactivity = answered ? "pointer-events-none" : "cursor-pointer";

              // Couleurs selon les règles demandées
              let classes = `${base} bg-white border-black hover:bg-gray-100 ${interactivity}`;
              if (showWrong) {
                classes = `${base} bg-red-600 border-red-600 text-white ${interactivity}`;
              } else if (showCorrect) {
                // Si c'est la bonne réponse: vert si cliquée, sinon bordure verte + léger halo
                classes = `${base} ${isSelected ? "bg-green-600 text-white" : "bg-white"} border-green-600 ${interactivity} ${isSelected ? "" : "ring-2 ring-green-400"}`;
              }

              return (
                <button
                  key={idx}
                  onClick={() => onSelect?.(idx)}
                  className={classes}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Indice affiché quand actif */}
          {showHint && (
            <div className="mt-3 font-pixel text-[10px] md:text-xs text-center">Indice : {hint}</div>
          )}

          {/* Score final, sans bouton retour ni bouton suivant */}
          <div className="mt-4 flex items-center justify-end">
            {hasNext ? (
              <div className="font-pixel text-[10px] md:text-xs text-black/60">&nbsp;</div>
            ) : (
              <div className="font-pixel text-xs">Score {score} / {total}</div>
            )}
          </div>
        </div>

        {/* Chronomètre en bas à droite + barre de progression du temps */}
        <div className="absolute bottom-3 right-4 flex items-center gap-3">
          <div className="w-32 h-2 border-2 border-black rounded-full bg-white overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, (timerTotalSeconds ? (timerSeconds / timerTotalSeconds) : 0) * 100))}%` }}
            />
          </div>
          <div className="font-pixel text-[10px] md:text-xs">{timerSeconds} sec</div>
        </div>
      </div>
    </main>
  );
}