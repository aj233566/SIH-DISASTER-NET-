# CASCADE-NET

### AI-Based Early Warning and Landslide Risk Monitoring System

CASCADE-NET is a disaster management platform designed to support **landslide risk monitoring, incident reporting, authority verification, and disaster response management**.

The system provides separate access for **Citizens, Disaster Management Authorities, and Administrators**.

---

## Features

### 1. User Registration

Users can create an account as:

* Citizen
* Disaster Management Authority

During registration, users provide:

* Full name
* Email
* Phone number
* State
* District
* Password

Passwords are securely hashed before being stored in MongoDB.

---

### 2. Authority Registration and Verification

Authority accounts have additional information:

* Department
* Designation
* Employee / Authority ID
* Official location

When an authority creates an account, the account is initially marked as:

```text
Pending
```

The authority cannot access the protected authority system until an administrator approves the account.

Authority accounts can have these statuses:

* Pending
* Verified
* Rejected

If an application is rejected, the administrator can provide a rejection reason.

---

### 3. Admin Dashboard

Administrators have a separate Admin Control Center.

The admin dashboard provides:

* Total registered citizens
* Total authority accounts
* Pending authority applications
* Verified authorities
* Rejected applications
* Authority application details
* Approve authority account
* Reject authority account
* Rejection reason
* Refresh application data

The admin dashboard is protected and can only be accessed by users with the `admin` role.

---

### 4. Login System

The application supports secure login using:

* Email
* Password
* bcrypt password comparison
* JSON Web Token (JWT)

After successful login, the backend returns a JWT token.

The token is stored on the frontend and is used to access protected APIs.

---

### 5. Role-Based Access Control

The application supports three roles:

```text
Citizen
Authority
Admin
```

Different roles have different access permissions.

| Role      | Access                                |
| --------- | ------------------------------------- |
| Citizen   | Citizen Dashboard                     |
| Authority | Authority system after admin approval |
| Admin     | Admin Control Center                  |

Users cannot access pages belonging to another role.

---

### 6. Protected Routes

The frontend uses a `ProtectedRoute` component to check:

* Whether the user is logged in
* Whether a valid user record exists
* Whether the user has the required role
* Whether an authority account has been verified

Unauthorized users are redirected to the login page or their correct dashboard.

---

### 7. JWT Authentication

The backend uses JWT for authentication.

Protected API requests use:

```text
Authorization: Bearer <token>
```

The backend authentication middleware checks the token before allowing access to protected routes.

---

### 8. Incident Management API

The backend includes APIs for disaster incidents.

Supported incident types include:

* Landslide
* Road blockage
* Flash flood
* Slope crack
* Slope movement
* Infrastructure damage

Each incident can contain:

* Incident type
* Description
* Severity
* Latitude
* Longitude
* Address
* Status
* Images
* Videos
* Creation time
* Last update time

Incident severity supports:

```text
Low
Moderate
High
Critical
```

Incident status supports:

```text
Submitted
Verified
In Progress
Resolved
```

---

### 9. Authority Incident Access

Verified authorities can update the status of incidents.

For example:

```text
Submitted
    ↓
Verified
    ↓
In Progress
    ↓
Resolved
```

Only authenticated and verified authority users can use the protected incident status update API.

---

### 10. MongoDB Database

The application uses **MongoDB with Mongoose**.

The main database models are:

```text
User
Incident
```

The User model stores:

* Account information
* Role
* Location
* Authority information
* Verification status
* Verification/rejection dates
* Rejection reason

---

## Technology Stack

### Frontend

* React
* Vite
* React Router
* Bootstrap
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS
* dotenv

---

## Project Structure

```text
SIH/
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth_controller.js
│   │   ├── admin_controller.js
│   │   └── incident_controller.js
│   │
│   ├── middlewares/
│   │   └── auth_middleware.js
│   │
│   ├── models/
│   │   ├── user.js
│   │   └── incident.js
│   │
│   ├── routes/
│   │   ├── auth_routes.js
│   │   ├── admin_routes.js
│   │   └── incident_routes.js
│   │
│   ├── scripts/
│   │   └── create_admin.js
│   │
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# How to Run the Project

## Requirements

Before running the project, install:

* Node.js
* npm
* MongoDB Atlas account or a local MongoDB server
* Git

Check Node.js:

```bash
node -v
```

Check npm:

```bash
npm -v
```

---

# 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Go into the project:

```bash
cd SIH
```

---

# 2. Setup Backend

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# 3. Create Backend `.env`

Create a file named:

```text
backend/.env
```

Add:

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

JWT_SECRET=YOUR_SECRET_KEY
```

