import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/app/utils/session";
import pool from "@/app/inscription/db";

export async function GET() {
  try {
    const store = await cookies();
    const token = store.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const userId = Number(payload.sub);

    // Tente la requête avec id_personnage (schema courant)
    let rows;
    try {
      const res = await pool.query(
        `SELECT id_personnage AS id, pseudo, sexe, race, chemin_avatar, temps_de_jeu
         FROM personnages
         WHERE id_utilisateur = $1 AND date_suppression IS NULL
         ORDER BY id_personnage ASC`,
        [userId]
      );
      rows = res.rows;
    } catch (e) {
      // Fallback pour ancien schéma sans id_personnage
      const res = await pool.query(
        `SELECT pseudo, sexe, race, chemin_avatar, temps_de_jeu
         FROM personnages
         WHERE id_utilisateur = $1 AND (date_suppression IS NULL OR date_suppression = 'epoch'::timestamp)`,
        [userId]
      );
      rows = res.rows.map((r, idx) => ({ ...r, id: idx + 1 }));
    }

    const personnages = rows.map((r) => ({
      id: r.id,
      pseudo: r.pseudo,
      sexe: r.sexe || null,
      race: r.race || null,
      // Fallback avatar par défaut si aucun chemin en BDD
      imagePath: r.chemin_avatar || "/asset/Humain-male.png",
      tempsDeJeu: typeof r.temps_de_jeu === "number" ? r.temps_de_jeu : 0,
    }));

    return NextResponse.json({ ok: true, personnages });
  } catch (err) {
    console.error("/api/personnages error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Création d'un personnage (authentifié)
export async function POST(req) {
  try {
    const store = await cookies();
    const token = store.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }
    const userId = Number(payload.sub);

    const body = await req.json().catch(() => ({}));
    const pseudo = (body?.pseudo || "").toString().trim();
    const race = (body?.race || "").toString().toLowerCase();
    const sexe = (body?.sexe || "").toString().toLowerCase();
    const imagePathFromClient = body?.imagePath ? String(body.imagePath) : null;

    if (!pseudo) {
      return NextResponse.json({ error: "Le pseudo est requis" }, { status: 400 });
    }
    if (pseudo.length > 20) {
      return NextResponse.json({ error: "Le pseudo est trop long (20 max)" }, { status: 400 });
    }

    const RACES = new Set(["humain", "elfe", "nain"]);
    const SEXES = new Set(["male", "femelle"]);
    if (!RACES.has(race)) {
      return NextResponse.json({ error: "Race invalide" }, { status: 400 });
    }
    if (!SEXES.has(sexe)) {
      return NextResponse.json({ error: "Sexe invalide" }, { status: 400 });
    }

    // Limite de 3 personnages actifs par utilisateur
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS cnt
       FROM personnages
       WHERE id_utilisateur = $1 AND date_suppression IS NULL`,
      [userId]
    );
    const cnt = countRes.rows?.[0]?.cnt ?? 0;
    if (cnt >= 3) {
      return NextResponse.json({ error: "Limite de 3 personnages atteinte" }, { status: 400 });
    }

    // Déduire le chemin d'image si non fourni
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const chemin_avatar = imagePathFromClient || `/asset/${cap(race)}-${cap(sexe)}.png`;

    // Insertion
    let inserted;
    try {
      const ins = await pool.query(
        `INSERT INTO personnages (id_utilisateur, pseudo, sexe, race, chemin_avatar, temps_de_jeu)
         VALUES ($1, $2, $3, $4, $5, 0)
         RETURNING id_personnage AS id, pseudo, sexe, race, chemin_avatar, temps_de_jeu`,
        [userId, pseudo, sexe, race, chemin_avatar]
      );
      inserted = ins.rows[0];
    } catch (e) {
      // Fallback: si colonne temps_de_jeu ou id_personnage diffère, minimal RETURNING
      const ins = await pool.query(
        `INSERT INTO personnages (id_utilisateur, pseudo, sexe, race, chemin_avatar)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, pseudo, sexe, race, chemin_avatar]
      );
      const r = ins.rows[0];
      inserted = {
        id: r.id_personnage || r.id || null,
        pseudo: r.pseudo,
        sexe: r.sexe,
        race: r.race,
        chemin_avatar: r.chemin_avatar || null,
        temps_de_jeu: typeof r.temps_de_jeu === "number" ? r.temps_de_jeu : 0,
      };
    }

    const personnage = {
      id: inserted.id,
      pseudo: inserted.pseudo,
      sexe: inserted.sexe,
      race: inserted.race,
      imagePath: inserted.chemin_avatar || null,
      tempsDeJeu: typeof inserted.temps_de_jeu === "number" ? inserted.temps_de_jeu : 0,
    };

    return NextResponse.json({ ok: true, personnage }, { status: 201 });
  } catch (err) {
    console.error("/api/personnages POST error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Suppression logique (soft delete): marque date_suppression = maintenant
export async function DELETE(req) {
  try {
    const store = await cookies();
    const token = store.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const userId = Number(payload.sub);

    // Récupère l'id du personnage à supprimer depuis ?id=... ou corps JSON { id }
    const url = new URL(req.url);
    let idStr = url.searchParams.get("id");
    if (!idStr) {
      try {
        const body = await req.json();
        if (body?.id) idStr = String(body.id);
      } catch {}
    }
    const personnageId = Number(idStr);
    if (!personnageId || Number.isNaN(personnageId)) {
      return NextResponse.json({ error: "Paramètre id manquant ou invalide" }, { status: 400 });
    }

    // Marque comme supprimé uniquement si le personnage appartient à l'utilisateur et pas déjà supprimé
    const result = await pool.query(
      `UPDATE personnages
       SET date_suppression = NOW()
       WHERE id_personnage = $1 AND id_utilisateur = $2 AND date_suppression IS NULL
       RETURNING id_personnage`,
      [personnageId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "Introuvable ou déjà supprimé" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/personnages DELETE error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}