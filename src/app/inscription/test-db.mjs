import pool from "./db.js";

async function main() {
  console.log("🔄 Test de connexion à PostgreSQL…");
  try {
    const client = await pool.connect();

    // 1) Ping simple
    const now = await client.query("SELECT NOW() AS now");
    console.log("✅ Connecté ! Heure serveur :", now.rows[0].now);

    // 2) Vérifie que la table 'utilisateurs' existe
    const t = await client.query(
      "SELECT to_regclass('public.utilisateurs') AS exists"
    );
    if (!t.rows[0].exists) {
      console.log("⚠️ Table 'utilisateurs' introuvable dans ce schéma/base.");
      console.log("   Crée-la avec :");
      console.log(`   CREATE TABLE IF NOT EXISTS utilisateurs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(150) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`);
    } else {
      console.log("✅ Table 'utilisateurs' trouvée.");
      // 3) Lis quelques lignes pour vérifier l’accès
      const rows = await client.query(
        "SELECT id, email, username, mot_de_passe FROM utilisateurs ;"
      );
      console.table(rows.rows);
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error("❌ Connexion/requête échouée :", err.message);
    process.exit(1);
  }
}

main();
