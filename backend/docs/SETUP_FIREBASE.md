# Firebase Setup Guide - Step by Step

Follow these steps to set up Firebase for the Happy Hour MVP.

---

## Step 1: Install Firebase CLI (✅ Already Done)

Firebase tools have been installed locally. You'll use `npx firebase` instead of `firebase`.

**Check installation:**
```bash
npx firebase --version
```

---

## Step 2: Login to Firebase

**Run this command:**
```bash
npx firebase login
```

This will:
1. Open a browser window
2. Ask you to log in with your Google account
3. Authorize Firebase CLI
4. Return to terminal when done

**Note:** If you don't have a Google account or Firebase account yet:
1. Go to https://console.firebase.google.com
2. Sign in with Google
3. Create a new project or use existing one

---

## Step 3: Create/Select Firebase Project

### Option A: Create New Project (Recommended for MVP)

1. Go to https://console.firebase.google.com
2. Click "Add project" or "Create a project"
3. Enter project name: `happy-hour-mvp` (or your choice)
4. Enable Google Analytics (optional - you can skip for now)
5. Click "Create project"
6. Wait for project to be created
7. Click "Continue" when done

### Option B: Use Existing Project

If you already have a Firebase project, use that.

---

## Step 4: Initialize Firebase in Your Project

**Run this command in the project directory:**
```bash
cd "/Applications/Happy Hour"
npx firebase init
```

**What to select:**
- ✅ Firestore: Configure security rules and indexes
- ✅ Functions: Configure a Cloud Functions directory
- ✅ Storage: Configure a security rules file
- ✅ Emulators: Set up local emulator suite

**Configuration prompts:**

