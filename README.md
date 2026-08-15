# HerGod — Women's Safety Platform

Full-stack safety app with SOS alerts, live maps, trip tracking, incident reporting, and emergency contacts.

## Stack
- Frontend: React + Vite + CSS + Framer Motion + Leaflet
- Backend: Node.js + Express + MongoDB + JWT
- SOS delivery: Twilio SMS

## Run locally on Windows

### 1. Start MongoDB
Make sure your local MongoDB service is running.

### 2. Backend
Open a VS Code terminal:

```powershell
cd server
npm install
npm run dev
```

Backend: `http://localhost:5000`

### 3. Frontend
Open a second VS Code terminal:

```powershell
cd client
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## SOS message setup

The SOS countdown and database logging work without Twilio, but **real SMS delivery requires Twilio credentials**. The server intentionally does not use a fake/demo success response anymore.

Add these values to `server/.env` using your own Twilio account:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

For an Indian 10-digit contact such as `9876543210`, HerGod normalizes the number to `+919876543210` for Twilio. For other countries, save the contact with its full international `+countrycode` number.

For Twilio trial accounts, the destination recipient may need to be verified before SMS delivery.

**Never commit real Twilio credentials to GitHub or show them during a hackathon presentation.**

## Features
- JWT Auth (Login, Signup, Forgot Password)
- Dashboard with sidebar navigation
- SOS with 3-second countdown and real SMS delivery when Twilio is configured
- Safe Route (Leaflet + OSRM)
- Danger Map with severity markers
- Trip Tracker with live location and completed-trip deletion
- Report Incident with photo upload and report deletion
- Emergency Contacts CRUD with Call actions
- Profile & Settings
