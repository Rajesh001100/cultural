# YuGen Fest '26 — College Cultural Fest Website

A full-stack web application for the **YuGen Fest '26** college cultural fest at JKK Munirajah College of Technology (JKKMCT), Erode. Features event registration, Razorpay payment gateway, admin dashboard, and email notifications.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Frontend** | Responsive HTML5, CSS3 (Variables, Grid/Flexbox), Vanilla JS |
| **Design** | Dark/Neon cyberpunk theme with glassmorphism |
| **Events** | Categorized by Day (Day 1 / Day 2) and type (Technical / Non-Technical / Sports) |
| **Registration** | Multi-event selection with team member support |
| **Payments** | Razorpay Live integration (order creation + signature verification) |
| **Email** | Confirmation emails via Nodemailer (Gmail) |
| **Admin Panel** | Secure JWT-authenticated dashboard at `/admin` |
| **Database** | PostgreSQL (via `pg` pool) |
| **Security** | `helmet`, `express-rate-limit`, real JWT auth, input validation |

---

## 🗂️ Project Structure

```
symposisumwebwork/
├── server.js               # Main Express server & all API routes
├── database.js             # PostgreSQL connection pool (pg)
├── package.json            # Dependencies & scripts
├── .env                    # ⚠️ SECRET — never commit this file
├── .env.example            # ✅ Safe template — share this instead
├── .gitignore              # Excludes .env, node_modules, uploads
└── public/                 # Static frontend files
    ├── index.html          # Main public page
    ├── maintenance.html    # Maintenance mode page
    ├── admin/
    │   ├── index.html      # Admin dashboard
    │   └── login.html      # Admin login
    ├── css/
    │   ├── style.css       # Main styles
    │   ├── variables.css   # CSS custom properties / theme
    │   └── badge.css       # Badge/pill component styles
    ├── js/
    │   └── script.js       # Public page JavaScript
    └── assets/
        └── images/         # Static and uploaded images
            └── coordinators/ # Uploaded coordinator photos (runtime)
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) installed and running
- A [Razorpay](https://razorpay.com) account (for payment keys)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) enabled

---

## 🚀 Setup & Installation

### 1. Clone / Copy the Project

```bash
cd symposisumwebwork
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

Open `.env` and fill in all values. See `.env.example` for guidance.

### 4. Set Up the Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE vibrance;
```

Then run the following SQL to create the required tables:

```sql
-- Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    day TEXT,
    category TEXT,
    type TEXT,
    image_color TEXT,
    icon TEXT,
    rule_book TEXT,
    coordinators TEXT,
    fee INTEGER DEFAULT 250
);

-- Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    year TEXT,
    event TEXT,
    team_members TEXT,
    status TEXT DEFAULT 'PENDING',
    payment_id TEXT,
    pass_type TEXT,
    amount INTEGER,
    department TEXT,
    roll_no TEXT,
    college TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Start the Server

```bash
npm start
```

Or in development (auto-restarts on file change):

```bash
npm run dev
```

The site will be available at: **http://localhost:3000**

---

## 🔑 Admin Panel

- **URL**: `http://localhost:3000/admin/login.html`
- **Username**: set in `.env` as `ADMIN_USERNAME`
- **Password**: set in `.env` as `ADMIN_PASSWORD`
- Admin sessions use **real JWT tokens** (8h expiry), signed with `JWT_SECRET`.

---

## 🌐 API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all events |
| `POST` | `/api/register` | Submit registration |
| `POST` | `/api/create-order` | Create Razorpay order |
| `POST` | `/api/verify-payment` | Verify payment signature |
| `POST` | `/api/contact` | Submit contact form |
| `GET` | `/api/config` | Get public Razorpay key |

### Admin (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Login & receive JWT |
| `GET` | `/api/admin/registrations` | List all registrations |
| `POST` | `/api/admin/events` | Add new event |
| `PUT` | `/api/admin/events/:id` | Update event |
| `DELETE` | `/api/admin/events/:id` | Delete event |
| `POST` | `/api/admin/upload` | Upload coordinator image |

---

## 🔒 Security Notes

- All admin API routes are protected by JWT middleware (`requireAdminAuth`)
- Rate limiting: 100 req/15min globally, 5 req/15min on login
- `helmet` is used for HTTP security headers
- Razorpay payments are verified using HMAC SHA-256 signature
- **Production checklist**:
  - [ ] Use HTTPS (SSL certificate via Let's Encrypt / Nginx)
  - [ ] Move `JWT_SECRET` to a secrets manager (AWS Secrets Manager, etc.)
  - [ ] Use environment-specific Razorpay keys (test vs live)
  - [ ] Set up a proper database backup schedule

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (`pg`)
- **Auth**: jsonwebtoken (JWT)
- **Payments**: Razorpay
- **Email**: Nodemailer
- **File Uploads**: Multer
- **Security**: Helmet, express-rate-limit
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

---

## 📦 Key Dependencies

```json
{
  "express": "^4.18.2",
  "pg": "^8.18.0",
  "jsonwebtoken": "^9.0.3",
  "razorpay": "^2.9.6",
  "nodemailer": "^8.0.1",
  "multer": "latest",
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.2.1",
  "dotenv": "^17.3.1"
}
```

---

## 📞 Credits

Built for **YuGen Fest '26** — JKK Munirajah College of Technology.
