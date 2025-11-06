import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/app/utils/session";
import pool from "@/app/inscription/db";

// Récupérer les quiz complétés pour le personnage sélectionné
export async function GET(request) {
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

    // Récupérer l'ID du personnage depuis les query params si fourni
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

    let query;
    let params;

    if (idPersonnageParam) {
      // Si un ID de personnage est fourni, récupérer uniquement ses quiz complétés
      const idPersonnage = Number(idPersonnageParam);
      
      if (isNaN(idPersonnage)) {
        return NextResponse.json({ error: "ID de personnage invalide" }, { status: 400 });
      }

      // Vérifier que le personnage appartient à l'utilisateur
      const checkRes = await pool.query(
        `SELECT id_personnage FROM personnages 
         WHERE id_personnage = $1 AND id_utilisateur = $2 AND date_suppression IS NULL`,
        [idPersonnage, userId]
      );

      if (checkRes.rows.length === 0) {
        return NextResponse.json({ error: "Personnage non trouvé" }, { status: 404 });
      }

      query = `SELECT nom_quiz FROM quiz_completes WHERE id_personnage = $1`;
      params = [idPersonnage];
    } else {
      // Sinon, récupérer tous les quiz complétés pour tous les personnages de l'utilisateur
      query = `SELECT DISTINCT qc.nom_quiz
               FROM quiz_completes qc
               JOIN personnages p ON qc.id_personnage = p.id_personnage
               WHERE p.id_utilisateur = $1 AND p.date_suppression IS NULL`;
      params = [userId];
    }

    let res;
    try {
      res = await pool.query(query, params);
    } catch (dbErr) {
      // Si la table n'existe pas encore, retourner une liste vide
      if (dbErr.message && dbErr.message.includes('does not exist')) {
        console.warn("Table quiz_completes n'existe pas encore:", dbErr.message);
        return NextResponse.json({ ok: true, completedQuizzes: {} });
      }
      throw dbErr;
    }

    const completedQuizzes = {};
    res.rows.forEach((row) => {
      completedQuizzes[row.nom_quiz] = true;
    });

    return NextResponse.json({ ok: true, completedQuizzes });
  } catch (err) {
    console.error("/api/quiz-completes GET error:", err);
    return NextResponse.json({ error: "Erreur serveur", details: err.message }, { status: 500 });
  }
}

// Marquer un quiz comme complété
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
    const nomQuiz = (body?.nomQuiz || "").toString().trim();
    const idPersonnage = body?.idPersonnage ? Number(body.idPersonnage) : null;

    if (!nomQuiz) {
      return NextResponse.json({ error: "Nom du quiz requis" }, { status: 400 });
    }

    if (!idPersonnage) {
      return NextResponse.json({ error: "ID du personnage requis" }, { status: 400 });
    }

    // Vérifier que le personnage appartient à l'utilisateur
    const checkRes = await pool.query(
      `SELECT id_personnage FROM personnages 
       WHERE id_personnage = $1 AND id_utilisateur = $2 AND date_suppression IS NULL`,
      [idPersonnage, userId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "Personnage non trouvé ou n'appartient pas à l'utilisateur" }, { status: 404 });
    }

    // Insérer ou mettre à jour (ON CONFLICT pour éviter les doublons)
    try {
      await pool.query(
        `INSERT INTO quiz_completes (id_personnage, nom_quiz, date_completion)
         VALUES ($1, $2, NOW())
         ON CONFLICT (id_personnage, nom_quiz) 
         DO UPDATE SET date_completion = NOW()`,
        [idPersonnage, nomQuiz]
      );
    } catch (dbErr) {
      // Si la table n'existe pas encore, essayer de la créer
      if (dbErr.message && dbErr.message.includes('does not exist')) {
        console.warn("Table quiz_completes n'existe pas encore, tentative de création...");
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS quiz_completes (
              id_completion SERIAL PRIMARY KEY,
              id_personnage INTEGER NOT NULL,
              nom_quiz VARCHAR(64) NOT NULL,
              date_completion TIMESTAMP DEFAULT NOW(),
              FOREIGN KEY(id_personnage) REFERENCES Personnages(id_personnage) ON DELETE CASCADE,
              UNIQUE(id_personnage, nom_quiz)
            )
          `);
          // Réessayer l'insertion après création
          await pool.query(
            `INSERT INTO quiz_completes (id_personnage, nom_quiz, date_completion)
             VALUES ($1, $2, NOW())
             ON CONFLICT (id_personnage, nom_quiz) 
             DO UPDATE SET date_completion = NOW()`,
            [idPersonnage, nomQuiz]
          );
        } catch (createErr) {
          console.error("Erreur lors de la création de la table quiz_completes:", createErr);
          return NextResponse.json({ 
            error: "Erreur lors de la création de la table quiz_completes",
            details: createErr.message 
          }, { status: 500 });
        }
      } else {
        throw dbErr;
      }
    }

    return NextResponse.json({ ok: true, message: "Quiz marqué comme complété" }, { status: 200 });
  } catch (err) {
    console.error("/api/quiz-completes POST error:", err);
    return NextResponse.json({ error: "Erreur serveur", details: err.message }, { status: 500 });
  }
}

