import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifySessionToken } from "@/app/utils/session";
import pool from "@/app/inscription/db";

export async function PUT(req) {
  try {
    const store = await cookies();
    const token = store.get("session")?.value;
    const payload = token ? await verifySessionToken(token) : null;
    if (!payload?.sub) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newPassword = String(body?.newPassword || body?.password || "").trim();

    if (!newPassword) {
      return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE Utilisateurs SET mot_de_passe = $2 WHERE id_utilisateur = $1`,
      [Number(payload.sub), hash]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/profil/password PUT error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Optionnel: accepter POST aussi
export const POST = PUT;
