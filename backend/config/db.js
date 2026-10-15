const { Pool } = require("pg");

// Always verify the database's TLS certificate (Neon uses a publicly trusted CA).
// `sslmode` is dropped from the URL so the explicit setting below is what applies:
// pg 9 will downgrade "sslmode=require" to encrypt-without-verifying.
const connectionString = (() => {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return raw;
  }
})();

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: true },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Neon closes idle connections; an unhandled 'error' from an idle client would crash the process.
pool.on("error", (err) => {
  console.error("Postgres idle client error:", err.message);
});

module.exports = pool;
