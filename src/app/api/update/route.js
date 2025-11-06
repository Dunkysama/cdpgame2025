// src/app/api/utilisateurs/update/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function issueSessionCookie({ id, username, email }) {
  const token = await new SignJWT({ sub: String(id), username, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) {
      console.warn("[UPDATE] Pas de cookie session");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    let id_utilisateur = payload.sub;
    // ⚠️ Convertis selon ton schéma : int ou uuid ?
    // Si INT :
    if (id_utilisateur && typeof id_utilisateur === "string") {
      id_utilisateur = Number(id_utilisateur);
    }

    const { email, nom_utilisateur, mot_de_passe } = await req.json();

    const setParts = [];
    const values = [];
    let i = 1;
    const updatedFields = [];

    if (email && email.trim() !== "") {
      setParts.push(`email = $${i++}`);
      values.push(email.trim());
      updatedFields.push("email");
    }

    if (nom_utilisateur && nom_utilisateur.trim() !== "") {
      setParts.push(`nom_utilisateur = $${i++}`);
      values.push(nom_utilisateur.trim());
      updatedFields.push("nom_utilisateur");
    }

    if (mot_de_passe && mot_de_passe !== "") {
      const hash = await bcrypt.hash(mot_de_passe, 12);
      setParts.push(`mot_de_passe = $${i++}`);
      values.push(hash);
      updatedFields.push("mot_de_passe");
    }

    if (setParts.length === 0) {
      console.log("[UPDATE] Aucun champ à mettre à jour");
      return NextResponse.json({ message: "Aucune donnée à mettre à jour.", updatedFields: [] });
    }

    // ❗️Retire cette ligne si ta colonne n'existe pas
    // setParts.push(`updated_at = NOW()`);

    values.push(id_utilisateur);
    const whereIdCast = Number.isFinite(id_utilisateur) ? `$${i}::int` : `$${i}::uuid`;

    const sql = `
      UPDATE utilisateurs
      SET ${setParts.join(", ")}
      WHERE id_utilisateur = ${whereIdCast}
      RETURNING id_utilisateur, email, nom_utilisateur
    `;

    console.log("[UPDATE] SQL:", sql, "values:", values, "updatedFields:", updatedFields);

    const client = await pool.connect();
    let row;
    try {
      const { rows } = await client.query(sql, values);
      if (rows.length === 0) {
        console.warn("[UPDATE] Utilisateur introuvable pour id:", id_utilisateur);
        return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
      }
      row = rows[0];
    } finally {
      client.release();
    }

    // Re-signer le cookie si username/email ont changé
    await issueSessionCookie({
      id: row.id_utilisateur,
      username: row.nom_utilisateur,
      email: row.email,
    });

    return NextResponse.json({
      message: "Profil mis à jour",
      user: row,
      updatedFields,
    });
  } catch (err) {
    console.error("[UPDATE] Erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
