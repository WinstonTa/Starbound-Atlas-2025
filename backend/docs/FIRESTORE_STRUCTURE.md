# Firestore Database Structure - Happy Hour MVP

This document defines the Firestore collections and their structure for the Happy Hour app.

## Collections Overview

```
/venues          → Venue/location information
/deals           → Happy hour deals (main collection)
/users           → User profiles and activity
/businesses      → Business owner accounts (optional for MVP)
```

---

## Collection: `/venues`

**Purpose:** Store restaurant/bar venue information

**Document Structure:**
```typescript
{
  // Auto-generated Firestore ID (e.g., "venue_abc123")
  id: string;
  
  // Basic info
  name: string;                    // "Joe's Bar & Grill"
  address: {
    street: string;                // "4001 E Anaheim St"
    city: string;                  // "Long Beach"
    state: string;                 // "CA"
    zip: string;                   // "90804"
  };
  fullAddress: string;             // "4001 E Anaheim St, Long Beach, CA 90804"
  
  // Location (for geospatial queries)
  location: GeoPoint;              // Firestore GeoPoint(lat, lng)
  latitude: number;                // 33.785421
  longitude: number;               // -118.149881
  
  // Business relationship
  claimedBy: string | null;        // User ID of business owner (if claimed)
  
  // Deals relationship
  dealIds: string[];               // Array of deal document IDs
  
  // Metadata
  hoursOfOperation: string | null; // "Mon-Fri 11am-2am"
  createdAt: Timestamp;            // When venue was created
  
  // Index fields for queries
  _searchName: string;            // Lowercase name for search
  _activeDealCount: number;        // Count of active deals (for quick filtering)
}
```

**Query Examples:**
```javascript
// Get venue by ID
firestore().collection('venues').doc(venueId).get();

// Get venues within radius (requires geohash indexing)
firestore().collection('venues')
  .where('latitude', '>=', minLat)
  .where('latitude', '<=', maxLat)
  .where('longitude', '>=', minLng)
  .where('longitude', '<=', maxLng)
  .get();

// Search by name
firestore().collection('venues')
  .where('_searchName', '>=', searchTerm.toLowerCase())
  .where('_searchName', '<=', searchTerm.toLowerCase() + '\uf8ff')
  .get();
```

**Indexes Needed:**
- `latitude + longitude` (compound for geospatial queries)
- `claimedBy` (for business owner lookups)

---

## Collection: `/deals`

**Purpose:** Store happy hour deals (main collection - most queries here!)

**Document Structure:**
```typescript
{
  // Auto-generated Firestore ID (e.g., "deal_xyz789")
  id: string;
  
  // Relationships
  venueId: string;                 // Reference to venue document
  userId: string;                   // User who uploaded this deal
  
  // Image
  imageUrl: string;                 // Firebase Storage URL of menu photo
  
  // AI-extracted data
  extractedData: {
    restaurantName: string | null;  // Name from AI or manual entry
    deals: [
      {
        name: string;              // "Margarita"
        price: string;             // "$5"
        description: string | null; // "Classic lime margarita"
      }
    ];
    timeFrames: [
      {
        startTime: string;         // "17:00" (24h format)
        endTime: string;           // "19:00"
        days: string[];            // ["monday", "tuesday", "wednesday"]
      }
    ];
    specialConditions: string[] | null; // ["Dine-in only", "Max 2 per person"]
  };
  
  // Verification & Quality
  verified: boolean;               // Is this deal verified?
  active: boolean;                 // Is deal currently active?
  
  // Voting
  votes: {
    upvotes: number;               // Count of upvotes
    downvotes: number;             // Count of downvotes
    userVotes: {                   // Map of userId -> vote type
      [userId: string]: "upvote" | "downvote";
    };
  };
  
  // Location (duplicated for querying - denormalized)
  location: GeoPoint;              // Same as venue.location
  latitude: number;
  longitude: number;
  
  // Restaurant name (for quick display)
  restaurantName: string;
  
  // Timestamps
  createdAt: Timestamp;            // When deal was created
  expiresAt: Timestamp | null;     // When deal expires (optional)
  
  // Index fields for queries
  _isActiveNow: boolean;           // Is deal active right now? (calculated)
  _activeDayOfWeek: string[];       // ["monday", "tuesday"] (current day if active)
  _searchRestaurant: string;       // Lowercase restaurant name for search
}
```

**Query Examples:**
```javascript
// Get active deals near user
firestore().collection('deals')
  .where('active', '==', true)
  .where('verified', '==', true)
  .where('_isActiveNow', '==', true)  // Currently happening
  .orderBy('votes.upvotes', 'desc')
  .limit(20)
  .get();

// Get deals for specific venue
firestore().collection('deals')
  .where('venueId', '==', venueId)
  .where('active', '==', true)
  .orderBy('createdAt', 'desc')
  .get();

// Get deals for specific day
const today = getDayOfWeek(); // "monday"
firestore().collection('deals')
  .where('active', '==', true)
  .where('_activeDayOfWeek', 'array-contains', today)
  .get();

// Search deals by restaurant name
firestore().collection('deals')
  .where('_searchRestaurant', '>=', searchTerm.toLowerCase())
  .where('_searchRestaurant', '<=', searchTerm.toLowerCase() + '\uf8ff')
  .where('active', '==', true)
  .get();
```

