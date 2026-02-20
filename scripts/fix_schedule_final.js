const db = require('./database');

const day1Events = [
    "Paper Presentation",
    "Quiz Challenge",
    "Meme Creation",
    "Poster Design",
    "Mehandi Art",
    "Mask Painting",
    "Photography",
    "Flameless Cooking",
    "Volleyball",
    "Cricket",
    "Badminton"
];

const day2Events = [
    "Singing",
    "Dance Clash",
    "Reel Creation",
    "Fitness Challenge",
    "Fashion Show",
    "IPL Auction"
];

// Helper to run updates
function updateEvent(title, day) {
    db.run("UPDATE events SET day = ? WHERE title = ?", [day, title], function (err) {
        if (err) console.error(`Error updating ${title}:`, err.message);
        else console.log(`Updated '${title}' -> ${day}`);
    });
}

day1Events.forEach(title => updateEvent(title, 'Day 1'));
day2Events.forEach(title => updateEvent(title, 'Day 2'));
