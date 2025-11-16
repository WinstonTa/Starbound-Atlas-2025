# Integration Summary: How All Teams Connect

This document explains how your backend work integrates with both the **AI team** and **Frontend team**.

---

## The Big Picture

```
User (Mobile App)
  ↓
Frontend Team (React Native)
  ↓                    ↓
Direct Firestore    Cloud Functions (You)
  ↓                    ↓
Firestore DB        AI Team (FastAPI)
```

---

## How Each Team Integrates

### 1. AI Team Integration (✅ Complete)

**What You Built:**
- ✅ Cloud Function: `extractDealFromImage`
- ✅ Calls AI team's FastAPI endpoint
- ✅ Converts AI format to Firestore format
- ✅ Saves deal to Firestore

**Flow:**
```
1. User uploads image → Firebase Storage
2. Frontend calls your Cloud Function
3. Your function downloads image from Storage
4. Your function calls AI team's FastAPI
5. AI returns parsed data
6. Your function saves to Firestore
7. Your function returns deal to frontend
```

**Files:**
- `functions/extractDealFromImage.js` - Your Cloud Function
- `shared-schemas.ts` - Data format conversion

---

### 2. Frontend Team Integration (✅ Complete)

**Two Integration Points:**

#### A. Direct Firestore Access (90% of operations)
Frontend reads/writes Firestore **directly** using Firebase SDK - no API calls needed!

**What Frontend Does:**
```javascript
// Frontend queries deals directly
const deals = await firestore()
  .collection('deals')
  .where('active', '==', true)
  .get();
```

**What You Provide:**
- ✅ Firestore database structure (`FIRESTORE_STRUCTURE.md`)
- ✅ Security rules (who can read/write)
- ✅ Indexes for efficient queries
- ✅ Data schemas (`shared-schemas.ts`)

**Frontend Integration Points:**
1. **Reading Deals** - Frontend queries your Firestore collections
2. **Real-time Updates** - Frontend listens for new deals
3. **User Profiles** - Frontend reads/writes user data
4. **Voting** - Frontend updates deal votes (via security rules)

**Files:**
- `FIRESTORE_STRUCTURE.md` - Database structure
- `FRONTEND_INTEGRATION.md` - Guide for frontend team
- `shared-schemas.ts` - TypeScript types they'll use

#### B. Cloud Function Calls (Complex operations)
Frontend calls your Cloud Functions for server-side processing.

**What Frontend Does:**
```javascript
// Frontend calls your function
const result = await functions()
  .httpsCallable('extractDealFromImage')
  .call({ imageUrl, venueId, location });
```

**What You Provide:**
- ✅ Cloud Function: `extractDealFromImage`
- ✅ Function contracts (input/output format)
- ✅ Documentation

**Frontend Integration Points:**
1. **Upload Deal** - Frontend calls `extractDealFromImage`
2. **Vote on Deal** - Frontend calls `voteOnDeal` (to be implemented)
3. **Verify Deal** - Frontend calls `verifyDeal` (to be implemented)

**Files:**
- `functions/extractDealFromImage.js` - Function implementation
- `shared-schemas.ts` - Function input/output types

---

## Complete Integration Flow

### Example: User Uploads Happy Hour Deal

```
Step 1: User takes photo in app
  ↓
Step 2: Frontend uploads image to Firebase Storage
  ↓
Step 3: Frontend gets Storage URL
  ↓
Step 4: Frontend calls YOUR Cloud Function
  extractDealFromImage({ imageUrl, location })
  ↓
Step 5: YOUR function downloads image from Storage
  ↓
Step 6: YOUR function calls AI TEAM's FastAPI
  POST http://localhost:8000/parse-menu
  ↓
Step 7: AI TEAM returns parsed data
  { restaurant_name, deals, time_frame, ... }
  ↓
Step 8: YOUR function converts AI format → Firestore format
  ↓
Step 9: YOUR function saves deal to Firestore
  /deals/{dealId}
  ↓
Step 10: YOUR function returns deal to frontend
  ↓
Step 11: Frontend displays new deal in app
```

### Example: User Views Nearby Deals

```
Step 1: User opens app, sees map
  ↓
Step 2: Frontend gets user location (GPS)
  ↓
Step 3: Frontend queries Firestore DIRECTLY
  firestore().collection('deals')
    .where('active', '==', true)
    .where('latitude', '>=', minLat)
    .where('latitude', '<=', maxLat)
    .get()
  ↓
Step 4: Firestore returns deals (YOUR data structure)
  ↓
Step 5: Frontend displays deals on map
```

