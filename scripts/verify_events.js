const pool = require('./database');

async function verify() {
    try {
        const { rows } = await pool.query("SELECT id, title, day, category FROM events ORDER BY day, category");
        console.log("ID | Day | Category | Title");
        console.log("---|-----|----------|------");
        rows.forEach((row) => {
            console.log(`${row.id} | ${row.day} | ${row.category} | ${row.title}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

verify();
