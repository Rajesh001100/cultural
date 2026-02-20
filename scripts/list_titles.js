const db = require('./database');

db.all("SELECT title, day FROM events", [], (err, rows) => {
    if (err) return console.error(err);
    rows.forEach(r => console.log(`"${r.title}" -> ${r.day}`));
});
