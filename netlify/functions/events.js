// GET /api/events → /.netlify/functions/events
// Returns all events from the database

const { getPool } = require('./_db');
const { commonHeaders } = require('./_auth');

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: commonHeaders, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: commonHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const pool = getPool();
        const { rows } = await pool.query('SELECT * FROM events ORDER BY id ASC');
        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify(rows)
        };
    } catch (err) {
        console.error('Error fetching events:', err);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
