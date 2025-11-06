import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/app/utils/session";
import pool from "@/app/inscription/db";

// GET : Récupérer la progression des mini-jeux pour un personnage
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const userId = Number(payload.sub);

    // Récupérer l'ID du personnage depuis les query params
    let idPersonnageParam = null;
    try {
      if (request && request.nextUrl) {
        idPersonnageParam = request.nextUrl.searchParams.get("idPersonnage");
      } else if (request && request.url) {
        const url = new URL(request.url);
        idPersonnageParam = url.searchParams.get("idPersonnage");
      }
    } catch (e) {
      console.error("Erreur lors du parsing de l'URL:", e);
    }

    if (!idPersonnageParam) {
      return NextResponse.json({ error: "ID de personnage requis" }, { status: 400 });
    }

    const idPersonnage = Number(idPersonnageParam);
    if (isNaN(idPersonnage)) {
      return NextResponse.json({ error: "ID de personnage invalide" }, { status: 400 });
    }

    // Vérifier que le personnage appartient à l'utilisateur
    const checkRes = await pool.query(
      `SELECT id_personnage FROM Personnages WHERE id_personnage = $1 AND id_utilisateur = $2 AND date_suppression IS NULL`,
      [idPersonnage, userId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "Personnage non trouvé ou n'appartient pas à l'utilisateur" }, { status: 404 });
    }

    // Récupérer la progression des mini-jeux
    let progressRes;
    try {
      progressRes = await pool.query(
        `SELECT nom_mini_jeu, pourcentage FROM boss_mini_progress WHERE id_personnage = $1`,
        [idPersonnage]
      );
    } catch (dbErr) {
      if (dbErr.message && dbErr.message.includes('does not exist')) {
        console.warn("Table boss_mini_progress n'existe pas encore:", dbErr.message);
        return NextResponse.json({ ok: true, progress: { furie: 0, sort: 0, epee: 0 }, penalty: 0 });
      }
      throw dbErr;
    }

    // Construire l'objet de progression
    const progress = { furie: 0, sort: 0, epee: 0 };
    progressRes.rows.forEach((row) => {
      const nomMiniJeu = row.nom_mini_jeu.toLowerCase();
      if (nomMiniJeu === 'furie' || nomMiniJeu === 'sort' || nomMiniJeu === 'epee') {
        progress[nomMiniJeu] = row.pourcentage;
      }
    });

    // Récupérer les pénalités de vies
    let penaltyRes;
    try {
      penaltyRes = await pool.query(
        `SELECT nombre_penalites FROM boss_lives_penalty WHERE id_personnage = $1`,
        [idPersonnage]
      );
    } catch (dbErr) {
      if (dbErr.message && dbErr.message.includes('does not exist')) {
        console.warn("Table boss_lives_penalty n'existe pas encore:", dbErr.message);
        return NextResponse.json({ ok: true, progress, penalty: 0 });
      }
      throw dbErr;
    }

    const penalty = penaltyRes.rows.length > 0 ? penaltyRes.rows[0].nombre_penalites : 0;

    return NextResponse.json({ ok: true, progress, penalty });
  } catch (err) {
    console.error("/api/boss-mini-progress GET error:", err);
    return NextResponse.json({ error: "Erreur serveur", details: err.message }, { status: 500 });
  }
}

