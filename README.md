# EPLQ – Secure POI Finder

EPLQ (Efficient Privacy-Preserving Location-based Queries) is a MERN-stack web application that allows users to search nearby Points of Interest (POIs) securely with role-based access control.

- Frontend (React + Vite): https://eplq-poi-finder.netlify.app  
- Backend (Node + Express): https://eplq-backend.onrender.com  

---

## Tech Stack

Frontend:
- React 18
- Vite
- React Router
- Fetch API
- Custom CSS

Backend:
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcrypt

Deployment:
- Netlify (frontend)
- Render (backend)

---

## Features

- User registration & login
- JWT authentication
- Role-based access (`user`, `admin`)
- Admin POI upload & edit
- Search POIs by latitude, longitude, radius & category
- Browser geolocation shortcut
- Favourites list
- POI detail pages
- Responsive UI
- Admin seed route (Postman only)

---

## Frontend Project Structure

```text
frontend/
├─ dist/                     # Production build (Netlify output)
├─ node_modules/
├─ public/
│   ├─ _redirects           # Netlify SPA redirect
│   ├─ favicon-16x16.png
│   ├─ favicon-32x32.png
│   ├─ favicon-192x192.png
│   ├─ favicon-512x512.png
│   ├─ favicon.png
│   └─ site.webmanifest
│
├─ src/
│   ├─ api/
│   │   └─ apiFetch.js      # Centralized API calls
│   │
│   ├─ assets/
│   │
│   ├─ components/
│   │   ├─ Header.jsx
│   │   ├─ Header.css
│   │   └─ PoiCard.jsx
│   │
│   ├─ pages/
│   │   ├─ About.jsx
│   │   ├─ Contact.jsx
│   │   ├─ EditPoi.jsx
│   │   ├─ Favourites.jsx
│   │   ├─ Register.jsx
│   │   ├─ AdminUpload.jsx
│   │   ├─ Login.jsx
│   │   ├─ PoiDetails.jsx
│   │   └─ Search.jsx
│   │
│   ├─ ProtectedRoute.jsx   # JWT + role route guard
│   ├─ App.jsx              # Main routing component
│   ├─ App.css
│   ├─ main.jsx             # React entry point
│   ├─ index.css
│   └─ config.js            # API base URL config
│
├─ .env                     # Frontend environment variables
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
└─ README.md
```

### Key Files

- **apiFetch.js** – Handles all backend API requests
- **ProtectedRoute.jsx** – Secures admin/user pages
- **Header.jsx** – Navigation + user menu
- **PoiCard.jsx** – POI display component
- **Search.jsx** – Main POI search page
- **AdminUpload.jsx** – Admin POI creation
- **EditPoi.jsx** – Admin POI editing

---

✅ Vite-based React architecture  
✅ Modular pages/components  
✅ Centralized API handling  
✅ Netlify SPA routing  
✅ JWT-protected routes  



---

## Getting Started (Local Development)

### 1. Prerequisites

- Node.js (LTS)
- npm
- MongoDB Atlas or local MongoDB

---

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd <project-root>

cd backend
npm install

cd ../frontend
npm install
```

---

### 3. Environment Variables

Backend (`backend/.env`):

```
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

Frontend (`frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:5000
```

---

### 4. Run Locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000  

---

# ================= BACKEND README =================

# EPLQ Backend – Node.js / Express API

Base URL (prod): https://eplq-backend.onrender.com

## Tech

- Express
- MongoDB
- JWT
- bcrypt
- dotenv
- CORS

---

## Auth

JWT payload:
- userId
- role

Header:

```
Authorization: Bearer <token>
```

Middleware:

```js
auth("admin")  // admin only
auth()         // any logged-in user
```

---

## Auth Routes

POST `/api/auth/register`

```json
{
 "email":"user@example.com",
 "password":"Password123"
}
```

POST `/api/auth/login`

Returns token + user.

POST `/api/auth/seed-admin`  
(Postman only)

Creates admin account.

---

## Deployment

Hosted on Render.  
Set ENV variables in Render dashboard.

---

# ================= FRONTEND README =================

# EPLQ Frontend – React + Vite

React UI for Secure POI Finder.

---

## Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Routes

/login  
/register  
/search  
/about  
/contact  

Protected:

/admin/upload  
/admin/pois/:id/edit  
/poi/:id  
/favourites  

ProtectedRoute validates JWT + role.

---

## API Usage

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## Netlify Deployment

Build:

```
npm run build
```

Publish:

```
dist
```

Env:

```
VITE_API_BASE_URL=https://eplq-backend.onrender.com
```

SPA redirect (`public/_redirects`):

```
/*   /index.html   200
```

---

✅ Full MERN Secure POI Finder with Admin Control
