// Shared JWT authentication helper for admin Netlify Functions

const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token from an Authorization header.
 * @param {object} headers - The request headers object
 * @returns {{ valid: boolean, admin?: object, error?: string }}
 */
function verifyAdminToken(headers) {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'No token provided.' };
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { valid: true, admin: decoded };
    } catch (err) {
        return { valid: false, error: 'Invalid or expired token.' };
    }
}

/**
 * Standard CORS + JSON headers for all function responses
 */
const commonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

module.exports = { verifyAdminToken, commonHeaders };
