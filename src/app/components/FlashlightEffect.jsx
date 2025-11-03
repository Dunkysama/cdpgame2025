"use client";

import { useState, useEffect } from "react";

export default function FlashlightEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialiser la position au centre
    setMousePosition({ 
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
    });

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Masque sombre avec un trou lumineux */}
      <div
        className="flashlight-overlay"
        style={{
          background: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0, 0, 0, 0.7) 25%, rgba(0, 0, 0, 0.9) 45%, rgba(0, 0, 0, 0.98) 70%, rgba(0, 0, 0, 0.99) 100%)`,
        }}
      ></div>
      
      {/* Image visible uniquement dans le spot lumineux */}
      <div
        className="flashlight-image"
        style={{
          backgroundImage: "url('/TOWER OF {CODE}.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          WebkitClipPath: `circle(350px at ${mousePosition.x}px ${mousePosition.y}px)`,
          clipPath: `circle(350px at ${mousePosition.x}px ${mousePosition.y}px)`,
        }}
      ></div>
    </>
  );
}

