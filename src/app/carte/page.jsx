"use client";

import Image from "next/image";
import carteImage from "@/asset/carte.jpg";
import Link from "next/link";

export default function PageCarte() {
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
        </div>
      </div>
    </main>
  );
}