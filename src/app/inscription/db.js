import pkg from "pg";
const { Pool } = pkg;

// Création du pool (pas de connexion immédiate)
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "192.168.3.77",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || "postgres",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "admin",
});

// Fonction helper pour vérifier la connexion (optionnelle)
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Connexion réussie à la base PostgreSQL !");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ Erreur de connexion PostgreSQL :", err.message);
    return false;
  }
}

export default pool;