// POST /api/admin/login → /.netlify/functions/admin-login
// Authenticates admin and returns a JWT token

const jwt = require('jsonwebtoken');
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

    const { username, password } = body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify({ success: true, token })
        };
    } else {
        return {
            statusCode: 401,
            headers: commonHeaders,
            body: JSON.stringify({ success: false, message: 'Invalid credentials' })
        };
    }
};
