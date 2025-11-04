import bcrypt from "bcryptjs";
import pool from "./db.js";

export async function registerUser({ email, username, password }) {
  try {
    if (!email || !username || !password) {
      return { status: 400, body: { error: "Champs manquants" } };
    }

    // email/username déjà pris ?
    const exists = await pool.query(
      "SELECT 1 FROM utilisateurs WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (exists.rows.length > 0) {
      return {
        status: 409,
        body: { error: "Email ou nom d'utilisateur déjà utilisé" },
      };
    }

    // hash du mot de passe
    const hash = await bcrypt.hash(password, 12);

    // insertion
    await pool.query(
      "INSERT INTO utilisateurs (email, username, mot_de_passe) VALUES ($1, $2, $3)",
      [email, username, hash]
    );

    return { status: 201, body: { ok: true, message: "Inscription réussie" } };
  } catch (err) {
    console.error("registerUser error:", err);
    return { status: 500, body: { error: "Erreur serveur" } };
  }
}
