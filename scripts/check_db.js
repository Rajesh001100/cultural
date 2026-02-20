const pool = require('./database');

async function check() {
    try {
        const { rows } = await pool.query("SELECT id, title, category, day FROM events");
        console.log("Events Data:");
        rows.forEach(r => console.log(JSON.stringify(r)));
    } catch (err) {
        console.error(err);
    } finally {
        // pool.end(); // Don't end pool immediately if initDb is still running or if we want to keep app alive, but here we want to exit.
        // But since database.js runs initDb on import, we might need to wait or just query.
        // initDb is async and not awaited on import.
    }
}

// Give time for initDb to run on first import
setTimeout(check, 3000);
