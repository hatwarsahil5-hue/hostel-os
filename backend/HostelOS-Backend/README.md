# HostelOS — Backend API

Node.js + Express + MongoDB REST API with JWT authentication for the Smart Hostel Management System.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Seed the database with demo data
```bash
npm run seed
```

### 4. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 🔑 Demo Credentials (after seeding)

| Role    | Email                          | Password  |
|---------|--------------------------------|-----------|
| Warden  | warden@hostelos.com            | admin123  |
| Student | rahul@student.hostelos.com     | pass123   |
| Student | arjun@student.hostelos.com     | pass123   |
| Student | neha@student.hostelos.com      | pass123   |
| Student | vivek@student.hostelos.com     | pass123   |

---

## 📡 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint                    | Access  | Description              |
|--------|-----------------------------|---------|--------------------------|
| POST   | `/api/auth/register`        | Public  | Register a new user      |
| POST   | `/api/auth/login`           | Public  | Login & receive JWT      |
| GET    | `/api/auth/me`              | Private | Get current user profile |
| PATCH  | `/api/auth/change-password` | Private | Change password          |

**Login request body:**
```json
{
  "email": "rahul@student.hostelos.com",
  "password": "pass123"
}
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "_id": "...",
    "name": "Rahul Sharma",
    "email": "rahul@student.hostelos.com",
    "role": "student",
    "rollNo": "CS2022001",
    "roomNumber": "204",
    "block": "A"
  }
}
```

**Using the token** — add to all protected requests:
```
Authorization: Bearer <your_token_here>
```

---

### Students — `/api/students`

| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | `/api/students`        | Warden only   | List all students        |
| GET    | `/api/students/stats`  | Warden only   | Dashboard stats          |
| GET    | `/api/students/:id`    | Auth required | Get student by ID        |
| PATCH  | `/api/students/:id`    | Warden only   | Update student details   |

**Query params for GET /students:**
- `search` — filter by name, rollNo, or email
- `block` — filter by block (A or B)

---

### Complaints — `/api/complaints`

| Method | Endpoint                        | Access        | Description             |
|--------|---------------------------------|---------------|-------------------------|
| GET    | `/api/complaints`               | Auth required | List complaints         |
| POST   | `/api/complaints`               | Student only  | Raise a new complaint   |
| PATCH  | `/api/complaints/:id/status`    | Warden only   | Update complaint status |
| DELETE | `/api/complaints/:id`           | Auth required | Delete a complaint      |

**POST /api/complaints body:**
```json
{
  "category": "Plumbing",
  "subject": "Tap leaking in bathroom",
  "description": "The bathroom tap has been leaking since yesterday.",
  "priority": "High"
}
```

---

### Notices — `/api/notices`

| Method | Endpoint             | Access      | Description         |
|--------|----------------------|-------------|---------------------|
| GET    | `/api/notices`       | Auth        | List all notices    |
| POST   | `/api/notices`       | Warden only | Post a notice       |
| DELETE | `/api/notices/:id`   | Warden only | Delete a notice     |

**POST /api/notices body:**
```json
{
  "title": "Water supply off tomorrow",
  "body": "Maintenance work in Block A from 9–11 AM.",
  "type": "urgent"
}
```
`type` options: `normal` | `urgent` | `info`

---

### Leave Requests — `/api/leaves`

| Method | Endpoint                   | Access        | Description           |
|--------|----------------------------|---------------|-----------------------|
| GET    | `/api/leaves`              | Auth required | List leave requests   |
| POST   | `/api/leaves`              | Student only  | Submit leave request  |
| PATCH  | `/api/leaves/:id/status`   | Warden only   | Approve / Reject      |

**POST /api/leaves body:**
```json
{
  "type": "Home Leave",
  "fromDate": "2025-03-18",
  "toDate": "2025-03-20",
  "reason": "Family function at home",
  "parentContact": "+91 98765 43210"
}
```

**PATCH /api/leaves/:id/status body:**
```json
{ "status": "Approved" }
```

---

## 🏗️ Project Structure

```
HostelOS-Backend/
├── server.js           ← Express app entry point
├── seed.js             ← Database seeder with demo data
├── .env.example        ← Environment variables template
├── package.json
├── config/
│   └── db.js           ← MongoDB connection
├── middleware/
│   └── auth.js         ← JWT protect + restrictTo middleware
├── models/
│   ├── User.js         ← User schema (student + warden)
│   ├── Complaint.js    ← Complaint schema
│   ├── Notice.js       ← Notice schema
│   └── Leave.js        ← Leave request schema
└── routes/
    ├── auth.js         ← Register, login, me, change-password
    ├── students.js     ← Student CRUD
    ├── complaints.js   ← Complaint CRUD
    ├── notices.js      ← Notice CRUD
    └── leaves.js       ← Leave request CRUD
```

---

## 🔐 Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT** tokens with configurable expiry (default 7 days)
- Password field excluded from all query results (`select: false`)
- **Role-based access control** (RBAC) — students cannot access warden endpoints
- **CORS** configured — only accepts requests from `CLIENT_URL`
- Input validation on all create/update routes

---

## 🛠️ Tech Stack

| Layer       | Technology     |
|-------------|----------------|
| Runtime     | Node.js        |
| Framework   | Express.js     |
| Database    | MongoDB        |
| ODM         | Mongoose       |
| Auth        | JWT + bcryptjs |
| Dev Tools   | nodemon        |
| Logging     | Morgan         |

---

## 🔮 Planned Enhancements

- Fee payment integration (Razorpay)
- Real-time notifications (Socket.IO)
- Email alerts (Nodemailer)
- File uploads for complaint attachments
- Refresh token rotation
- Rate limiting (express-rate-limit)
- Input sanitisation (express-mongo-sanitize)
