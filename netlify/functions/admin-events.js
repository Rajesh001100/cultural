// POST/PUT/DELETE /api/admin/events → /.netlify/functions/admin-events
// Handles event creation, updates, and deletion (JWT protected)
// Uses httpMethod to route between operations
// For DELETE and PUT, the event id is passed in queryStringParameters or body

const { getPool } = require('./_db');
const { verifyAdminToken, commonHeaders } = require('./_auth');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: commonHeaders, body: '' };
    }

    // JWT Auth check for all methods
    const auth = verifyAdminToken(event.headers);
    if (!auth.valid) {
        return {
            statusCode: 401,
            headers: commonHeaders,
            body: JSON.stringify({ success: false, message: auth.error })
        };
    }

    const pool = getPool();

    // --- GET: list all events (admin view) ---
    if (event.httpMethod === 'GET') {
        try {
            const { rows } = await pool.query('SELECT * FROM events ORDER BY id ASC');
            return { statusCode: 200, headers: commonHeaders, body: JSON.stringify(rows) };
        } catch (err) {
            return { statusCode: 500, headers: commonHeaders, body: JSON.stringify({ error: err.message }) };
        }
    }

    // --- POST: create new event ---
    if (event.httpMethod === 'POST') {
        let body;
        try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers: commonHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

        const { title, description, day, category, type, image_color, icon, rule_book, coordinators } = body;
        const rulesStr = typeof rule_book === 'object' ? JSON.stringify(rule_book) : rule_book;
        const coordsStr = typeof coordinators === 'object' ? JSON.stringify(coordinators) : coordinators;

        const sql = `INSERT INTO events (title, description, day, category, type, image_color, icon, rule_book, coordinators, fee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 250) RETURNING id`;

        try {
            const { rows } = await pool.query(sql, [title, description, day, category, type, image_color, icon, rulesStr, coordsStr]);
            return { statusCode: 200, headers: commonHeaders, body: JSON.stringify({ success: true, id: rows[0].id }) };
        } catch (err) {
            return { statusCode: 500, headers: commonHeaders, body: JSON.stringify({ error: err.message }) };
        }
    }

    // --- PUT: update event by ID ---
    if (event.httpMethod === 'PUT') {
        let body;
        try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers: commonHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

        // ID comes from queryStringParameters: e.g. /.netlify/functions/admin-events?id=5
        const id = event.queryStringParameters && event.queryStringParameters.id;
        if (!id) {
            return { statusCode: 400, headers: commonHeaders, body: JSON.stringify({ error: 'Missing event id in query params' }) };
        }

        const { title, description, day, category, type, image_color, icon, rule_book, coordinators } = body;
        const rulesStr = typeof rule_book === 'object' ? JSON.stringify(rule_book) : rule_book;
        const coordsStr = typeof coordinators === 'object' ? JSON.stringify(coordinators) : coordinators;

        const sql = `UPDATE events SET title=$1, description=$2, day=$3, category=$4, type=$5, image_color=$6, icon=$7, rule_book=$8, coordinators=$9 WHERE id=$10`;

        try {
            await pool.query(sql, [title, description, day, category, type, image_color, icon, rulesStr, coordsStr, id]);
            return { statusCode: 200, headers: commonHeaders, body: JSON.stringify({ success: true }) };
        } catch (err) {
            return { statusCode: 500, headers: commonHeaders, body: JSON.stringify({ error: err.message }) };
        }
    }

    // --- DELETE: delete event by ID ---
    if (event.httpMethod === 'DELETE') {
        const id = event.queryStringParameters && event.queryStringParameters.id;
        if (!id) {
            return { statusCode: 400, headers: commonHeaders, body: JSON.stringify({ error: 'Missing event id in query params' }) };
        }
        try {
            await pool.query('DELETE FROM events WHERE id = $1', [id]);
            return { statusCode: 200, headers: commonHeaders, body: JSON.stringify({ success: true }) };
        } catch (err) {
            return { statusCode: 500, headers: commonHeaders, body: JSON.stringify({ error: err.message }) };
        }
    }

    return { statusCode: 405, headers: commonHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
