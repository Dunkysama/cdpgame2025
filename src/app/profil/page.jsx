"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUnlockedBadges, getSelectedBadge, selectBadge, BADGES } from "@/app/utils/badges";
import DeconnexionButton from "../components/DeconnexionButton";

export default function ProfilPage() {
  const [avatars, setAvatars] = useState([]);
  const [profilPseudo, setProfilPseudo] = useState("Joueur");
  const [profilImage, setProfilImage] = useState("/asset/humain_male.png");
  const [profilEmail, setProfilEmail] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPseudo, setEditPseudo] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [keySequence, setKeySequence] = useState([]);
  const [fireworks, setFireworks] = useState([]);

  // Séquence de touches pour l'easter egg : haut, bas, bas
  const easterEggSequence = ['ArrowUp', 'ArrowDown', 'ArrowDown'];

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1) Tenter de charger depuis l'API (session) puis fallback localStorage
      (async () => {
        try {
          const meRes = await fetch("/api/me", { cache: "no-store" });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me?.user?.username) setProfilPseudo(me.user.username);
            if (me?.user?.email) setProfilEmail(me.user.email);
          }
            // Charger les personnages du joueur
            const persRes = await fetch("/api/personnages", { cache: "no-store" });
            if (persRes.ok) {
              const data = await persRes.json();
              setAvatars(Array.isArray(data.personnages) ? data.personnages : []);
            }
        } catch {}
      })();
      // Charger le pseudo du profil utilisateur
      const savedPseudo = localStorage.getItem("profilPseudo");
      if (savedPseudo) {
        setProfilPseudo(savedPseudo);
        setEditPseudo(savedPseudo);
      }

      // Charger l'image du profil utilisateur
      const savedImage = localStorage.getItem("profilImage");
      if (savedImage) {
        setProfilImage(savedImage);
        setEditImage(savedImage);
      }

      // Charger l'email du profil utilisateur (fallback si pas de session)
      const savedEmail = localStorage.getItem("profilEmail");
      if (savedEmail) {
        setProfilEmail((prev) => prev || savedEmail);
        setEditEmail((prev) => prev || savedEmail);
      }

      // Charger les avatars (personnages)
      const savedAvatars = localStorage.getItem("avatars");
      if (savedAvatars) {
        try {
          const parsedAvatars = JSON.parse(savedAvatars);
          setAvatars(parsedAvatars);
        } catch (e) {
          console.error("Erreur lors du chargement des avatars:", e);
        }
      }

      // Charger les badges débloqués
      const badges = getUnlockedBadges();
      setUnlockedBadges(badges);

      // Charger le badge sélectionné
      const selected = getSelectedBadge();
      setSelectedBadgeId(selected);
    }
  }, []);

  // Gestion de l'easter egg avec les touches fléchées
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorer si on est dans un input ou textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Vérifier si c'est une flèche
      if (e.key.startsWith('Arrow')) {
        setKeySequence((prev) => {
          const newSequence = [...prev, e.key].slice(-easterEggSequence.length);
          
          // Vérifier si la séquence correspond
          if (newSequence.length === easterEggSequence.length) {
            const matches = newSequence.every((key, index) => key === easterEggSequence[index]);
            if (matches) {
              setShowEasterEgg(true);
              return []; // Réinitialiser la séquence
            }
          }
          
          return newSequence;
        });
      } else {
        // Réinitialiser la séquence si ce n'est pas une flèche
        setKeySequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Générer les feux d'artifice quand l'easter egg s'ouvre
  useEffect(() => {
    if (showEasterEgg) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088', '#ff4444', '#44ff44'];
      const newFireworks = [];
      
      // Créer plusieurs explosions depuis différents points
      const explosionPoints = [
        { x: 50, y: 30 }, // Centre haut
        { x: 25, y: 50 }, // Gauche
        { x: 75, y: 50 }, // Droite
        { x: 50, y: 70 }, // Centre bas
      ];

      explosionPoints.forEach((point, explosionIndex) => {
        // Créer 80 particules par explosion
        for (let i = 0; i < 80; i++) {
          const angle = (Math.PI * 2 * i) / 80; // Répartition en cercle
          const velocity = 2 + Math.random() * 3; // Vitesse variable
          const vx = Math.cos(angle) * velocity;
          const vy = Math.sin(angle) * velocity;
          
          newFireworks.push({
            id: `${explosionIndex}-${i}`,
            x: point.x,
            y: point.y,
            vx: vx,
            vy: vy,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2 + Math.random() * 3,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.01,
            delay: explosionIndex * 0.2,
          });
        }
      });

      setFireworks(newFireworks);
      
      // Injecter les keyframes dynamiques dans le document
      const styleId = 'firework-animations';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      let keyframesCSS = '';
      newFireworks.forEach((particle) => {
        const duration = 1.5 + Math.random() * 0.5;
        const distance = 150 + Math.random() * 100;
        const xEnd = particle.x + particle.vx * distance;
        const yEnd = particle.y + particle.vy * distance;
        const xMove = (xEnd - particle.x) * 10;
        const yMove = (yEnd - particle.y) * 10;
        
        keyframesCSS += `
          @keyframes firework-${particle.id.replace(/[^a-zA-Z0-9]/g, '-')} {
            0% {
              transform: translate(0, 0);
              opacity: 1;
            }
            100% {
              transform: translate(${xMove}px, ${yMove}px);
              opacity: 0;
            }
          }
        `;
      });
      
      styleElement.textContent = keyframesCSS;
      
      return () => {
        // Nettoyer les animations quand le composant se démonte
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      };
    } else {
      setFireworks([]);
      const styleElement = document.getElementById('firework-animations');
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    }
  }, [showEasterEgg]);

  const handleEditInfo = () => {
    setEditPseudo(profilPseudo);
    setEditImage(profilImage);
    setEditEmail(profilEmail);
    setEditPassword("");
    setEditConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (typeof window !== "undefined") {
      // Vérifier que les mots de passe correspondent si un nouveau mot de passe est saisi
      if (editPassword && editPassword !== editConfirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }

      localStorage.setItem("profilPseudo", editPseudo);
      localStorage.setItem("profilImage", editImage);
      if (editEmail) {
        localStorage.setItem("profilEmail", editEmail);
        setProfilEmail(editEmail);
      }
      if (editPassword) {
        localStorage.setItem("profilPassword", editPassword);
      }
      setProfilPseudo(editPseudo);
      setProfilImage(editImage);
      setShowEditModal(false);
    }
  };

  const handleCancelEdit = () => {
    setEditPseudo(profilPseudo);
    setEditImage(profilImage);
    setEditEmail(profilEmail);
    setEditPassword("");
    setEditConfirmPassword("");
    setShowEditModal(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        alert("Veuillez sélectionner une image");
        return;
      }

      // Upload côté serveur pour enregistrer dans public/profil_image
      (async () => {
        try {
          const form = new FormData();
          form.append("file", file);
          form.append("pseudo", profilPseudo || "");

          const upRes = await fetch("/api/profil/image", { method: "POST", body: form });
          if (!upRes.ok) {
            const err = await upRes.json().catch(() => ({}));
            throw new Error(err?.error || `Erreur upload (${upRes.status})`);
          }
          const data = await upRes.json();
          if (data?.path) {
            // Utiliser le chemin public renvoyé pour l'aperçu et l'enregistrement ultérieur
            setEditImage(data.path);
          }
        } catch (err) {
          console.error("Upload image profil échoué:", err);
          // Fallback: aperçu local uniquement si l'upload échoue
          try {
            const reader = new FileReader();
            reader.onloadend = () => setEditImage(reader.result);
            reader.readAsDataURL(file);
          } catch {}
        }
      })();
    }
  };

  const handleImageButtonClick = () => {
    const input = document.getElementById('image-upload-input');
    input?.click();
  };

  const getAvatarImagePath = (avatar) => {
     // Priorité au chemin renvoyé par le serveur
     if (avatar?.imagePath) return avatar.imagePath;
     // Sinon, reconstituer depuis race/sexe avec le format /asset/Race-Sexe.png
     const race = (avatar?.race || "Humain").toString();
     const sexe = (avatar?.sexe || "male").toString();
     const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
     return `/asset/${cap(race)}-${cap(sexe)}.png`;
  };

  const handleBadgeClick = (badgeId) => {
    if (selectedBadgeId === badgeId) {
      // Désélectionner le badge
      selectBadge(null);
      setSelectedBadgeId(null);
    } else {
      // Sélectionner le badge
      selectBadge(badgeId);
      setSelectedBadgeId(badgeId);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative">
      <div className="w-full max-w-4xl px-6 relative z-10">
        {/* Bouton retour */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-block rounded-lg font-pixel bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            ← RETOUR
          </Link>
        </div>

        {/* Section Informations utilisateur */}
        <div className="mb-8 pb-8 border-b-2 border-zinc-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Photo de profil circulaire */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
              <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-zinc-800 relative">
                {profilImage ? (
                  profilImage.startsWith('data:') ? (
                    // Utiliser une balise img normale pour les données base64
                    <img
                      src={profilImage}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={profilImage}
                      alt="Photo de profil"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                    <div className="text-4xl">👤</div>
                  </div>
                )}
                {/* Badge sélectionné en miniature (bas droite) */}
                {selectedBadgeId && (() => {
                  const badge = Object.values(BADGES).find(b => b.id === selectedBadgeId);
                  return badge ? (
                    <div className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-zinc-900 flex items-center justify-center overflow-hidden">
                      <Image
                        src={badge.image}
                        alt={badge.name}
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Pseudo et bouton modifier */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold font-pixel text-white mb-4">
                {profilPseudo}
              </h2>
              <button
                onClick={handleEditInfo}
                className="rounded-lg font-pixel bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-zinc-600"
              >
                Modifier mes info
              </button>
            </div>
            <DeconnexionButton />
          </div>
        </div>

        {/* Section Badges */}
        <div className="mt-8 mb-8 pb-8 border-b-2 border-zinc-700">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <h3 className="text-xl font-bold font-pixel text-white md:w-32 shrink-0">
              Badges
            </h3>
            <div className="flex mt-8 ml-20 gap-8 flex-wrap">
              {Object.values(BADGES).map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                const isSelected = selectedBadgeId === badge.id;
                return (
                  <div key={badge.id} className="relative group">
                    <div
                      onClick={() => {
                        if (isUnlocked) {
                          handleBadgeClick(badge.id);
                        }
                      }}
                      className={`w-24 h-24 rounded-full border-2 ${
                        isSelected 
                          ? 'border-yellow-400 bg-yellow-400/20' 
                          : isUnlocked
                          ? 'border-zinc-600 bg-zinc-800 hover:border-zinc-500 cursor-pointer'
                          : 'border-zinc-700 bg-zinc-900 cursor-not-allowed opacity-50'
                      } flex items-center justify-center transition-all relative overflow-hidden`}
                      title={isUnlocked ? badge.description : `Débloquer : ${badge.description}`}
                    >
                      <div className={`w-full h-full flex items-center justify-center ${
                        isUnlocked ? '' : 'blur-sm'
                      }`}>
                        <Image
                          src={badge.image}
                          alt={badge.name}
                          width={80}
                          height={80}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <span className="text-[8px] text-black">✓</span>
                        </div>
                      )}
                    </div>
                    {/* Tooltip avec encadré au hover pour les badges non débloqués */}
                    {!isUnlocked && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-zinc-900 border-2 border-white rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                        <div className="space-y-2">
                          <div className="border-b border-zinc-700 pb-2">
                            <p className="text-xs font-pixel text-white font-bold">
                              {badge.name}
                            </p>
                          </div>
                          <p className="text-[10px] font-pixel text-white/90 leading-relaxed">
                            {badge.unlockHint || badge.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Personnages */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <h3 className="text-xl font-bold font-pixel text-white md:w-32 shrink-0">
              Personnages
            </h3>
            <div className="flex ml-20 mt-8 gap-20 flex-wrap">
              {avatars.length > 0 ? (
                avatars.slice(0, 3).map((avatar, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="w-24 h-24 rounded-full border-2 border-zinc-600 bg-zinc-800 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={getAvatarImagePath(avatar)}
                          alt={`Avatar ${avatar.race} ${avatar.sexe}`}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] font-pixel text-white text-center max-w-24 truncate">
                      {avatar.pseudo || "Sans nom"}
                    </p>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>

        {/* Modal de modification */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border-2 border-white rounded-lg p-8 max-w-3xl mx-4 w-full">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Section gauche - Avatar circulaire */}
                <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-zinc-800 relative">
                      {(editImage || profilImage) ? (
                        editImage && editImage.startsWith('data:') ? (
                          // Utiliser une balise img normale pour les données base64
                          <img
                            src={editImage}
                            alt="Photo de profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={editImage || profilImage}
                            alt="Photo de profil"
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                          <div className="text-6xl">👤</div>
                        </div>
                      )}
                      {/* Badge sélectionné en miniature dans le modal */}
                      {selectedBadgeId && (() => {
                        const badge = Object.values(BADGES).find(b => b.id === selectedBadgeId);
                        return badge ? (
                          <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full border-2 border-white bg-zinc-900 flex items-center justify-center overflow-hidden">
                            <Image
                              src={badge.image}
                              alt={badge.name}
                              width={48}
                              height={48}
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleImageButtonClick}
                    className="rounded-lg font-pixel bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 border-2 border-transparent hover:border-zinc-600"
                  >
                    Importer une image
                  </button>
                </div>

                {/* Section droite - Formulaire */}
                <div className="flex-1">
                  <div className="space-y-6">
                    {/* Pseudo avec checkbox */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-pixel text-white mb-2">
                          Pseudo
                        </label>
                        <input
                          type="text"
                          value={editPseudo}
                          onChange={(e) => setEditPseudo(e.target.value)}
                          className="w-full rounded-lg font-pixel text-xs border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 focus:border-white focus:outline-none"
                          placeholder="Votre pseudo"
                        />
                      </div>
                      <div className="mt-8">
                        <input
                          type="checkbox"
                          className="w-5 h-5 border-2 border-zinc-600 bg-zinc-800 rounded focus:ring-2 focus:ring-white"
                        />
                      </div>
                    </div>

                    {/* Email avec checkbox */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-pixel text-white mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-lg font-pixel text-xs border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 focus:border-white focus:outline-none"
                          placeholder="example@example.com"
                        />
                      </div>
                      <div className="mt-8">
                        <input
                          type="checkbox"
                          className="w-5 h-5 border-2 border-zinc-600 bg-zinc-800 rounded focus:ring-2 focus:ring-white"
                        />
                      </div>
                    </div>

                    {/* Mot de passe avec checkbox */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-pixel text-white mb-2">
                          Mot de passe
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full rounded-lg font-pixel text-xs border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 focus:border-white focus:outline-none"
                          placeholder="************"
                        />
                      </div>
                      <div className="mt-8">
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          className="w-5 h-5 border-2 border-zinc-600 bg-zinc-800 rounded focus:ring-2 focus:ring-white"
                        />
                      </div>
                    </div>

                    {/* Confirmer le mot de passe */}
                    <div>
                      <label className="block text-sm font-pixel text-white mb-2">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        className="w-full rounded-lg font-pixel text-xs border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 focus:border-white focus:outline-none"
                        placeholder=""
                      />
                    </div>

                    {/* Bouton Sauvegarder */}
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleSaveEdit}
                        className="rounded-lg font-pixel bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 border-2 border-transparent hover:border-white"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Easter Egg */}
        {showEasterEgg && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden"
            onClick={() => setShowEasterEgg(false)}
          >
            {/* Particules de feu d'artifice */}
            {fireworks.map((particle) => {
              const duration = 1.5 + Math.random() * 0.5;
              const distance = 150 + Math.random() * 100;
              const xEnd = particle.x + particle.vx * distance;
              const yEnd = particle.y + particle.vy * distance;
              const xMove = (xEnd - particle.x) * 10;
              const yMove = (yEnd - particle.y) * 10;
              const animationName = `firework-${particle.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
              
              return (
                <div
                  key={particle.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                    animation: `${animationName} ${duration}s ease-out ${particle.delay}s forwards`,
                  }}
                />
              );
            })}
            
            <div 
              className="bg-zinc-900 border-4 border-white rounded-lg p-8 max-w-2xl mx-4 relative z-10 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEasterEgg(false)}
                className="absolute top-4 right-4 text-white hover:text-zinc-400 text-2xl font-bold z-20"
                aria-label="Fermer"
              >
                ×
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-pixel text-white mb-4 animate-bounce">
                ⚠️ Message du BIGBOSS ⚠️
                </h2>
                
                {/* Bulle de texte */}
                <div className="relative mb-4 mx-auto max-w-md">
                  <div className="bg-white border-4 border-black rounded-2xl p-4 relative">
                    <div className="absolute -bottom-4 left-1/4 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-black"></div>
                    <div className="absolute -bottom-3 left-1/4 transform -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-t-7 border-transparent border-t-white"></div>
                    <p className="text-xs font-pixel text-black leading-relaxed">
                      N'oubliez surtout pas de rendre vos rapport d'activité le dernier Jeudi avant la fin de la période de travail
                    </p>
                  </div>
                </div>
                
                {/* Image réduite */}
                <div className="relative w-full h-auto flex justify-center">
                  <div className="w-64 h-64 relative">
                    <Image
                      src="/lea.png"
                      alt="Easter Egg"
                      width={256}
                      height={256}
                      className="object-contain w-full h-full rounded-lg"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

