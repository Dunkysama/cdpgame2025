import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "./db.js";

export async function POST(req) {
  try {
    const { email, username, password } = await req.json();
    if (!email || !username || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const exists = await pool.query(
      "SELECT 1 FROM utilisateurs WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: "Email ou nom d'utilisateur déjà utilisé" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO utilisateurs (email, username, mot_de_passe) VALUES ($1, $2, $3)",
      [email, username, hash]
    );

    return NextResponse.json({ ok: true, message: "Compte créé avec succès !" }, { status: 201 });
  } catch (e) {
    console.error("POST /inscription error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
