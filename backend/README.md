# Backend - Happy Hour MVP

Firebase backend infrastructure for the Happy Hour mobile application.

## Overview

This directory contains all backend code, configuration, and documentation for the Firebase-based backend.

---

## 📁 Structure

```
backend/
├── functions/              # Cloud Functions
│   ├── extractDealFromImage.js   # AI integration function
│   ├── index.js                  # Function exports
│   └── package.json              # Dependencies
├── firebase.json           # Firebase project configuration
├── .firebaserc            # Firebase project link
├── firestore.rules        # Database security rules
├── firestore.indexes.json # Database indexes
├── storage.rules          # Storage security rules
└── docs/                   # Documentation
    ├── BACKEND_SETUP_GUIDE.md
    ├── FRONTEND_INTEGRATION.md
    ├── FIRESTORE_STRUCTURE.md
    └── ...
```

---

##  Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

3. Start emulators locally:
   ```bash
   firebase emulators:start
   ```

4. View Emulator UI:
   Open http://localhost:4000 in your browser

---

##  What's Included

### Cloud Functions
- **`extractDealFromImage`** - Integrates with AI team's FastAPI service to parse menu images

### Database
- **Firestore** - NoSQL database with collections:
  - `/deals` - Happy hour deals
  - `/venues` - Restaurant/bar locations
  - `/users` - User profiles
  - `/businesses` - Business owner accounts

### Security
- Firestore security rules deployed
- Storage security rules configured
- Authentication enabled (Email/Password)

---

## 🔗 Integration

### AI Team
- Cloud Function calls their FastAPI service at `/parse-menu`
- Converts AI output format to Firestore format

### Frontend Team
- Frontend queries Firestore directly
- Frontend calls Cloud Functions for complex operations
- Shared schemas: `../shared-schemas.ts`

---

## 📚 Documentation

See `docs/` folder for:
- **BACKEND_SETUP_GUIDE.md** - Complete setup guide
- **FRONTEND_INTEGRATION.md** - Frontend team guide
- **FIRESTORE_STRUCTURE.md** - Database structure
- **INTEGRATION_SUMMARY.md** - How teams connect

---

##  Testing

Test locally with Firebase Emulator Suite:
```bash
firebase emulators:start
```

Access Emulator UI: http://localhost:4000

---

##  Deployment

Deploy to Firebase:
```bash
# Deploy functions
firebase deploy --only functions

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

##  Shared Resources

- **`../shared-schemas.ts`** - TypeScript types shared by all teams
- **`../fake_venues.json`** - Test data

---

##  Team

Backend team maintains this directory.

---

##  Configuration

- Project: `happy-hour-mvp`
- Region: `us-central1`
- Node.js: 18 (for Cloud Functions)

---

For more details, see documentation in `docs/` folder.

