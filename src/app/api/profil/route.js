import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/app/inscription/db";
import { verifySessionToken, createSessionToken } from "@/app/utils/session";

export async function PUT(req) {
  try {
    const store = await cookies();
    const token = store.get("session")?.value;
    const payload = token ? await verifySessionToken(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = Number(payload.sub);

    const body = await req.json().catch(() => ({}));
    const nom_utilisateur = body?.nom_utilisateur?.toString().trim();
    const email = body?.email?.toString().trim();

    if (!nom_utilisateur && !email) {
      return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Unicité basique (si souhaitée) — ignorer si identique à l'existant
    if (email) {
      const { rows } = await pool.query(
        `SELECT 1 FROM Utilisateurs WHERE email = $1 AND id_utilisateur <> $2 LIMIT 1`,
        [email, userId]
      );
      if (rows.length) {
        return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
      }
    }
    if (nom_utilisateur) {
      const { rows } = await pool.query(
        `SELECT 1 FROM Utilisateurs WHERE nom_utilisateur = $1 AND id_utilisateur <> $2 LIMIT 1`,
        [nom_utilisateur, userId]
      );
      if (rows.length) {
        return NextResponse.json({ error: "Nom d'utilisateur déjà utilisé" }, { status: 409 });
      }
    }

    // Construire la requête UPDATE dynamiquement
    const sets = [];
    const values = [];
    let idx = 1;
    if (nom_utilisateur) {
      sets.push(`nom_utilisateur = $${idx++}`);
      values.push(nom_utilisateur);
    }
    if (email) {
      sets.push(`email = $${idx++}`);
      values.push(email);
    }
    values.push(userId);

    const sql = `UPDATE Utilisateurs SET ${sets.join(", ")} WHERE id_utilisateur = $${idx} RETURNING id_utilisateur AS id, nom_utilisateur, email`;
    const result = await pool.query(sql, values);
    const updated = result.rows[0];

    // Ré émettre un cookie de session avec les nouvelles infos (username/email)
    const newToken = await createSessionToken({ id: updated.id, username: updated.nom_utilisateur, email: updated.email });
    const res = NextResponse.json({ ok: true, user: { id: updated.id, username: updated.nom_utilisateur, email: updated.email } });
    res.cookies.set("session", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("/api/profil PUT error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = PUT;