Replace:

```text
YOUR_MONGODB_CONNECTION_STRING
```

with your MongoDB connection string.

Replace:

```text
YOUR_SECRET_KEY
```

with a strong secret key.

### Important

Do **not** upload `.env` to GitHub.

The project already uses `.gitignore` to exclude the `.env` file.

---

# 4. Start the Backend

Inside the `backend` folder:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

You should see:

```text
Connected to MongoDB.
Server running on port 5000
```

You can also start it without Nodemon:

```bash
npm start
```

---

# 5. Create the Admin Account

The project contains:

```text
backend/scripts/create_admin.js
```

Run:

```bash
node scripts/create_admin.js
```

This creates the administrator account in MongoDB.

If the admin account already exists, the script will report that it already exists.

### Security Note

The current `create_admin.js` file contains default admin credentials directly in the source code.

Before putting this project on a public GitHub repository, change this implementation to use environment variables instead of storing the admin password in the source code.

---

# 6. Setup Frontend

Open another terminal.

Go to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

# 7. Start the Frontend

Run:

```bash
npm run dev
```

Vite will provide a local address similar to:

```text
http://localhost:5173
```

Open that address in your browser.

---

# Application Flow

## Citizen

```text
Signup
   ↓
Citizen Account Created
   ↓
Login
   ↓
Citizen Dashboard
```

---

## Authority

```text
Signup
   ↓
Authority Application Created
   ↓
Status = Pending
   ↓
Admin Reviews Application
   ↓
     ┌──────────────┐
     │              │
  Approve        Reject
     │              │
     ↓              ↓
 Verified        Rejected
     │
     ↓
Authority Login
     ↓
Authority System
```

An authority account cannot access protected authority functionality before approval.

---

## Admin

```text
Admin Login
     ↓
Admin Control Center
     ↓
View Authority Applications
     ↓
Approve / Reject
```

---

# API Routes

## Authentication

### Signup

```http
POST /api/auth/signup
```

Creates a citizen or authority account.

### Login

```http
POST /api/auth/login
```

Authenticates the user and returns a JWT token.

---

## Admin

All admin routes require authentication and admin authorization.

### Admin Statistics

```http
GET /api/admin/stats
```

### Pending Authorities

```http
GET /api/admin/authorities/pending
```

### All Authorities

```http
GET /api/admin/authorities
```

### Approve Authority

```http
PATCH /api/admin/authorities/:id/approve
```

### Reject Authority

```http
PATCH /api/admin/authorities/:id/reject
```

---

## Incidents

### Create Incident

```http
POST /api/incidents
```

Only authenticated citizens can create incidents.

### Get All Incidents

```http
GET /api/incidents
```

Requires authentication.

### Get Single Incident

```http
GET /api/incidents/:id
```

Requires authentication.

### Update Incident Status

```http
PATCH /api/incidents/:id
```

Requires a verified authority account.

---

# Security

The project includes several security mechanisms:

* Password hashing using bcryptjs
* JWT-based authentication
* Protected backend routes
* Role-based authorization
* Admin-only routes
* Authority approval before protected authority access
* Rejected authority accounts are blocked
* Password fields are excluded when admin authority lists are returned
* MongoDB credentials are stored through environment variables

---

# Current Project Scope

The current implementation focuses on:

* User authentication
* User registration
* Citizen accounts
* Authority accounts
* Authority approval workflow
* Admin accounts
* Role-based authorization
* JWT authentication
* Protected routes
* MongoDB database integration
* Incident management backend

The project can be extended with additional disaster-management modules such as GIS visualization, weather data, rainfall monitoring, soil moisture data, AI-based risk prediction, satellite data, alerts, and other early-warning features.

---

# Team Development

CASCADE-NET is being developed as a team project for the **Smart India Hackathon**.

Different team members work on different modules such as:

* Authentication and backend
* Authority verification
* Admin management
* Incident reporting
* Command Center
* Disaster monitoring
* Risk analysis

The modules are integrated through the common backend APIs and authentication system.

---

# License

This project is developed for educational and Smart India Hackathon purposes.
