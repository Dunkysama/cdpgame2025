import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "./db.js"; // Connexion PostgreSQL

export async function POST(req) {
  try {
    // 1. Récupération des données du formulaire
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // 2. Vérifier si l'utilisateur existe déjà (email ou username)
    const exists = await pool.query(
      "SELECT 1 FROM utilisateurs WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (exists.rows.length > 0) {
      return NextResponse.json(
        { error: "Email ou nom d'utilisateur déjà utilisé" },
        { status: 409 }
      );
    }

    // 3. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Insérer dans la base PostgreSQL (colonne: mot_de_passe)
    await pool.query(
      "INSERT INTO utilisateurs (email, username, mot_de_passe) VALUES ($1, $2, $3)",
      [email, username, hashedPassword]
    );

    // 5. Retour succès
    return NextResponse.json(
      { message: "✅ Compte créé avec succès !" },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Erreur POST /inscription :", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

