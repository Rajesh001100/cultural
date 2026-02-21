// GET /api/admin/registrations → /.netlify/functions/admin-registrations
// Returns all registrations (JWT protected)

const { getPool } = require('./_db');
const { verifyAdminToken, commonHeaders } = require('./_auth');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: commonHeaders, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: commonHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // JWT Auth check
    const auth = verifyAdminToken(event.headers);
    if (!auth.valid) {
        return {
            statusCode: 401,
            headers: commonHeaders,
            body: JSON.stringify({ success: false, message: auth.error })
        };
    }

    try {
        const pool = getPool();
        const { rows } = await pool.query('SELECT * FROM registrations ORDER BY id DESC');
        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify(rows)
        };
    } catch (err) {
        console.error('Registrations fetch error:', err);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
