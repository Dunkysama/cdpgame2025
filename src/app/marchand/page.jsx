"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MarchandPage() {
  const [gold, setGold] = useState(0);
  const [items, setItems] = useState({
    coeur: 0,
    tokenIndice: 0,
    sablier: 0,
  });

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Charger l'or
      const savedGold = localStorage.getItem("playerGold");
      if (savedGold) {
        setGold(parseInt(savedGold, 10));
      } else {
        // Valeur par défaut : 50 gold
        setGold(50);
        localStorage.setItem("playerGold", "50");
      }

      // Charger les items
      const savedItems = localStorage.getItem("playerItems");
      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems));
        } catch (e) {
          console.error("Erreur lors du chargement des items:", e);
          setItems({ coeur: 0, tokenIndice: 0, sablier: 0 });
        }
      } else {
        // Valeurs par défaut pour les items
        setItems({ coeur: 0, tokenIndice: 0, sablier: 0 });
        localStorage.setItem("playerItems", JSON.stringify({ coeur: 0, tokenIndice: 0, sablier: 0 }));
      }
    }
  }, []);

  // Les items disponibles à l'achat
  const shopItems = [
    {
      id: "coeur",
      name: "Cœur",
      icon: "❤️",
      price: 50,
      description: "Un cœur qui restaure votre vie. Utilisez-le pour récupérer de la santé lors de vos aventures.",
    },
    {
      id: "tokenIndice",
      name: "Token Indice",
      icon: "🟣",
      price: 30,
      description: "Un token qui vous donne un indice précieux. Utilisez-le pour obtenir de l'aide lors des énigmes difficiles.",
    },
    {
      id: "sablier",
      name: "Sablier",
      icon: "⏳",
      price: 20,
      description: "Un sablier magique qui vous donne plus de temps. Utilisez-le pour prolonger votre temps de réflexion.",
    },
  ];

  const handleBuy = (item) => {
    if (gold >= item.price) {
      const newGold = gold - item.price;
      const newItems = {
        ...items,
        [item.id]: (items[item.id] || 0) + 1,
      };

      setGold(newGold);
      setItems(newItems);

      // Sauvegarder dans localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("playerGold", newGold.toString());
        localStorage.setItem("playerItems", JSON.stringify(newItems));
      }

      // Message de confirmation
      alert(`Vous avez acheté ${item.name} pour ${item.price} gold !`);
    } else {
      alert(`Vous n'avez pas assez d'or ! Il vous faut ${item.price} gold, mais vous n'avez que ${gold} gold.`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      <div className="w-full max-w-5xl px-6 relative z-10">
        {/* Titre */}
        <div className="mb-8 text-center">
        
          <div className="text-xl font-pixel text-yellow-400">
            💰 Or: {gold}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Panneau gauche - Marchand */}
          <div className="w-full md:w-2/5 flex-shrink-0">
            <div className="bg-zinc-900 border-4 border-white rounded-lg p-8 h-full flex flex-col items-center justify-center min-h-[500px]">
              <div className="relative w-full h-full max-w-xs max-h-[400px] flex items-center justify-center">
                <Image
                  src="/asset/gobelin-marchand.png"
                  alt="Gobelin Marchand"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h2 className="text-2xl font-bold font-pixel text-white text-center mt-4">
                MARCHAND
              </h2>
            </div>
          </div>

          {/* Panneau droit - Items */}
          <div className="flex-1 space-y-4 flex flex-col justify-center">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border-2 border-zinc-600 rounded-lg p-5 flex items-center justify-between hover:border-white transition-all relative group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-5xl">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold font-pixel text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-pixel text-yellow-400">
                      {item.price} gold
                    </p>
                  </div>
                </div>

                {/* Bouton Acheter */}
                <button
                  onClick={() => handleBuy(item)}
                  disabled={gold < item.price}
                  className="rounded-lg font-pixel bg-zinc-800 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-800"
                >
                  Acheter
                </button>

                {/* Tooltip avec description au hover */}
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border-2 border-white rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
                  <p className="text-xs font-pixel text-white/90 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Bouton Partir */}
            <div className="pt-4">
              <Link
                href="/"
                className="block w-full rounded-lg font-pixel bg-zinc-800 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-white text-center"
              >
                Partir
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

