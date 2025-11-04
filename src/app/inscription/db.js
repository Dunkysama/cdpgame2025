import pkg from "pg";
const { Pool } = pkg;

// Connexion PostgreSQL (hors Docker)
const pool = new Pool({
  host: "192.168.3.77",  // IP de ton serveur ou PC où tourne la BDD
  port: 5432,
  database: "postgres",  //  à modifier si ta vraie BDD s'appelle autrement
  user: "postgres",
  password: "admin",
});

pool.connect()
  .then(client => {
    console.log("✅ Connexion réussie à la base PostgreSQL !");
    client.release();
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à la base PostgreSQL :", err.message);
    process.exit(1);
  });

export default pool;
