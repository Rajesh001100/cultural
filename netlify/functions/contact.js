// POST /api/contact → /.netlify/functions/contact
// Sends a contact form email to the admin

const nodemailer = require('nodemailer');
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

    const { name, email, message } = body;

    if (!name || !email || !message) {
        return {
            statusCode: 400,
            headers: commonHeaders,
            body: JSON.stringify({ error: 'Please fill all fields.' })
        };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: 'yugenfest26@gmail.com',
        subject: `New Contact Message from ${name}`,
        html: `
            <h3>New Contact Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #00f3ff;">
                ${message.replace(/\n/g, '<br>')}
            </blockquote>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
        };
    } catch (err) {
        console.error('Contact email error:', err);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({ error: 'Failed to send message.' })
        };
    }
};
