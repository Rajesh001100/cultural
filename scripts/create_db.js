require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default DB to create new one
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

(async () => {
    try {
        await client.connect();

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'vibrance'");
        if (res.rowCount === 0) {
            console.log("Creating database 'vibrance'...");
            await client.query('CREATE DATABASE vibrance');
            console.log("Database 'vibrance' created successfully.");
        } else {
            console.log("Database 'vibrance' already exists.");
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
})();
