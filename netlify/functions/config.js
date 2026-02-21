// GET /api/config → /.netlify/functions/config
// Returns public Razorpay key to the frontend

const { commonHeaders } = require('./_auth');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: commonHeaders, body: '' };
    }

    return {
        statusCode: 200,
        headers: commonHeaders,
        body: JSON.stringify({
            razorpayKey: process.env.RAZORPAY_KEY_ID
        })
    };
};