// POST : Sauvegarder la progression d'un mini-jeu
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const userId = Number(payload.sub);
    const body = await req.json().catch(() => ({}));
    const nomMiniJeu = (body?.nomMiniJeu || "").toString().trim().toLowerCase();
    const pourcentage = body?.pourcentage ? Number(body.pourcentage) : null;
    const idPersonnage = body?.idPersonnage ? Number(body.idPersonnage) : null;
    const addPenalty = body?.addPenalty === true;

    // Validation
    if (!nomMiniJeu || !['furie', 'sort', 'epee'].includes(nomMiniJeu)) {
      return NextResponse.json({ error: "Nom de mini-jeu invalide (doit être: furie, sort, ou epee)" }, { status: 400 });
    }

    if (pourcentage === null || isNaN(pourcentage) || pourcentage < 0 || pourcentage > 100) {
      return NextResponse.json({ error: "Pourcentage invalide (doit être entre 0 et 100)" }, { status: 400 });
    }

    if (!idPersonnage || isNaN(idPersonnage)) {
      return NextResponse.json({ error: "ID de personnage invalide" }, { status: 400 });
    }

    // Vérifier que le personnage appartient à l'utilisateur
    const checkRes = await pool.query(
      `SELECT id_personnage FROM Personnages WHERE id_personnage = $1 AND id_utilisateur = $2 AND date_suppression IS NULL`,
      [idPersonnage, userId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "Personnage non trouvé ou n'appartient pas à l'utilisateur" }, { status: 404 });
    }

    // Sauvegarder ou mettre à jour la progression
    try {
      await pool.query(
        `INSERT INTO boss_mini_progress (id_personnage, nom_mini_jeu, pourcentage, date_completion)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (id_personnage, nom_mini_jeu) 
         DO UPDATE SET pourcentage = $3, date_completion = NOW()`,
        [idPersonnage, nomMiniJeu, pourcentage]
      );
    } catch (dbErr) {
      if (dbErr.message && dbErr.message.includes('does not exist')) {
        console.warn("Table boss_mini_progress n'existe pas encore, tentative de création...");
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS boss_mini_progress (
              id_progress SERIAL PRIMARY KEY,
              id_personnage INTEGER NOT NULL,
              nom_mini_jeu VARCHAR(32) NOT NULL,
              pourcentage INTEGER NOT NULL,
              date_completion TIMESTAMP DEFAULT NOW(),
              FOREIGN KEY(id_personnage) REFERENCES Personnages(id_personnage) ON DELETE CASCADE,
              UNIQUE(id_personnage, nom_mini_jeu)
            )
          `);
          await pool.query(
            `INSERT INTO boss_mini_progress (id_personnage, nom_mini_jeu, pourcentage, date_completion)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (id_personnage, nom_mini_jeu) 
             DO UPDATE SET pourcentage = $3, date_completion = NOW()`,
            [idPersonnage, nomMiniJeu, pourcentage]
          );
        } catch (createErr) {
          console.error("Erreur lors de la création de la table boss_mini_progress:", createErr);
          return NextResponse.json({ 
            error: "Erreur lors de la création de la table boss_mini_progress",
            details: createErr.message 
          }, { status: 500 });
        }
      } else {
        throw dbErr;
      }
    }

    // Si échec (< 75%), ajouter une pénalité de vie
    if (addPenalty && pourcentage < 75) {
      try {
        await pool.query(
          `INSERT INTO boss_lives_penalty (id_personnage, nombre_penalites, date_mise_a_jour)
           VALUES ($1, 1, NOW())
           ON CONFLICT (id_personnage) 
           DO UPDATE SET nombre_penalites = boss_lives_penalty.nombre_penalites + 1, date_mise_a_jour = NOW()`,
          [idPersonnage]
        );
      } catch (dbErr) {
        if (dbErr.message && dbErr.message.includes('does not exist')) {
          console.warn("Table boss_lives_penalty n'existe pas encore, tentative de création...");
          try {
            await pool.query(`
              CREATE TABLE IF NOT EXISTS boss_lives_penalty (
                id_penalty SERIAL PRIMARY KEY,
                id_personnage INTEGER NOT NULL,
                nombre_penalites INTEGER DEFAULT 0,
                date_mise_a_jour TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY(id_personnage) REFERENCES Personnages(id_personnage) ON DELETE CASCADE,
                UNIQUE(id_personnage)
              )
            `);
            await pool.query(
              `INSERT INTO boss_lives_penalty (id_personnage, nombre_penalites, date_mise_a_jour)
               VALUES ($1, 1, NOW())
               ON CONFLICT (id_personnage) 
               DO UPDATE SET nombre_penalites = boss_lives_penalty.nombre_penalites + 1, date_mise_a_jour = NOW()`,
              [idPersonnage]
            );
          } catch (createErr) {
            console.error("Erreur lors de la création de la table boss_lives_penalty:", createErr);
            // Ne pas échouer si la table de pénalités n'existe pas encore
          }
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Progression sauvegardée" }, { status: 200 });
  } catch (err) {
    console.error("/api/boss-mini-progress POST error:", err);
    return NextResponse.json({ error: "Erreur serveur", details: err.message }, { status: 500 });
  }
}

// DELETE : Réinitialiser la progression des mini-jeux pour un personnage
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const userId = Number(payload.sub);

    // Récupérer l'ID du personnage depuis les query params
    let idPersonnageParam = null;
    try {
      if (request && request.nextUrl) {
        idPersonnageParam = request.nextUrl.searchParams.get("idPersonnage");
      } else if (request && request.url) {
        const url = new URL(request.url);
        idPersonnageParam = url.searchParams.get("idPersonnage");
      }
    } catch (e) {
      console.error("Erreur lors du parsing de l'URL:", e);
    }

    if (!idPersonnageParam) {
      return NextResponse.json({ error: "ID de personnage requis" }, { status: 400 });
    }

    const idPersonnage = Number(idPersonnageParam);
    if (isNaN(idPersonnage)) {
      return NextResponse.json({ error: "ID de personnage invalide" }, { status: 400 });
    }

    // Vérifier que le personnage appartient à l'utilisateur
    const checkRes = await pool.query(
      `SELECT id_personnage FROM Personnages WHERE id_personnage = $1 AND id_utilisateur = $2 AND date_suppression IS NULL`,
      [idPersonnage, userId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "Personnage non trouvé ou n'appartient pas à l'utilisateur" }, { status: 404 });
    }

    // Supprimer la progression et les pénalités
    try {
      await pool.query(`DELETE FROM boss_mini_progress WHERE id_personnage = $1`, [idPersonnage]);
      await pool.query(`DELETE FROM boss_lives_penalty WHERE id_personnage = $1`, [idPersonnage]);
    } catch (dbErr) {
      // Si les tables n'existent pas encore, considérer comme réussi
      if (dbErr.message && dbErr.message.includes('does not exist')) {
        return NextResponse.json({ ok: true, message: "Progression réinitialisée" }, { status: 200 });
      }
      throw dbErr;
    }

    return NextResponse.json({ ok: true, message: "Progression réinitialisée" }, { status: 200 });
  } catch (err) {
    console.error("/api/boss-mini-progress DELETE error:", err);
    return NextResponse.json({ error: "Erreur serveur", details: err.message }, { status: 500 });
  }
}

