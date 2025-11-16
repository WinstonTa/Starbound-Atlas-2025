# Backend Setup Guide for Happy Hour MVP

## Overview
This guide outlines what the backend team needs to know and how to coordinate with frontend and AI teams.

---

## 1. Firebase Services You'll Need

### Firestore Database
**Purpose:** Store deals, venues, user data, votes
**Free Tier Limits:**
- 50K reads/day
- 20K writes/day
- 20K deletes/day
- 1GB storage

**Key Collections You'll Design:**
```
/venues
  - venueId
    - name, address, location (geo point)
    - claimedBy (business owner ID)
    - deals[] (array of deal IDs)

/deals
  - dealId
    - venueId
    - userId (who uploaded)
    - imageUrl
    - extractedData (from AI)
      - timeWindow: "5pm-7pm"
      - items: [{ name, price }]
    - verified: boolean
    - votes: { upvotes: number, downvotes: number }
    - active: boolean
    - createdAt, expiresAt

/users
  - userId (from Firebase Auth)
    - username
    - uploadedDeals: []
    - votes: []

/businesses (if business owners claim)
  - businessId
    - venueId
    - ownerId
    - directDeals: []
```

### Firebase Authentication
**Purpose:** User accounts
**Free Tier:** Unlimited (unless you hit 50K MAU)

**Methods to implement:**
- Email/Password
- Social login (Google, Facebook)
- Anonymous (for browsing before signup)

### Firebase Storage
**Purpose:** Store menu photos
**Free Tier:**
- 5GB storage
- 1GB/day downloads

**Structure:**
```
/deals/
  - dealId_image_1.jpg
  - dealId_image_2.jpg
```

### Cloud Functions
**Purpose:** Server-side logic (AI integration, notifications, verification)
**Free Tier:**
- 2 million invocations/month
- 400K GB-seconds compute time

**Key Functions You'll Need:**
1. `extractDealFromImage` - Calls AI service to parse menu photos
2. `verifyDeal` - Community voting logic
3. `sendNearbyDealNotification` - Push notifications for location
4. `expireOldDeals` - Cleanup job (scheduled function)

---

## 2. Frontend-Backend Communication Patterns

### Pattern A: Direct Firestore Access (Most Common)
**When:** Simple CRUD operations, real-time updates
**Example:** Frontend queries deals directly

```javascript
// Frontend code (their team writes this)
import firestore from '@react-native-firebase/firestore';

// Get nearby deals
const getNearbyDeals = async (latitude, longitude, radius) => {
  // You'll need to set up Firestore geohashing for this
  const deals = await firestore()
    .collection('deals')
    .where('active', '==', true)
    .where('location', '>=', geohashLower)
    .where('location', '<=', geohashUpper)
    .get();
  return deals;
};
```

**Your responsibility:** 
- Design Firestore security rules
- Set up proper indexes
- Structure data for efficient queries

### Pattern B: Cloud Functions (Complex Logic)
**When:** Image processing, AI calls, server-side calculations
**Example:** Upload photo → AI extracts deal → Save to database

```javascript
// Frontend calls this
const processDealImage = functions().httpsCallable('extractDealFromImage');

// You write this function
exports.extractDealFromImage = functions.https.onCall(async (data, context) => {
  // 1. Validate user is authenticated
  // 2. Call AI team's service
  // 3. Save extracted data to Firestore
  // 4. Return structured deal data
});
```

---

## 3. API Contracts Between Teams

### How Teams Coordinate

You need to agree on **data schemas** and **function contracts**:

#### Shared Schema Document (create this together)
```typescript
// shared/types.ts (both teams reference this)

interface Deal {
  id: string;
  venueId: string;
  userId: string;
  imageUrl: string;
  extractedData?: {
    timeWindow: string;  // "17:00-19:00"
    items: DealItem[];
    validDays?: string[]; // ["monday", "tuesday", ...]
  };
  verified: boolean;
  votes: {
    upvotes: number;
    downvotes: number;
  };
  active: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  location: GeoPoint;
}

interface DealItem {
  name: string;
  price: number;
  description?: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
  claimedBy?: string; // business owner ID
  deals: string[]; // array of deal IDs
}
```

#### Function Contracts
```typescript
// Cloud Function: extractDealFromImage
Input: {
  imageUrl: string;
  venueId?: string;
}
Output: {
  success: boolean;
  dealData?: {
    timeWindow: string;
    items: DealItem[];
    validDays: string[];
  };
  error?: string;
}
```

---

## 4. What You Need to Learn/Setup

### Immediate Knowledge Needs:

1. **Firestore Security Rules** (Critical!)
   ```javascript
   // Only authenticated users can write
   // Anyone can read active deals
   // Business owners can update their venues
   ```

2. **Geospatial Queries**
   - For "deals within X miles"
   - Use GeoFire or Firestore geohash indexing

3. **Real-time Listeners**
   - Frontend will listen for deal updates
   - Design data structure to support this

4. **Cloud Functions**
   - Connect to AI team's service (likely an API endpoint)
   - Handle image processing workflow

5. **Firebase Indexes**
   - Compound indexes for complex queries
   - Know how to create index.json

---

## 5. Coordination Workflow

### Step 1: Define Schemas Together
- Meet with frontend team
- Create shared TypeScript types (or JSON Schema)
- Document in shared repo or Google Doc

### Step 2: Parallel Development
- **Frontend:** Uses mock data / Firestore emulator
- **You:** Build Firestore structure + security rules
- **AI Team:** Builds their extraction service
- **All:** Test against same schema

