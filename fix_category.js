require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updateCategory() {
    try {
        const res = await pool.query(
            "UPDATE events SET category = 'Technical' WHERE id = 1 AND category = 'technical'"
        );
        console.log('Update successful:', res.rowCount, 'rows affected');
    } catch (err) {
        console.error('Error updating category:', err);
    } finally {
        await pool.end();
    }
}

updateCategory();
