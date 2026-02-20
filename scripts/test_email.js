const nodemailer = require('nodemailer');

// Credentials from server.js
const user = 'yugenfest26@gmail.com';
const pass = 'omeobxufisdnhjkt';

console.log(`Testing email connection for: ${user}`);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Connection Failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.response) console.error('Response:', error.response);
    } else {
        console.log('✅ Connection Successful!');
        console.log('Server is ready to take our messages');
    }
});