### Step 3: Integration Points
- Cloud Function that calls AI service
- Frontend uploads → Storage → Cloud Function → AI → Firestore

### Step 4: Testing Together
- Use Firebase Emulator Suite locally
- Test end-to-end flows
- Verify security rules work correctly

---

## 6. Free Tier Considerations

**Limits to Watch:**
- Firestore: 50K reads/day (one user browsing deals = ~10-20 reads)
- Storage: 5GB total (photos add up quickly)
- Functions: 2M invocations/month (~66K/day)

**Optimization Strategies:**
1. Cache deals on frontend (reduce reads)
2. Compress images before upload (save storage)
3. Batch operations where possible
4. Use Firebase Analytics to monitor usage

---

## 7. Next Steps

1. **Setup Firebase Project**
   - Create project in Firebase Console
   - Enable Firestore, Auth, Storage, Functions

2. **Initialize Functions**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions
   ```

3. **Create Schema Document**
   - Work with frontend team
   - Define Deal, Venue, User structures

4. **Design Security Rules**
   - Read rules (public data)
   - Write rules (authenticated users)
   - Update rules (business owners)

5. **Build First Cloud Function**
   - Start with `extractDealFromImage`
   - Integrate with AI team's endpoint

---

## 8. AI Team Integration Details

### AI Team's FastAPI Service

**Endpoint:** `POST /parse-menu`

**Location:**
- Local development: `http://localhost:8000/parse-menu`
- Production: TODO (deploy AI service or use Cloud Run)

**Request Format:**
```
Content-Type: multipart/form-data
Body: file (image file - jpg, png, etc.)
```

**Response Format:**
```typescript
{
  restaurant_name: string | null,
  deals: [
    {
      name: string,
      price: string,
      description: string | null
    }
  ],
  time_frame: [
    {
      start_time: string,  // e.g., "4:00 PM"
      end_time: string,     // e.g., "7:00 PM"
      days: string[] | null // e.g., ["Monday", "Tuesday"]
    }
  ],
  special_conditions: string[] | null
}
```

**Integration Flow:**
1. User uploads image to Firebase Storage
2. Frontend calls Cloud Function `extractDealFromImage` with imageUrl
3. Cloud Function downloads image from Storage
4. Cloud Function sends image to AI team's FastAPI endpoint
5. AI returns parsed data
6. Cloud Function converts AI format to Firestore format
7. Cloud Function saves deal to Firestore
8. Returns deal data to frontend

**See:** `functions/extractDealFromImage.js` for implementation

---

## 9. Frontend Team Integration Points

### How Frontend Connects to Backend

**Direct Firestore Access (Most Common):**
Frontend reads/writes Firestore directly using Firebase SDK:

```javascript
// Frontend code example
import firestore from '@react-native-firebase/firestore';

// Query deals
const deals = await firestore()
  .collection('deals')
  .where('active', '==', true)
  .where('verified', '==', true)
  .get();

// Listen for real-time updates
firestore()
  .collection('deals')
  .where('active', '==', true)
  .onSnapshot(snapshot => {
    // Update UI with new deals
  });
```

**Cloud Function Calls:**
Frontend calls Cloud Functions for complex operations:

```javascript
// Frontend code example
import functions from '@react-native-firebase/functions';

// Upload image and extract deal
const extractDeal = functions().httpsCallable('extractDealFromImage');

const result = await extractDeal({
  imageUrl: storageUrl,
  venueId: 'venue_123',  // optional
  location: {            // optional
    latitude: 33.785,
    longitude: -118.149
  }
});
```

### Frontend Integration Checklist

**What Frontend Team Needs:**
1. ✅ Firebase project credentials (google-services.json for Android, GoogleService-Info.plist for iOS)
2. ✅ Shared schema types (see `shared-schemas.ts`)
3. ✅ Firestore security rules (so they know what they can read/write)
4. ✅ Cloud Function documentation (inputs/outputs)
5. ✅ Firebase Storage upload instructions
6. ✅ Example queries for common use cases

**What You Provide:**
1. ✅ Firebase project setup (Firestore, Storage, Functions enabled)
2. ✅ Shared schemas document
3. ✅ Security rules (configured in Firebase Console)
4. ✅ Cloud Functions deployed
5. ✅ Example code snippets for frontend

**Coordination:**
- Share `shared-schemas.ts` file with frontend team
- Document all Cloud Functions in README
- Set up Firebase Emulator Suite for local testing together
- Agree on data validation (what's required vs optional)

---

## 10. Questions to Discuss with Team

### With AI Team:
1. ✅ **How does AI team expose their service?**
   - **ANSWER:** FastAPI endpoint at `/parse-menu`
   - **TODO:** Deploy to Cloud Run or provide stable URL

2. **What's the request/response format?**
   - ✅ **ANSWER:** Multipart form-data (image file), returns `MenuParsing` format
   - **SEE:** `ai/gemini_parser/models.py` and `shared-schemas.ts`

### With Frontend Team:
1. **Geolocation Strategy**
   - How precise do we need "nearby"?
   - Background location permissions?
   - How to handle location permissions?

2. **Deal Verification**
   - Community voting threshold?
   - Business owner confirmation priority?
   - How to handle fake/expired deals?

3. **Data Retention**
   - How long to keep expired deals?
   - Archive vs delete?
   - Should users see historical deals?

4. **Image Upload Flow**
   - Should images be compressed before upload?
   - Maximum image size?
   - Multiple images per deal?

