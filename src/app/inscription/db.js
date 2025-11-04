import pkg from "pg";
const { Pool } = pkg;

// Lis d'abord les variables d'env, sinon fallback utiles pour local
const pool = new Pool({
  host: "192.168.3.77",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "admin",
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