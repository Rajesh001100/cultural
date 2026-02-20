const pool = require('./database');

const events = [
    // Day 1 Events
    { title: 'Paper Presentation', description: 'Present your innovative ideas.', day: 'Day 1', category: 'Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #00f3ff, #0a0a0a)', icon: 'fas fa-scroll' },
    { title: 'Quiz Challenge', description: 'Test your knowledge.', day: 'Day 1', category: 'Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #00d9ff, #0a0a0a)', icon: 'fas fa-question-circle' },
    { title: 'Poster Design', description: 'Design creative posters.', day: 'Day 1', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #00aeff, #0a0a0a)', icon: 'fas fa-palette' },
    { title: 'Meme Creation', description: 'Show your humor through memes.', day: 'Day 1', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #00c3ff, #0a0a0a)', icon: 'fas fa-laugh-squint' },
    { title: 'Mehandi Art', description: 'Traditional artistic patterns.', day: 'Day 1', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #bd00ff, #0a0a0a)', icon: 'fas fa-hand-sparkles' },
    { title: 'Mask Painting', description: 'Paint your creativity on masks.', day: 'Day 1', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #d500ff, #0a0a0a)', icon: 'fas fa-mask' },
    { title: 'Photography', description: 'Capture the best moments.', day: 'Day 1', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #ff00ea, #0a0a0a)', icon: 'fas fa-camera' },
    { title: 'Flameless Cooking', description: 'Cook delicious food without fire.', day: 'Day 1', category: 'Non-Technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #ff00aa, #0a0a0a)', icon: 'fas fa-utensils' },

    // Day 1 Sports
    { title: 'Volleyball', description: 'Team volleyball tournament.', day: 'Day 1', category: 'Sports', type: 'TEAM', image_color: 'linear-gradient(45deg, #ff5e00, #0a0a0a)', icon: 'fas fa-volleyball-ball' },
    { title: 'Cricket', description: 'The gentleman\'s game.', day: 'Day 1', category: 'Sports', type: 'TEAM', image_color: 'linear-gradient(45deg, #ff0000, #0a0a0a)', icon: 'fas fa-baseball-ball' },
    { title: 'Badminton', description: 'Shuttlecock battle.', day: 'Day 1', category: 'Sports', type: 'BOTH', image_color: 'linear-gradient(45deg, #00ff00, #0a0a0a)', icon: 'fas fa-table-tennis' },

    // Day 2 Events
    { title: 'Singing [Solo&Group]', description: 'Solo & Group singing competition.', day: 'Day 2', category: 'Non-Technical', type: 'BOTH', image_color: 'linear-gradient(45deg, #ffae00, #0a0a0a)', icon: 'fas fa-microphone-alt' },
    { title: 'Dance Clash [Solo&Group]', description: 'Solo & Group dance breakdown.', day: 'Day 2', category: 'Non-Technical', type: 'BOTH', image_color: 'linear-gradient(45deg, #ffe600, #0a0a0a)', icon: 'fas fa-music' },
    { title: 'Reel Creation', description: 'Create trendy short reels.', day: 'Day 2', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #eeff00, #0a0a0a)', icon: 'fas fa-video' },
    { title: 'Fitness Challenge', description: 'Test your physical limits.', day: 'Day 2', category: 'Non-Technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #aeff00, #0a0a0a)', icon: 'fas fa-dumbbell' },
    { title: 'Fashion Show', description: 'Walk the ramp in style.', day: 'Day 2', category: 'Non-Technical', type: 'BOTH', image_color: 'linear-gradient(45deg, #59ff00, #0a0a0a)', icon: 'fas fa-tshirt' },
    { title: 'IPL Auction', description: 'Build your dream cricket team.', day: 'Day 2', category: 'Non-Technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #00f3ff, #0a0a0a)', icon: 'fas fa-gavel' },
];

async function seed() {
    try {
        console.log("Dropping and recreating events table under PostgreSQL...");

        // Drop events table - using DROP TABLE might affect registration logic if it relied on FKs, 
        // but sticking to previous force_seed logic which did a full reset.
        // To be safer, we could just DELETE FROM events, but resetting IDs is cleaner for a 'force seed'.
        await pool.query("DROP TABLE IF EXISTS events");

        // Recreate table
        // Note: rule_book and coordinators are added in database.js init, but here we define the base schema.
        // We should try to match database.js schema or rely on database.js to create it?
        // Relying on manual creation here to ensure it matches what we want.
        await pool.query(`
            CREATE TABLE events (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                day TEXT NOT NULL, 
                category TEXT NOT NULL CHECK(category ILIKE 'Technical' OR category ILIKE 'Non-Technical' OR category ILIKE 'Sports'),
                type TEXT NOT NULL CHECK(type IN ('SOLO', 'TEAM', 'BOTH')),
                fee INTEGER DEFAULT 250,
                image_color TEXT,
                icon TEXT,
                rule_book TEXT DEFAULT '[]',
                coordinators TEXT DEFAULT '[]'
            )
        `);
        console.log("Table recreated.");

        console.log("Inserting events...");
        const query = `
            INSERT INTO events (title, description, day, category, type, image_color, icon, fee, rule_book, coordinators) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 250, '[]', '[]')
        `;

        for (const evt of events) {
            await pool.query(query, [
                evt.title,
                evt.description,
                evt.day,
                evt.category,
                evt.type,
                evt.image_color,
                evt.icon
            ]);
        }
        console.log("Events inserted successfully.");

    } catch (err) {
        console.error("Error during seeding:", err);
    } finally {
        pool.end();
    }
}

seed();
