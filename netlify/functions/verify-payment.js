// POST /api/verify-payment → /.netlify/functions/verify-payment
// Verifies Razorpay payment signature, updates DB, and sends confirmation email

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getPool } = require('./_db');
const { commonHeaders } = require('./_auth');

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendTicketEmail(toEmail, name, eventTitle, registrationId, amount, passType) {
    const mailOptions = {
        from: '"YuGen Fest 2026" <yugenfest26@gmail.com>',
        to: toEmail,
        subject: `Registration Confirmed! - ${eventTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 0;">
                <div style="background: linear-gradient(135deg, #00f3ff, #bd00ff); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 2px;">YuGen Fest 2026</h1>
                    <p style="color: #f0f0f0; margin: 5px 0 0;">JKK Munirajah College of Technology</p>
                </div>
                <div style="padding: 30px; background-color: #1a1a1a;">
                    <h2 style="color: #00f3ff; margin-top: 0;">Registration Confirmed!</h2>
                    <p style="font-size: 16px; color: #cccccc;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #cccccc;">Get ready to unleash your inner spark! Your spot for <strong>${eventTitle}</strong> is secured.</p>
                    <div style="background-color: #2a2a2a; padding: 20px; margin: 25px 0; border-left: 4px solid #bd00ff; border-radius: 4px;">
                        <p style="margin: 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase;">Registration ID</p>
                        <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: #ffffff;">${registrationId}</p>
                        <p style="margin: 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase;">Event</p>
                        <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: #00f3ff;">${eventTitle}</p>
                        <p style="margin: 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase;">Status</p>
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #00ff88;">PAID (₹${amount}) - ${passType}</p>
                    </div>
                    <p style="font-size: 14px; color: #888888;">Please show this email at the registration desk.</p>
                    <p style="font-size: 14px; color: #888888;">Venue: JKKMCT Campus, Erode.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.BASE_URL || 'https://yugenfest.netlify.app'}" style="display: inline-block; background: linear-gradient(to right, #00f3ff, #bd00ff); color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px;">Visit Website</a>
                    </div>
                </div>
                <div style="background-color: #0a0a0a; text-align: center; padding: 20px; color: #555; font-size: 12px;">
                    <p>&copy; 2026 YuGen Fest - JKK Munirajah College of Technology.</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = body;

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return {
            statusCode: 400,
            headers: commonHeaders,
            body: JSON.stringify({ success: false, error: 'Invalid Signature' })
        };
    }

    try {
        const pool = getPool();

        // Get registration details
        const { rows } = await pool.query('SELECT * FROM registrations WHERE id = $1', [registrationId]);
        if (rows.length === 0) {
            return { statusCode: 500, headers: commonHeaders, body: JSON.stringify({ error: 'Registration not found.' }) };
        }
        const row = rows[0];

        // Update status to PAID
        await pool.query(
            "UPDATE registrations SET status = 'PAID', payment_id = $1 WHERE id = $2",
            [razorpay_payment_id, registrationId]
        );

        // Send confirmation email (non-blocking)
        sendTicketEmail(row.email, row.name, row.event, registrationId, row.amount, row.pass_type)
            .catch(err => console.error('Email error:', err));

        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify({ success: true, message: 'Payment Verified and Email Sent' })
        };

    } catch (err) {
        console.error('Verify payment error:', err);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
