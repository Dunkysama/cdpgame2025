import pool from "./db.js"; // ← ta connexion PostgreSQL

console.log("🔄 Tentative de connexion à la base de données...");

try {
  const res = await pool.query("SELECT NOW()");
  console.log("✅ Connexion OK ! Heure du serveur PostgreSQL :", res.rows[0].now);
  process.exit(0);
} catch (err) {
  console.error("❌ Erreur de connexion :", err.message);
  process.exit(1);
}
