const db = require('./database');

const sql = "SELECT DISTINCT category FROM events";

db.all(sql, [], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log("--- CATEGORIES ---");
    rows.forEach(r => console.log(`'${r.category}'`));
    console.log("------------------");
});
