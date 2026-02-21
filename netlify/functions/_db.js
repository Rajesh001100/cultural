// Shared PostgreSQL connection pool for all Netlify Functions
// Uses DATABASE_URL from environment variables (Neon.tech connection string)

const { Pool } = require('pg');

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Neon.tech
            }
        });
    }
    return pool;
}

module.exports = { getPool };
