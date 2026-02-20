const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database.');
    release();
    initDb();
});

async function initDb() {
    try {
        // 1. Create Registrations Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                event TEXT NOT NULL,
                team_members TEXT, -- JSON string for team members
                status TEXT DEFAULT 'PENDING',
                payment_id TEXT,
                amount INTEGER,
                pass_type TEXT,
                department TEXT,
                roll_no TEXT,
                college TEXT,
                phone TEXT,
                year TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add columns if they don't exist (Idempotent approach)
        // usage: ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_members TEXT;
        await addColumnIfNotExists('registrations', 'team_members', 'TEXT');
        await addColumnIfNotExists('registrations', 'amount', 'INTEGER');
        await addColumnIfNotExists('registrations', 'pass_type', 'TEXT');
        await addColumnIfNotExists('registrations', 'department', 'TEXT');
        await addColumnIfNotExists('registrations', 'roll_no', 'TEXT');
        await addColumnIfNotExists('registrations', 'college', 'TEXT');
        await addColumnIfNotExists('registrations', 'phone', 'TEXT');
        await addColumnIfNotExists('registrations', 'year', 'TEXT');

        // 2. Create Events Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL CHECK(category IN ('technical', 'non-technical', 'day1', 'day2', 'sports')),
                type TEXT NOT NULL CHECK(type IN ('SOLO', 'TEAM', 'BOTH')),
                fee INTEGER DEFAULT 500,
                image_color TEXT,
                icon TEXT,
                rule_book TEXT,      -- New Column: JSON string or Text for rules
                coordinators TEXT,    -- New Column: JSON string for coordinators
                day TEXT
            )
        `);

        await addColumnIfNotExists('events', 'rule_book', 'TEXT');
        await addColumnIfNotExists('events', 'coordinators', 'TEXT');
        await addColumnIfNotExists('events', 'day', 'TEXT');

        // Backfill logic for 'day' (using generic logic, could be refined)
        await pool.query(`UPDATE events SET day = 'Day 1' WHERE category = 'technical' AND day IS NULL`);
        await pool.query(`UPDATE events SET day = 'Day 2' WHERE (category = 'non-technical' OR category = 'sports') AND day IS NULL`);

        seedEvents();

    } catch (err) {
        console.error("Error initializing database:", err);
    }
}

async function addColumnIfNotExists(table, column, type) {
    try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);
        // console.log(`Ensured column '${column}' exists in '${table}'.`);
    } catch (err) {
        console.error(`Error adding column ${column}:`, err.message);
    }
}

async function seedEvents() {
    try {
        const res = await pool.query("SELECT count(*) as count FROM events");

        if (parseInt(res.rows[0].count) === 0) {
            console.log("Seeding events...");
            await insertEvents();
        } else {
            console.log("Events table already populated.");
            await updateEventsIfMissingData();
        }
    } catch (err) {
        console.error("Error checking events count:", err);
    }
}

async function insertEvents() {
    const events = [
        // Technical Events (Department Specific)
        {
            title: 'Codeathon',
            description: 'Coding challenge for CSE/IT/AI.',
            category: 'technical',
            type: 'SOLO',
            image_color: 'linear-gradient(45deg, #00f3ff, #0a0a0a)',
            icon: 'fas fa-code',
            rule_book: JSON.stringify(['No plagiarism allowed.', '2 hours duration.', 'Languages: C, C++, Java, Python.']),
            coordinators: JSON.stringify([
                { name: 'Arun Kumar', phone: '9876543210', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
                { name: 'Priya S', phone: '9123456780', image: 'https://randomuser.me/api/portraits/women/2.jpg' }
            ])
        },
        {
            title: 'Circuit Debugging',
            description: 'Fix the faults for EEE/ECE.',
            category: 'technical',
            type: 'TEAM',
            image_color: 'linear-gradient(45deg, #00d9ff, #0a0a0a)',
            icon: 'fas fa-microchip',
            rule_book: JSON.stringify(['Team of 2 members.', 'Multimeter provided.', 'Bring your own calculator.']),
            coordinators: JSON.stringify([
                { name: 'Rahul V', phone: '9988776655', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
                { name: 'Sneha M', phone: '8877665544', image: 'https://randomuser.me/api/portraits/women/4.jpg' }
            ])
        },
        {
            title: 'CAD Master',
            description: 'Design contest for Mech/Auto.',
            category: 'technical',
            type: 'SOLO',
            image_color: 'linear-gradient(45deg, #00c3ff, #0a0a0a)',
            icon: 'fas fa-drafting-compass',
            rule_book: JSON.stringify(['AutoCAD 2024 used.', '1.5 hours duration.', 'Dimensioning is crucial.']),
            coordinators: JSON.stringify([
                { name: 'Karthik R', phone: '7766554433', image: 'https://randomuser.me/api/portraits/men/5.jpg' },
                { name: 'Deepa K', phone: '6655443322', image: 'https://randomuser.me/api/portraits/women/6.jpg' }
            ])
        },
        { title: 'Structure Design', description: 'Building models for Civil.', category: 'technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #00aeff, #0a0a0a)', icon: 'fas fa-building', rule_book: JSON.stringify(['Materials Provided.', 'Max height 1m.', 'Load test included.']), coordinators: JSON.stringify([{ name: 'Siva', phone: '9999999999', image: 'https://randomuser.me/api/portraits/men/7.jpg' }, { name: 'Rani', phone: '8888888888', image: 'https://randomuser.me/api/portraits/women/8.jpg' }]) },
        { title: 'Paper Presentation', description: 'Present your innovative ideas.', category: 'technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #0099ff, #0a0a0a)', icon: 'fas fa-scroll', rule_book: JSON.stringify(['6 mins presentation.', '2 mins Q&A.', 'Submit abstract before event.']), coordinators: JSON.stringify([{ name: 'Mani', phone: '7777777777', image: 'https://randomuser.me/api/portraits/men/9.jpg' }, { name: 'Vani', phone: '6666666666', image: 'https://randomuser.me/api/portraits/women/10.jpg' }]) },
        { title: 'Cyber Hunt', description: 'CTF Challenge for Cyber Security.', category: 'technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #0088ff, #0a0a0a)', icon: 'fas fa-user-secret', rule_book: JSON.stringify(['Bring your own laptop.', 'Kali Linux allowed.', 'No DDoSing server.']), coordinators: JSON.stringify([{ name: 'Hacker X', phone: '0000000000', image: 'https://randomuser.me/api/portraits/men/11.jpg' }, { name: 'Cyber Y', phone: '1111111111', image: 'https://randomuser.me/api/portraits/women/12.jpg' }]) },
        // Non-Technical
        { title: 'IPL Auction', description: 'Bid for your dream team.', category: 'non-technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #bd00ff, #0a0a0a)', icon: 'fas fa-gavel', rule_book: JSON.stringify(['Virtual money provided.', 'Team size 3-4.', 'Standard IPL rules apply.']), coordinators: JSON.stringify([{ name: 'Dhoni Fan', phone: '7000000007', image: 'https://randomuser.me/api/portraits/men/13.jpg' }, { name: 'Kohli Fan', phone: '1818181818', image: 'https://randomuser.me/api/portraits/men/14.jpg' }]) },
        { title: 'Photography', description: 'Capture the campus vibe.', category: 'non-technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #d500ff, #0a0a0a)', icon: 'fas fa-camera', rule_book: JSON.stringify(['DSLR or Mobile.', 'No editing allowed.', 'Submit raw file.']), coordinators: JSON.stringify([{ name: 'Cam Guy', phone: '5555555555', image: 'https://randomuser.me/api/portraits/men/15.jpg' }, { name: 'Lens Girl', phone: '4444444444', image: 'https://randomuser.me/api/portraits/women/16.jpg' }]) },
        { title: 'Short Film', description: 'Tell a story in 5 minutes.', category: 'non-technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #ff00ea, #0a0a0a)', icon: 'fas fa-film', rule_book: JSON.stringify(['Max duration 10 mins.', 'Original content only.', 'Submit in MP4 format.']), coordinators: JSON.stringify([{ name: 'Director A', phone: '3333333333', image: 'https://randomuser.me/api/portraits/men/17.jpg' }, { name: 'Editor B', phone: '2222222222', image: 'https://randomuser.me/api/portraits/women/18.jpg' }]) },
        { title: 'Treasure Hunt', description: 'Explore the JKKMCT campus.', category: 'non-technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #ff00aa, #0a0a0a)', icon: 'fas fa-map-marked-alt', rule_book: JSON.stringify(['Clues hidden in campus.', 'First team to finish wins.', 'Do not damage property.']), coordinators: JSON.stringify([{ name: 'Hunter 1', phone: '1231231234', image: 'https://randomuser.me/api/portraits/men/19.jpg' }, { name: 'Hunter 2', phone: '3213214321', image: 'https://randomuser.me/api/portraits/women/20.jpg' }]) },
        { title: 'Solo Dance', description: 'Show your moves.', category: 'non-technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #ff006a, #0a0a0a)', icon: 'fas fa-shoe-prints', rule_book: JSON.stringify(['Max 3 mins.', 'Bring your own track.', 'Decent attire mandatory.']), coordinators: JSON.stringify([{ name: 'Dancer X', phone: '9898989898', image: 'https://randomuser.me/api/portraits/women/21.jpg' }, { name: 'Choreographer Y', phone: '8787878787', image: 'https://randomuser.me/api/portraits/men/22.jpg' }]) },
        { title: 'Meme Creation', description: 'Humor meets creativity.', category: 'non-technical', type: 'SOLO', image_color: 'linear-gradient(45deg, #ff002b, #0a0a0a)', icon: 'fas fa-laugh', rule_book: JSON.stringify(['Topic given on spot.', '1 hour duration.', 'No offensive content.']), coordinators: JSON.stringify([{ name: 'Memer 1', phone: '6969696969', image: 'https://randomuser.me/api/portraits/men/23.jpg' }, { name: 'Memer 2', phone: '4204204200', image: 'https://randomuser.me/api/portraits/women/24.jpg' }]) },
        { title: 'Connection', description: 'Connect the clues.', category: 'non-technical', type: 'TEAM', image_color: 'linear-gradient(45deg, #ff5e00, #0a0a0a)', icon: 'fas fa-link', rule_book: JSON.stringify(['Images shown on screen.', 'Buzzer round.', 'Negative marking applicable.']), coordinators: JSON.stringify([{ name: 'Host 1', phone: '5656565656', image: 'https://randomuser.me/api/portraits/men/25.jpg' }, { name: 'Host 2', phone: '4545454545', image: 'https://randomuser.me/api/portraits/women/26.jpg' }]) }
    ];

    const sql = "INSERT INTO events (title, description, category, type, image_color, icon, rule_book, coordinators) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

    for (const evt of events) {
        try {
            await pool.query(sql, [
                evt.title,
                evt.description,
                evt.category,
                evt.type,
                evt.image_color,
                evt.icon,
                evt.rule_book || '[]',
                evt.coordinators || '[]'
            ]);
        } catch (err) {
            console.error("Error inserting event:", evt.title, err);
        }
    }
    console.log("Events seeded successfully.");
}

async function updateEventsIfMissingData() {
    const dummyRules = JSON.stringify(['Standard rules apply.', 'Report 15 mins early.', 'Judge decision final.']);
    const dummyCoordinators = JSON.stringify([
        { name: 'Student Coord 1', phone: '9988776655', image: 'https://randomuser.me/api/portraits/men/20.jpg' },
        { name: 'Student Coord 2', phone: '8877665544', image: 'https://randomuser.me/api/portraits/women/21.jpg' }
    ]);

    await pool.query("UPDATE events SET rule_book = $1 WHERE rule_book IS NULL", [dummyRules]);
    await pool.query("UPDATE events SET coordinators = $1 WHERE coordinators IS NULL", [dummyCoordinators]);
    console.log("Backfilled missing data.");
}

module.exports = pool;
