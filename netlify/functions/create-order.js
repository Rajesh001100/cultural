// POST /api/create-order → /.netlify/functions/create-order
// Creates a Razorpay order for payment

const Razorpay = require('razorpay');
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

    const { amount, currency = 'INR', receipt } = body;

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency,
            receipt
        });

        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify(order)
        };

    } catch (err) {
        console.error('Razorpay order error:', err);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
