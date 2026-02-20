const nodemailer = require('nodemailer');

// Credentials
const user = 'yugenfest26@gmail.com';
const pass = 'omeobxufisdnhjkt';

const toEmail = 'mallappaganiga04@gmail.com'; // User's email from screenshot

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass
    }
});

const mailOptions = {
    from: '"YuGen Fest 2026 System Check" <yugenfest26@gmail.com>',
    to: toEmail,
    subject: 'Test Email: Connection Successful',
    html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #00f3ff; background: #000; padding: 10px; display: inline-block;">System Test</h2>
            <p>Hello <strong>Dhanush</strong>,</p>
            <p>This is a test email from the VIBRANCE 2026 system.</p>
            <p>If you are seeing this, the <strong>email configuration is working correctly</strong>.</p>
            <hr>
            <p><strong>Next Step:</strong> Please restart your server (npm start) and try registering on the website again.</p>
        </div>
    `
};

console.log(`Sending test email to ${toEmail}...`);

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('❌ Failed to send:', error);
    } else {
        console.log('✅ Email Sent Successfully!');
        console.log('Response:', info.response);
    }
});
