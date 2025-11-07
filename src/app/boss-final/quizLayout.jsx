"use client";

import Image from "next/image";
import changeIcon from "@/asset/change.png";
import BouttonAbandonner from "@/app/components/buttonAbandonner";

export default function BossQuizLayout({
  title,
  level,
  question,
  questionTitle = "Question",
  options,
  correctIndex,
  selectedIndex,
  answered,
  onSelect,
  hint,
  showHint,
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
  visualImageFit = "cover",
  visualOverlaySrc,
  visualOverlayItems,
  visualCharacterSrc,
  visualCharacterIndex,
  visualCharacterStartTop,
  visualCharacterStartLeft,
  visualCharacterWidth,
  visualCharacterPositions,
  lives,
  maxLives = 3,
  coinCount,
  heartFullSrc,
  heartEmptySrc,
  coinSrc,
  tokenSrc,
  tokens,
  showOptions = true,
  customOptionsContent,
  customOptionsTopMarginClass = "mt-4",
  showHintButton = true,
  showChangeButton = true,
  showScore = true,
  showTimer = true,
  // Affichage conditionnel du badge "Sans faute"
  showSansFauteBadge = false,
  sansFauteSrc,
}) {
  return (
    <main className="w-screen h-screen bg-black text-white">
      <div className="relative w-full h-full bg-black text-white border-4 border-white rounded-3xl shadow-md overflow-hidden flex flex-col">
        {/* Zone visuelle plein écran hors zone question */}
        <div className="flex-[2] w-full bg-black relative">
          {visualImageSrc && (
            <Image
              src={visualImageSrc}
              alt=""
              fill
              className={visualImageFit === "cover" ? "object-cover" : "object-contain"}
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

          {/* Personnage optionnel (caché si non fourni) */}
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
            const widthPx = visualCharacterWidth ?? "5%";
            let transform = "translate(-50%, -100%)";
            let transformOrigin = "center bottom";

            if (validCharIndex) {
              const pos = visualCharacterPositions[visualCharacterIndex] || {};
              topPx = pos.top ?? "70%";
              leftPx = pos.left ?? "50%";
              const leftNum = parseFloat(String(leftPx).replace("%", ""));
              const faceScale = leftNum < 50 ? 1 : -1;
              transform = `translate(-50%, -100%) scaleX(${faceScale})`;
            } else if (validOverlayIndex) {
              const pos = visualOverlayItems[visualCharacterIndex];
              topPx = pos.top ?? "70%";
              leftPx = pos.left ?? "50%";
              const leftNum = parseFloat(String(leftPx).replace("%", ""));
              const faceScale = leftNum < 50 ? 1 : -1;
              transform = `translate(-50%, -100%) scaleX(${faceScale})`;
            } else if (visualCharacterStartTop) {
              topPx = String(visualCharacterStartTop);
              leftPx = String(visualCharacterStartLeft ?? "50%");
              const leftNum = parseFloat(String(leftPx).replace("%", ""));
              const faceScale = leftNum < 50 ? 1 : -1;
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

          {/* Vies & pièces */}
          {typeof lives === "number" && heartFullSrc && heartEmptySrc && (
            <div className="absolute top-2 left-2 flex flex-col items-start gap-2 pointer-events-none">
              {showSansFauteBadge && (
                <img
                  src={sansFauteSrc || "/asset/Sans-faute.png"}
                  alt="Sans faute"
                  className="w-12 h-12 border-2 border-white rounded-full bg-zinc-900"
                />
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(3, maxLives) }, (_, i) => i).map((i) => (
                  <img key={i} src={i < lives ? heartFullSrc : heartEmptySrc} alt={i < lives ? "vie" : "vie perdue"} className="w-10 h-10" />
                ))}
              </div>
              {coinSrc && (
                <div className="flex items-center gap-1">
                  <img src={coinSrc} alt="coin" className="w-10 h-10" />
                  {typeof coinCount === "number" && (
                    <span className="font-pixel text-xs text-white">{coinCount}</span>
                  )}
                </div>
              )}
              {tokenSrc && typeof tokens === "number" && tokens > 0 && (
                <div className="flex items-center gap-1">
                  <img src={tokenSrc} alt="token" className="w-10 h-10" />
                  {tokens > 1 && (
                    <span className="font-pixel text-xs text-white">{tokens}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Abandonner */}
          <div className="absolute top-2 right-2">
            <BouttonAbandonner />
          </div>
        </div>

        {/* Zone Question */}
        <div className="relative px-4 pb-6 flex-[1]">
          <div className="flex items-center gap-3">
            <div className="hidden md:block h-[2px] bg-white flex-1" />
            <div className="border-2 border-white rounded-2xl px-6 py-3 bg-black text-white text-center max-w-250 w-full mx-auto">
              <div className="font-pixel text-base md:text-xl">{questionTitle}</div>
              <div className="mt-2 font-pixel text-xs md:text-sm">{question}</div>
            </div>
            <div className="hidden md:block h-[2px] bg-white flex-1" />
          </div>
          {(showHintButton || showChangeButton) && (
            <div className="mt-1 flex justify-end">
              <div className="flex flex-col gap-2">
                {showHintButton && (
                  <button
                    onClick={() => (onRevealHint ? onRevealHint() : undefined)}
                    className="w-9 h-9 border-2 border-white rounded-xl bg-black text-white hover:bg-zinc-900 font-pixel"
                    aria-label="Indice"
                  >
                    ?
                  </button>
                )}
                {showChangeButton && (
                  <button
                    className="w-9 h-9 border-2 border-white rounded-xl bg-black text-white hover:bg-zinc-900 font-pixel"
                    aria-label="Changer"
                    onClick={() => onChangeQuestion?.()}
                  >
                    <img src={changeIcon.src} alt="change" className="w-6 h-6 inline-block" />
                  </button>
                )}
              </div>
            </div>
          )}
          {customOptionsContent ? (
            <div className={`${customOptionsTopMarginClass} max-w-400 w-full mx-auto`}>
              {customOptionsContent}
            </div>
          ) : (
            showOptions && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-center max-w-400 w-full mx-auto">
                {options.map((opt, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isCorrect = idx === correctIndex;
                  const showWrong = answered && isSelected && !isCorrect;
                  const showCorrect = answered && isCorrect;
                  const base = "rounded-2xl border-2 font-pixel text-sm md:text-base px-4 py-5 transition-colors";
                  const interactivity = answered ? "pointer-events-none" : "cursor-pointer";

                  let classes = `${base} bg-black text-white border-white hover:bg-zinc-900 ${interactivity}`;
                  if (showWrong) {
                    classes = `${base} bg-red-600 border-red-600 text-white ${interactivity}`;
                  } else if (showCorrect) {
                    classes = `${base} ${isSelected ? "bg-green-600 text-white" : "bg-black text-white"} border-green-600 ${interactivity} ${isSelected ? "" : "ring-2 ring-green-400"}`;
                  }

                  return (
                    <button key={idx} onClick={() => onSelect?.(idx)} className={classes}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )
          )}

          {showHint && (
            <div className="mt-3 font-pixel text-[10px] md:text-xs text-center">Indice : {hint}</div>
          )}

          {showScore && (
            <div className="mt-4 flex items-center justify-end">
              {hasNext ? (
                <div className="font-pixel text-[10px] md:text-xs text-white/60">&nbsp;</div>
              ) : (
                <div className="font-pixel text-xs">Score {score} / {total}</div>
              )}
            </div>
          )}
        </div>

        {/* Chronomètre */}
        {showTimer && (
          <div className="absolute bottom-3 right-4 flex items-center gap-3">
            <div className="w-32 h-2 border-2 border-white rounded-full bg-black overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, (timerTotalSeconds ? (timerSeconds / timerTotalSeconds) : 0) * 100))}%` }}
              />
            </div>
            <div className="font-pixel text-[10px] md:text-xs">{timerSeconds} sec</div>
          </div>
        )}
      </div>
    </main>
  );
}