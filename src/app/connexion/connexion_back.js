// src/connexion/connexion_back.js
import bcrypt from "bcryptjs";
// Adapte ce chemin si besoin : dans ton screen, db.js est sous src/inscription/db.js
import pool from "@/inscription/db";

export async function loginUser({ username, password }) {
  try {
    if (!username || !password) {
      return { status: 400, body: { error: "Nom d'utilisateur et mot de passe requis" } };
    }

    const { rows } = await pool.query(
      `SELECT id, nom_utilisateur, email, mot_de_passe
       FROM Utilisateurs
       WHERE nom_utilisateur = $1
       LIMIT 1`,
      [username]
    );

    if (!rows.length) {
      return { status: 401, body: { error: "Nom d'utilisateur ou mot de passe incorrect" } };
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.mot_de_passe);
    if (!ok) {
      return { status: 401, body: { error: "Nom d'utilisateur ou mot de passe incorrect" } };
    }

    // ✅ important: renvoyer nom_utilisateur dans username
    return {
      status: 200,
      body: {
        ok: true,
        user: { id: user.id, username: user.nom_utilisateur, email: user.email },
      },
    };
  } catch (err) {
    console.error("loginUser error:", err);
    return { status: 500, body: { error: "Erreur serveur" } };
  }
}
