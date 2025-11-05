// src/connexion/connexion_back.js
import bcrypt from "bcryptjs";
// db.js est situé sous src/app/inscription/db.js
import pool from "@/app/inscription/db";

export async function loginUser({ email, password }) {
  try {
    if (!email || !password) {
      return { status: 400, body: { error: "Email et mot de passe requis" } };
    }

    const { rows } = await pool.query(
      `SELECT id_utilisateur AS id, nom_utilisateur, email, mot_de_passe
       FROM Utilisateurs
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return { status: 401, body: { error: "Email ou mot de passe incorrect" } };
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.mot_de_passe);
    if (!ok) {
      return { status: 401, body: { error: "Email ou mot de passe incorrect" } };
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
