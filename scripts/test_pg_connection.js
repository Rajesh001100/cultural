require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'vibrance',
    password: process.env.DB_PASSWORD, // Ensure this is set in .env
    port: process.env.DB_PORT || 5432,
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!');
        const res = await client.query('SELECT NOW()');
        console.log('Server Date/Time:', res.rows[0].now);
        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err);
        console.error('Hint: Check if PostgreSQL is running and credentials in .env are correct.');
    } finally {
        await pool.end();
    }
})();