### Firestore:
- Use an existing Firestore rules file? → **No** (we'll create one)
- File name for Firestore rules? → **firestore.rules** (default)
- File name for Firestore indexes? → **firestore.indexes.json** (default)

### Functions:
- What language? → **JavaScript**
- Use ESLint? → **Yes**
- Install dependencies? → **Yes**

### Storage:
- File name for Storage rules? → **storage.rules** (default)

### Emulators:
- Which emulators? → Select all:
  - ✅ Authentication Emulator
  - ✅ Functions Emulator
  - ✅ Firestore Emulator
  - ✅ Storage Emulator
  - ✅ UI Emulator Suite

- Port for Authentication Emulator? → **9099** (default)
- Port for Functions Emulator? → **5001** (default)
- Port for Firestore Emulator? → **8080** (default)
- Port for Storage Emulator? → **9199** (default)
- Port for UI Emulator Suite? → **4000** (default)

- Download emulators? → **Yes**

### Project selection:
- Select a Firebase project → Choose your project (created in Step 3)

---

## Step 5: Verify Setup

After initialization, you should see:
```
✔ Firebase initialization complete!
```

**Check files created:**
```bash
ls -la
```

You should see:
- `firebase.json` - Firebase configuration
- `.firebaserc` - Project configuration
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes
- `storage.rules` - Storage security rules
- `functions/` - Cloud Functions directory (if you have one)

---

## Step 6: Configure Firestore

### 6.1: Create Firestore Database

1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Firestore Database" in left menu
4. Click "Create database"
5. Choose mode:
   - **Production mode** (for now - we'll add rules later)
   - **Test mode** (temporary, 30 days only)
6. Select location (choose closest to you):
   - `us-central1` (Iowa) - Recommended for free tier
   - Or closest region to your users
7. Click "Enable"

### 6.2: Add Initial Security Rules

Open `firestore.rules` and add basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Deals collection - anyone can read active deals
    match /deals/{dealId} {
      allow read: if resource.data.active == true && resource.data.verified == true;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Venues collection - public read, authenticated write
    match /venues/{venueId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.claimedBy == request.auth.uid;
    }
    
    // Users collection - public read, own write
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.id == request.auth.uid;
      allow update: if request.auth != null && request.resource.id == request.auth.uid;
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### 6.3: Deploy Security Rules

```bash
npx firebase deploy --only firestore:rules
```

---

## Step 7: Set Up Cloud Functions

### 7.1: Install Function Dependencies

If you already have `functions/` folder with your code:

```bash
cd functions
npm install
cd ..
```

### 7.2: Test Functions Locally (Optional)

```bash
npx firebase emulators:start --only functions
```

---

## Step 8: Set Up Firebase Storage

### 8.1: Enable Storage

1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Storage" in left menu
4. Click "Get started"
5. Read and accept terms
6. Choose storage location (same as Firestore)
7. Click "Done"

### 8.2: Configure Storage Rules

Open `storage.rules` and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Deals folder - authenticated users can upload/read
    match /deals/{dealId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    // User uploads
    match /users/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8.3: Deploy Storage Rules

```bash
npx firebase deploy --only storage:rules
```

---

## Step 9: Enable Firebase Authentication

1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Authentication" in left menu
4. Click "Get started"
5. Enable sign-in methods:
   - ✅ Email/Password (enable)
   - ✅ Google (optional - enable if you want social login)
   - ✅ Anonymous (optional - for browsing without signup)

---

## Step 10: Test with Emulators

### Start Emulators

```bash
npx firebase emulators:start
```

This will start:
- Firestore Emulator at `http://localhost:8080`
- Functions Emulator at `http://localhost:5001`
- Storage Emulator at `http://localhost:9199`
- Auth Emulator at `http://localhost:9099`
- UI Emulator Suite at `http://localhost:4000`

### View Emulator UI

Open browser: http://localhost:4000

You should see:
- Firestore data viewer
- Functions logs
- Storage files
- Auth users

---

## Step 11: Configure Project for Your Functions

### Update firebase.json

Make sure `firebase.json` includes your functions:

```json
{
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint"
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

---

## Step 12: Get Firebase Config for Frontend Team

### Android Config: `google-services.json`

1. Go to Firebase Console
2. Project Settings (gear icon)
3. Scroll to "Your apps"
4. Click Android icon
5. Register app (if not done):
   - Package name: `com.yourapp.happyhour` (or your package name)
6. Download `google-services.json`
7. Give to frontend team

### iOS Config: `GoogleService-Info.plist`

1. Go to Firebase Console
2. Project Settings
3. Scroll to "Your apps"
4. Click iOS icon
5. Register app (if not done):
   - Bundle ID: `com.yourapp.happyhour` (or your bundle ID)
6. Download `GoogleService-Info.plist`
7. Give to frontend team

---

## Step 13: Configure AI Team URL (For Cloud Function)

### Set Environment Variable

In `functions/extractDealFromImage.js`, update:

```javascript
const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000/parse-menu';
```

### For Production:

```bash
firebase functions:config:set ai.api_url="https://your-ai-service-url.com/parse-menu"
```

---

## Step 14: Deploy Everything

### Deploy Functions

```bash
npx firebase deploy --only functions
```

### Deploy Rules

```bash
npx firebase deploy --only firestore:rules,storage:rules
```

### Deploy Everything

```bash
npx firebase deploy
```

---

## Quick Start Commands

```bash
# Login (one time)
npx firebase login

# Initialize (one time)
npx firebase init

# Start emulators locally
npx firebase emulators:start

# Deploy functions
npx firebase deploy --only functions

# Deploy rules
npx firebase deploy --only firestore:rules,storage:rules

# View logs
npx firebase functions:log
```

---

## Troubleshooting

### "Permission denied" errors
- Make sure you're logged in: `npx firebase login`
- Check project ownership in Firebase Console

### Functions won't deploy
- Make sure dependencies are installed: `cd functions && npm install`
- Check Node.js version (should be 18+)

### Emulators won't start
- Make sure ports aren't already in use
- Try different ports in `firebase.json`

### Can't connect to AI service
- Check if AI team's FastAPI is running
- Update `AI_API_URL` in function code
- For production, use environment variable

---

## Next Steps

After setup:
1. ✅ Test with emulators locally
2. ✅ Share config files with frontend team
3. ✅ Deploy functions
4. ✅ Test end-to-end flow
5. ✅ Monitor usage in Firebase Console

---

## Resources

- Firebase Console: https://console.firebase.google.com
- Firebase Docs: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security/get-started
- Functions Docs: https://firebase.google.com/docs/functions