**Indexes Needed:**
- `active + verified + _isActiveNow + votes.upvotes` (compound for main feed)
- `venueId + active + createdAt` (for venue deals)
- `latitude + longitude` (for geospatial queries)
- `_activeDayOfWeek` (array for day filtering)
- `_searchRestaurant` (for search)

---

## Collection: `/users`

**Purpose:** User profiles and activity tracking

**Document Structure:**
```typescript
{
  // User ID from Firebase Authentication
  id: string;                      // Same as Firebase Auth UID
  
  // Profile
  username: string;                // Display name
  email: string;                   // Email address
  
  // Activity tracking
  uploadedDealIds: string[];       // Array of deal IDs user uploaded
  votedDealIds: string[];          // Array of deal IDs user voted on
  
  // Metadata
  createdAt: Timestamp;            // When account was created
  lastActiveAt: Timestamp;         // Last activity timestamp
}
```

**Query Examples:**
```javascript
// Get user profile
firestore().collection('users').doc(userId).get();

// Get user's uploaded deals
const userDoc = await firestore().collection('users').doc(userId).get();
const dealIds = userDoc.data().uploadedDealIds;
// Then fetch deals...
```

---

## Collection: `/businesses`

**Purpose:** Business owner accounts (optional for MVP)

**Document Structure:**
```typescript
{
  // Auto-generated Firestore ID
  id: string;
  
  // Relationships
  venueId: string;                 // Venue this business owns
  ownerId: string;                 // User ID of owner (from Firebase Auth)
  
  // Business info
  businessName: string;             // Business name
  contactEmail: string;             // Contact email
  
  // Deals posted directly by business
  directDealIds: string[];         // Array of deal IDs
  
  // Metadata
  createdAt: Timestamp;
  verified: boolean;               // Is business verified?
}
```

---

## Data Relationships Diagram

```
User (Firebase Auth)
  ↓
  ├─→ /users/{userId}                    (Profile)
  ├─→ /deals/{dealId}                    (Uploaded deals)
  └─→ /businesses/{businessId}            (If business owner)
            ↓
            └─→ /venues/{venueId}         (Owned venues)

Venue
  ↓
  ├─→ /venues/{venueId}                  (Venue info)
  └─→ /deals/{dealId}                    (Deals at venue)

Deal (Main Collection!)
  ↓
  ├─→ /deals/{dealId}                    (Deal info)
  ├─→ /venues/{venueId}                  (Which venue)
  └─→ /users/{userId}                     (Who uploaded)
```

---

## Firestore Security Rules

**Rules for `/venues`:**
```javascript
match /venues/{venueId} {
  // Anyone can read venues (public data)
  allow read: if true;
  
  // Only authenticated users can create venues
  allow create: if request.auth != null;
  
  // Only business owners can update their venues
  allow update: if request.auth != null 
    && resource.data.claimedBy == request.auth.uid;
  
  // No deletes (soft delete with active flag)
  allow delete: if false;
}
```

**Rules for `/deals`:**
```javascript
match /deals/{dealId} {
  // Anyone can read active, verified deals
  allow read: if resource.data.active == true 
    && resource.data.verified == true;
  
  // Users can read their own deals even if not verified
  allow read: if request.auth != null 
    && resource.data.userId == request.auth.uid;
  
  // Only authenticated users can create deals
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
  
  // Users can update their own deals (for editing)
  allow update: if request.auth != null
    && resource.data.userId == request.auth.uid;
  
  // Users can vote on deals (handled via Cloud Function)
  // No direct voting in security rules
}
```

**Rules for `/users`:**
```javascript
match /users/{userId} {
  // Users can read any user profile
  allow read: if true;
  
  // Users can only create their own profile
  allow create: if request.auth != null 
    && request.resource.id == request.auth.uid;
  
  // Users can only update their own profile
  allow update: if request.auth != null 
    && request.resource.id == request.auth.uid;
  
  // No deletes
  allow delete: if false;
}
```

---

## Indexes Configuration (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "deals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "verified", "order": "ASCENDING" },
        { "fieldPath": "_isActiveNow", "order": "ASCENDING" },
        { "fieldPath": "votes.upvotes", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "deals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "venueId", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "deals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "latitude", "order": "ASCENDING" },
        { "fieldPath": "longitude", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "venues",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "latitude", "order": "ASCENDING" },
        { "fieldPath": "longitude", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Data Migration Notes

**When AI team returns data:**
1. Convert AI format (`AIMenuParsing`) to Firestore format
2. Normalize time format (e.g., "4:00 PM" → "16:00")
3. Normalize days (e.g., "Monday" → "monday")
4. Create deal document with all required fields
5. Update venue's `dealIds` array
6. Update user's `uploadedDealIds` array

**When deal is created:**
1. Calculate `_isActiveNow` based on current time and `timeFrames`
2. Set `_activeDayOfWeek` based on current day
3. Normalize `_searchRestaurant` (lowercase)

---

## Free Tier Optimization

**To stay within free tier limits:**

1. **Denormalize data** - Store location in deals (for queries without venue lookup)
2. **Index carefully** - Only create indexes you actually need
3. **Batch writes** - Update multiple documents at once
4. **Cache on frontend** - Reduce read operations
5. **Use `_activeDealCount`** - Pre-calculate counts instead of aggregating
6. **Soft deletes** - Use `active: false` instead of deleting documents

