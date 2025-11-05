"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DeconnexionButton from "../components/DeconnexionButton";

export default function ProfilPage() {
  const [avatars, setAvatars] = useState([]);
  const [profilPseudo, setProfilPseudo] = useState("Joueur");
  const [profilImage, setProfilImage] = useState("/avatars/humain_male.png");
  const [profilEmail, setProfilEmail] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPseudo, setEditPseudo] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
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

      // Charger l'email du profil utilisateur
      const savedEmail = localStorage.getItem("profilEmail");
      if (savedEmail) {
        setProfilEmail(savedEmail);
        setEditEmail(savedEmail);
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
    }
  }, []);

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

      // Créer une URL d'object pour prévisualiser l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageButtonClick = () => {
    const input = document.getElementById('image-upload-input');
    input?.click();
  };

  const getAvatarImagePath = (avatar) => {
    return `/avatars/${avatar.race}_${avatar.sexe}.png`;
  };

  // Badges factices pour l'instant (à remplacer par de vrais badges plus tard)
  const badges = [
    { id: 1, name: "Badge 1" },
    { id: 2, name: "Badge 2" },
    { id: 3, name: "Badge 3" },
  ];

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
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
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
            <h3 className="text-xl font-bold font-pixel text-white md:w-32 flex-shrink-0">
              Badge
            </h3>
            <div className="flex mt-8 ml-20 gap-20 flex-wrap">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="w-24 h-24 rounded-full border-2 border-zinc-600 bg-zinc-800 flex items-center justify-center"
                >
                  <span className="text-xs font-pixel text-white/70 text-center px-2">
                    Badge
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Personnages */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <h3 className="text-xl font-bold font-pixel text-white md:w-32 flex-shrink-0">
              Personnages
            </h3>
            <div className="flex ml-20 mt-8 gap-20 flex-wrap">
              {avatars.length > 0 ? (
                avatars.slice(0, 3).map((avatar, index) => (
                  <div
                    key={index}
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
                    <div className="relative z-10 bg-zinc-900/80 rounded-lg px-2 py-1 text-center">
                      <p className="text-[8px] font-pixel text-white">
                        Badge
                      </p>
                      <p className="text-[8px] font-pixel text-white">
                        {avatar.niveau || 1}xp
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // Afficher des placeholders si aucun avatar
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-24 h-24 rounded-full border-2 border-zinc-600 bg-zinc-800 flex flex-col items-center justify-center"
                  >
                    <p className="text-[8px] font-pixel text-white/70 text-center px-2">
                      Badge
                    </p>
                    <p className="text-[8px] font-pixel text-white/70 text-center px-2">
                      70xp
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de modification */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border-2 border-white rounded-lg p-8 max-w-3xl mx-4 w-full">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Section gauche - Avatar circulaire */}
                <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4">
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
      </div>
    </div>
  );
}