**Notice:** No Cloud Function needed! Frontend reads Firestore directly.

---

## Files You Created

### Core Backend Files:
1. ✅ **`shared-schemas.ts`** - Data types for all teams
2. ✅ **`FIRESTORE_STRUCTURE.md`** - Database design
3. ✅ **`functions/extractDealFromImage.js`** - AI integration
4. ✅ **`functions/package.json`** - Dependencies
5. ✅ **`functions/index.js`** - Function exports

### Documentation Files:
1. ✅ **`BACKEND_SETUP_GUIDE.md`** - Updated with AI/frontend details
2. ✅ **`FRONTEND_INTEGRATION.md`** - Guide for frontend team
3. ✅ **`HOW_TO_VIEW_TEST_BACKEND.md`** - Testing guide
4. ✅ **`INTEGRATION_SUMMARY.md`** - This file!

---

## What Frontend Team Needs From You

### 1. Firebase Project Credentials
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

**How to get:**
1. Firebase Console → Project Settings
2. Download config files
3. Share with frontend team

### 2. Shared Schema File
- ✅ `shared-schemas.ts` - TypeScript types

**What it provides:**
- `FirestoreDeal` - Deal data structure
- `FirestoreVenue` - Venue data structure
- `ExtractDealFromImageInput/Output` - Function contracts

### 3. Documentation
- ✅ `FRONTEND_INTEGRATION.md` - How to use Firebase
- ✅ `FIRESTORE_STRUCTURE.md` - Database queries

### 4. Function Documentation
- ✅ `shared-schemas.ts` - Function input/output types

---

## What AI Team Needs From You

### 1. Function Integration
- ✅ Your Cloud Function calls their FastAPI endpoint
- ✅ URL: `http://localhost:8000/parse-menu` (local) or deployed URL

### 2. Data Format
- ✅ Your function converts their format to Firestore format
- ✅ See `shared-schemas.ts` for conversion logic

---

## Next Steps

### For You (Backend):

1. **Set up Firebase Project**
   ```bash
   firebase login
   firebase init
   # Select: Firestore, Functions, Storage, Emulators
   ```

2. **Test Cloud Function Locally**
   ```bash
   cd functions
   npm install
   firebase emulators:start
   ```

3. **Configure AI Team's URL**
   - Update `AI_API_URL` in `functions/extractDealFromImage.js`
   - Or set environment variable

4. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

5. **Share with Teams**
   - Give frontend team Firebase config files
   - Share `shared-schemas.ts`
   - Share documentation files

### For Frontend Team:

1. **Install Firebase SDK**
   ```bash
   npm install @react-native-firebase/app
   npm install @react-native-firebase/firestore
   npm install @react-native-firebase/storage
   npm install @react-native-firebase/functions
   ```

2. **Add Config Files**
   - Add `google-services.json` to Android project
   - Add `GoogleService-Info.plist` to iOS project

3. **Use Your Schemas**
   - Import types from `shared-schemas.ts`
   - Use `FirestoreDeal`, `FirestoreVenue`, etc.

4. **Implement Queries**
   - Follow examples in `FRONTEND_INTEGRATION.md`
   - Query deals from Firestore
   - Call Cloud Functions for uploads

### For AI Team:

1. **Keep FastAPI Running**
   - Ensure endpoint is available
   - Deploy to Cloud Run or provide stable URL

2. **Coordinate URL**
   - Share endpoint URL with backend team
   - Update `AI_API_URL` in Cloud Function

---

## Summary

**Your Backend Integrates With:**

1. **AI Team** → Cloud Function calls their FastAPI
2. **Frontend Team** → Two ways:
   - **Direct Firestore** (90% - they read/write your database directly)
   - **Cloud Functions** (10% - they call your functions)

**Key Insight:**
Frontend **doesn't** call traditional REST APIs. Instead:
- Frontend reads/writes Firestore **directly** (most operations)
- Frontend calls your Cloud Functions (complex operations like AI extraction)

**This is the Firebase way!** 🎉

---

## Questions?

- Backend setup? → See `BACKEND_SETUP_GUIDE.md`
- Frontend integration? → See `FRONTEND_INTEGRATION.md`
- Testing? → See `HOW_TO_VIEW_TEST_BACKEND.md`
- Database structure? → See `FIRESTORE_STRUCTURE.md`
- Data types? → See `shared-schemas.ts`

