import pkg from "pg";
const { Pool } = pkg;

// Utilise les variables d'environnement si disponibles, sinon fallback locaux
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "192.168.3.77",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || "postgres",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "admin",
});

pool.connect()
  .then((client) => {
    console.log("✅ Connexion réussie à la base PostgreSQL !");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion PostgreSQL :", err.message);
    process.exit(1);
  });


export default pool;