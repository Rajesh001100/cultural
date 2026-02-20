const db = require('./database');

const updateDay1 = "UPDATE events SET day = 'Day 1' WHERE category = 'Technical'";
const updateDay2 = "UPDATE events SET day = 'Day 2' WHERE category = 'Non-Technical' OR category = 'Sports'";

db.run(updateDay1, function (err) {
    if (err) console.error(err.message);
    else console.log(`Updated ${this.changes} Technical events to Day 1.`);
});

db.run(updateDay2, function (err) {
    if (err) console.error(err.message);
    else console.log(`Updated ${this.changes} Non-Tech/Sports events to Day 2.`);
});
