# Next Steps After Firebase Init ✅

Firebase initialization is complete! Here's what to do next.

---

## Step 1: Enable Firestore Database (Required)

### In Firebase Console:
1. Go to: https://console.firebase.google.com
2. Select your project
3. Click **"Firestore Database"** in the left menu
4. Click **"Create database"** button
5. Choose **Production mode** (or Test mode for now)
6. Select location: **us-central1** (or closest to you)
7. Click **"Enable"**

**Wait for database to be created** (takes 30-60 seconds)

---

## Step 2: Deploy Firestore Security Rules

After Firestore is enabled, deploy your security rules:

```bash
cd "/Applications/Happy Hour"
npx firebase deploy --only firestore:rules
```

This uploads your security rules from `firestore.rules` to Firebase.

---

## Step 3: Enable Firebase Storage (Required)

### In Firebase Console:
1. Still in Firebase Console (same project)
2. Click **"Storage"** in the left menu
3. Click **"Get started"** button
4. Read and accept terms
5. Choose storage location (same as Firestore - us-central1)
6. Click **"Done"**

**Wait for Storage to be enabled**

---

## Step 4: Deploy Storage Security Rules

After Storage is enabled:

```bash
npx firebase deploy --only storage:rules
```

This uploads your storage rules from `storage.rules` to Firebase.

---

## Step 5: Enable Firebase Authentication (Required)

### In Firebase Console:
1. Click **"Authentication"** in the left menu
2. Click **"Get started"** button
3. Enable sign-in methods:
   - ✅ **Email/Password** - Click "Enable" → Toggle ON → Save
   - ✅ **Google** (optional) - If you want social login
   - ✅ **Anonymous** (optional) - For browsing without signup

---

## Step 6: Test with Emulators (Optional but Recommended)

Test everything locally before deploying:

```bash
cd "/Applications/Happy Hour"
npx firebase emulators:start
```

This starts:
- Firestore Emulator at `http://localhost:8080`
- Functions Emulator at `http://localhost:5001`
- Storage Emulator at `http://localhost:9199`
- Auth Emulator at `http://localhost:9099`
- UI Emulator Suite at `http://localhost:4000` ← **Open this in browser!**

### View Emulator UI:
Open browser: http://localhost:4000

You'll see:
- Firestore data viewer
- Functions logs
- Storage files
- Auth users

**To stop emulators:** Press `Ctrl+C` in terminal

---

## Step 7: Deploy Firestore Indexes

Your database needs indexes for queries:

```bash
npx firebase deploy --only firestore:indexes
```

This creates the indexes from `firestore.indexes.json`.

**Note:** Index creation takes a few minutes. Check status in Firebase Console → Firestore → Indexes tab.

---

## Step 8: Test Your Cloud Function Locally

If AI team's FastAPI is running:

```bash
# Make sure AI service is running first
# Then start emulators
npx firebase emulators:start --only functions

# Or test all emulators together
npx firebase emulators:start
```

---

## Step 9: Deploy Cloud Functions (When Ready)

When you're ready to deploy your functions:

```bash
npx firebase deploy --only functions
```

This uploads your `extractDealFromImage` function to Firebase.

**Note:** First deployment takes 2-3 minutes.

---

## Step 10: Get Firebase Config Files for Frontend Team

### Android: `google-services.json`
1. Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Android icon (or "Add app" → Android)
4. Register app:
   - Package name: `com.happyhour.app` (or ask frontend team)
5. Download `google-services.json`
6. Give to frontend team

### iOS: `GoogleService-Info.plist`
1. Same place → Click iOS icon
2. Register app:
   - Bundle ID: `com.happyhour.app` (or ask frontend team)
3. Download `GoogleService-Info.plist`
4. Give to frontend team

---

## Quick Command Reference

```bash
# Enable services (in Firebase Console)
# - Firestore Database
# - Storage
# - Authentication

# Deploy rules
npx firebase deploy --only firestore:rules,storage:rules

# Deploy indexes
npx firebase deploy --only firestore:indexes

# Start emulators (test locally)
npx firebase emulators:start

# Deploy functions (when ready)
npx firebase deploy --only functions

# View logs
npx firebase functions:log
```

---

## What's Next?

After enabling all services:
1. ✅ Test with emulators locally
2. ✅ Deploy security rules and indexes
3. ✅ Test Cloud Function with AI team's service
4. ✅ Share config files with frontend team
5. ✅ Deploy functions to production
6. ✅ Monitor usage in Firebase Console

---

## Troubleshooting

### "Permission denied" deploying
- Make sure you're logged in: `npx firebase login`
- Check you have access to the project

### "Index building in progress"
- Indexes take 2-5 minutes to build
- Check status in Firebase Console → Firestore → Indexes

### Functions won't deploy
- Check Node.js version (should be 18)
- Make sure dependencies installed: `cd functions && npm install`

### Can't connect to AI service
- Make sure AI team's FastAPI is running
- Check `AI_API_URL` in function code

---

## You're Ready! 🎉

Once you've:
1. ✅ Enabled Firestore
2. ✅ Enabled Storage  
3. ✅ Enabled Authentication
4. ✅ Deployed rules and indexes

Your backend is set up! Next:
- Test with emulators
- Deploy functions
- Share with teams

