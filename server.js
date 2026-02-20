require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Import Nodemailer
const pool = require('./database');

const app = express();
const fs = require('fs');
const multer = require('multer');

// Configure Multer for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'public/assets/images/coordinators');
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Use timestamp + original name to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "*"], // Allow all sources for debugging
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://checkout.razorpay.com", "https://api.razorpay.com"],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://checkout.razorpay.com", "https://api.razorpay.com"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://randomuser.me", "*"],
            connectSrc: ["'self'", "*"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            upgradeInsecureRequests: null, // Disable HTTPS upgrade for localhost
        },
    },
    crossOriginEmbedderPolicy: false,
})); // Relaxed Security for Functionality
app.use(bodyParser.json());

// Rate Limiting (Global: 100 requests per 15 mins)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(express.static(path.join(__dirname, 'public')));

// ─── JWT Auth Middleware ────────────────────────────────────────────
function requireAdminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
}
// ────────────────────────────────────────────────────────────────────

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
    }
});

// Razorpay Configuration
const Razorpay = require('razorpay');
// REPLACE THESE WITH YOUR ACTUAL KEYS
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Function to send email
const sendTicketEmail = (toEmail, name, event, registrationId, amount, passType) => {
    const mailOptions = {
        from: '"YuGen Fest 2026" <yugenfest26@gmail.com>',
        to: toEmail,
        subject: `Start Your Engines! - ${event} Registration Confirmed`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 0;">
                <div style="background: linear-gradient(135deg, #00f3ff, #bd00ff); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 2px;">YuGen Fest 2026</h1>
                    <p style="color: #f0f0f0; margin: 5px 0 0;">JKK Munirajah College of Technology</p>
                </div>
                <div style="padding: 30px; background-color: #1a1a1a;">
                    <h2 style="color: #00f3ff; margin-top: 0;">Registration Confirmed!</h2>
                    <p style="font-size: 16px; color: #cccccc;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #cccccc;">Get ready to unleash your inner spark! Your spot for <strong>${event}</strong> is secured.</p>
                    
                    <div style="background-color: #2a2a2a; padding: 20px; margin: 25px 0; border-left: 4px solid #bd00ff; border-radius: 4px;">
                        <p style="margin: 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase;">Registration ID</p>
                        <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: #ffffff;">${registrationId}</p>
                        
                        <p style="margin: 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase;">Event</p>
                        <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: #00f3ff;">${event}</p>
                        
                        <p style="margin: 0; color: #a0a0a0; font-size: 12px; text-transform: uppercase;">Status</p>
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #00ff88;">PAID (₹${amount}) - ${passType}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #888888;">Please show this email at the registration desk.</p>
                    <p style="font-size: 14px; color: #888888;">Venue: JKKMCT Campus, Erode.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.BASE_URL || 'http://localhost:3000'}" style="display: inline-block; background: linear-gradient(to right, #00f3ff, #bd00ff); color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px;">Visit Website</a>
                    </div>
                </div>
                <div style="background-color: #0a0a0a; text-align: center; padding: 20px; color: #555; font-size: 12px;">
                    <p>&copy; 2026 YuGen Fest - JKK Munirajah College of Technology.</p>
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// API Routes

// 1. Get All Events
app.get('/api/events', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM events");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, phone, year, event, eventId, teamMembers, passType, amount, department, rollNo, college } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !year || (!event && !eventId) || !passType || !amount || !department || !rollNo || !college) {
        return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    let finalEventTitle = event;

    // Convert teamMembers check
    const teamMembersJson = teamMembers ? JSON.stringify(teamMembers) : null;

    try {
        // If eventId provided but no title, fetch title
        if (!finalEventTitle && eventId) {
            const { rows } = await pool.query("SELECT title FROM events WHERE id = $1", [eventId]);
            if (rows.length === 0) {
                return res.status(400).json({ error: 'Invalid Event ID' });
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

        res.json({
            message: 'Registration initiated.',
            registrationId: rows[0].id,
            amount: amount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Razorpay Endpoints

// Create Order
app.post('/api/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    try {
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

    const crypto = require('crypto');

    // Generate signature to verify
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment Verification Successful

        try {
            // Get registration details
            const { rows } = await pool.query("SELECT * FROM registrations WHERE id = $1", [registrationId]);
            if (rows.length === 0) {
                return res.status(500).json({ error: "Registration not found." });
            }
            const row = rows[0];

            // Update status
            await pool.query("UPDATE registrations SET status = 'PAID', payment_id = $1 WHERE id = $2", [razorpay_payment_id, registrationId]);

            // Send Confirmation Email
            sendTicketEmail(row.email, row.name, row.event, registrationId, row.amount, row.pass_type);

            res.json({ success: true, message: 'Payment Verified and Email Sent' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    } else {
        res.status(400).json({ success: false, error: 'Invalid Signature' });
    }
});

// 4. Admin API Routes

// Admin Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit 5 login attempts per IP per 15 min
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Sign a real JWT valid for 8 hours
        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get All Registrations
app.get('/api/admin/registrations', requireAdminAuth, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM registrations ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Image Endpoint
app.post('/api/admin/upload', requireAdminAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Return path relative to public folder
    const relativePath = 'assets/images/coordinators/' + req.file.filename;
    res.json({ success: true, path: relativePath });
});

// Add Event
app.post('/api/admin/events', requireAdminAuth, async (req, res) => {
    const { title, description, day, category, type, image_color, icon, rule_book, coordinators } = req.body;

    // Ensure complex objects are strings (if passed as JSON objects)
    const rulesStr = typeof rule_book === 'object' ? JSON.stringify(rule_book) : rule_book;
    const coordsStr = typeof coordinators === 'object' ? JSON.stringify(coordinators) : coordinators;

    const sql = `INSERT INTO events (title, description, day, category, type, image_color, icon, rule_book, coordinators, fee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 250) RETURNING id`;

    try {
        const { rows } = await pool.query(sql, [title, description, day, category, type, image_color, icon, rulesStr, coordsStr]);
        res.json({ success: true, id: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Event
app.put('/api/admin/events/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { title, description, day, category, type, image_color, icon, rule_book, coordinators } = req.body;

    // Ensure complex objects are strings
    const rulesStr = typeof rule_book === 'object' ? JSON.stringify(rule_book) : rule_book;
    const coordsStr = typeof coordinators === 'object' ? JSON.stringify(coordinators) : coordinators;

    const sql = `UPDATE events SET title = $1, description = $2, day = $3, category = $4, type = $5, image_color = $6, icon = $7, rule_book = $8, coordinators = $9 WHERE id = $10`;

    try {
        await pool.query(sql, [title, description, day, category, type, image_color, icon, rulesStr, coordsStr, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Event
app.delete('/api/admin/events/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM events WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contact Form Endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill all fields.' });
    }

    const mailOptions = {
        from: `"${name}" <${email}>`, // Submitter's name/email as sender
        to: 'yugenfest26@gmail.com', // Admin email
        subject: `New Contact Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
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

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending contact email:', error);
            return res.status(500).json({ error: 'Failed to send message.' });
        }
        res.json({ success: true, message: 'Message sent successfully!' });
    });
});

// Config Endpoint
app.get('/api/config', (req, res) => {
    res.json({
        razorpayKey: process.env.RAZORPAY_KEY_ID
    });
});

// Start Server with Dynamic Port
let server;

const startServer = (port) => {
    server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

startServer(PORT);

// Graceful Shutdown
const shutdown = async () => {
    console.log('Received kill signal, shutting down gracefully');

    // Close DB Pool
    try {
        await pool.end();
        console.log("Database connection closed.");
    } catch (err) {
        console.error("Error closing database connection:", err);
    }

    if (server) {
        server.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
        });
    }

    // Force close if it takes too long
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
