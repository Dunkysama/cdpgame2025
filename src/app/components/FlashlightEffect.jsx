"use client";

import { useState, useEffect } from "react";

export default function FlashlightEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialiser la position au centre
    const initialX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const initialY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    setMousePosition({ x: initialX, y: initialY });

    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: e.clientX, 
        y: e.clientY 
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 1,
        background: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0, 0, 0, 0.7) 25%, rgba(0, 0, 0, 0.9) 45%, rgba(0, 0, 0, 0.98) 70%, rgba(0, 0, 0, 0.99) 100%)`,
      }}
    />
  );
}
