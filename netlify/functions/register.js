// POST /api/register → /.netlify/functions/register
// Creates a new registration record in PENDING state

const { getPool } = require('./_db');
const { commonHeaders } = require('./_auth');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: commonHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: commonHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, headers: commonHeaders, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { name, email, phone, year, event: eventName, eventId, teamMembers, passType, amount, department, rollNo, college } = body;

    if (!name || !email || !phone || !year || (!eventName && !eventId) || !passType || !amount || !department || !rollNo || !college) {
        return {
            statusCode: 400,
            headers: commonHeaders,
            body: JSON.stringify({ error: 'Please fill all required fields.' })
        };
    }

    let finalEventTitle = eventName;
    const teamMembersJson = teamMembers ? JSON.stringify(teamMembers) : null;

    try {
        const pool = getPool();

        // If eventId provided but no title, fetch title
        if (!finalEventTitle && eventId) {
            const { rows } = await pool.query('SELECT title FROM events WHERE id = $1', [eventId]);
            if (rows.length === 0) {
                return { statusCode: 400, headers: commonHeaders, body: JSON.stringify({ error: 'Invalid Event ID' }) };
            }
            finalEventTitle = rows[0].title;
        }

        const sql = `
            INSERT INTO registrations 
            (name, email, phone, year, event, team_members, status, pass_type, amount, department, roll_no, college) 
            VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8, $9, $10, $11) 
            RETURNING id
        `;
        const { rows } = await pool.query(sql, [name, email, phone, year, finalEventTitle, teamMembersJson, passType, amount, department, rollNo, college]);

        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify({
                message: 'Registration initiated.',
                registrationId: rows[0].id,
                amount
            })
        };

    } catch (err) {
        console.error('Registration error:', err);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
