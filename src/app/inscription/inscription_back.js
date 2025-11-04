import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "./db.js";   // connexion à ta base PostgreSQL

export async function POST(req) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Vérifier si utilisateur déjà existant
    const exists = await pool.query(
      "SELECT 1 FROM utilisateurs WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (exists.rows.length > 0) {
      return NextResponse.json({ error: "Email ou nom d'utilisateur déjà utilisé" }, { status: 409 });
    }

    // Hash du mot de passe
    const hash = await bcrypt.hash(password, 12);

    // Insertion dans la table avec la colonne 'mot_de_passe'
    await pool.query(
      "INSERT INTO utilisateurs (email, username, mot_de_passe) VALUES ($1, $2, $3)",
      [email, username, hash]
    );

    return NextResponse.json({ ok: true, message: "Inscription réussie !" }, { status: 201 });

  } catch (error) {
    console.error("Erreur backend inscription :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
