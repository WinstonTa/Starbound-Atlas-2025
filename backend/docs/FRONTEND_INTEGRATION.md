# Frontend Team Integration Guide

This document explains how the frontend team (React Native) integrates with the backend (Firebase).

---

## Overview: Frontend-Backend Communication

The frontend communicates with backend in **two ways**:

### 1. Direct Firestore Access (90% of operations)
- Frontend reads/writes Firestore directly using Firebase SDK
- Real-time updates via Firestore listeners
- No API calls needed!

### 2. Cloud Functions (Complex operations)
- Image upload + AI extraction
- Voting on deals
- Deal verification
- Server-side logic that requires processing

---

## Setup: Adding Firebase to React Native

### 1. Install Dependencies

```bash
cd my-app
npm install @react-native-firebase/app
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage
npm install @react-native-firebase/auth
npm install @react-native-firebase/functions
```

### 2. Add Firebase Configuration

**Android:** Add `google-services.json` to `android/app/`
**iOS:** Add `GoogleService-Info.plist` to `ios/`

(Backend team will provide these files from Firebase Console)

### 3. Initialize Firebase

```typescript
// app/firebase.ts
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

// Firebase is automatically initialized with config files
// You're ready to use it!
```

---

## Reading Data: Querying Firestore

### Example: Get Active Deals

```typescript
import firestore from '@react-native-firebase/firestore';

// Get all active, verified deals
const getActiveDeals = async () => {
  const snapshot = await firestore()
    .collection('deals')
    .where('active', '==', true)
    .where('verified', '==', true)
    .orderBy('votes.upvotes', 'desc')
    .limit(20)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
```

### Example: Get Nearby Deals (Geolocation)

```typescript
import * as Location from 'expo-location';

const getNearbyDeals = async (latitude: number, longitude: number, radiusMiles: number = 5) => {
  // Calculate bounding box (simplified - you may want to use GeoFire)
  const latDelta = radiusMiles / 69; // 1 degree ≈ 69 miles
  const lngDelta = radiusMiles / (69 * Math.cos(latitude * Math.PI / 180));

  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const minLng = longitude - lngDelta;
  const maxLng = longitude + lngDelta;

  const snapshot = await firestore()
    .collection('deals')
    .where('active', '==', true)
    .where('verified', '==', true)
    .where('latitude', '>=', minLat)
    .where('latitude', '<=', maxLat)
    .where('longitude', '>=', minLng)
    .where('longitude', '<=', maxLng)
    .get();

  // Filter by actual distance (Firestore doesn't support radius queries directly)
  const deals = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return deals.filter(deal => {
    const distance = calculateDistance(
      latitude, longitude,
      deal.latitude, deal.longitude
    );
    return distance <= radiusMiles;
  });
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Example: Real-time Updates

```typescript
// Listen for new deals in real-time
const unsubscribe = firestore()
  .collection('deals')
  .where('active', '==', true)
  .where('verified', '==', true)
  .onSnapshot(snapshot => {
    const deals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Update UI with new deals
    setDeals(deals);
  });

// Remember to unsubscribe when component unmounts
return () => unsubscribe();
```

### Example: Get Deals by Venue

```typescript
const getVenueDeals = async (venueId: string) => {
  const snapshot = await firestore()
    .collection('deals')
    .where('venueId', '==', venueId)
    .where('active', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
```

---

## Writing Data: Creating Deals

### Example: Upload Deal Image + Extract

**Step 1: Upload image to Firebase Storage**

```typescript
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const uploadDealImage = async (imageUri: string): Promise<string> => {
  // Get filename
  const filename = `deals/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  
  // Upload to Firebase Storage
  const reference = storage().ref(filename);
  await reference.putFile(imageUri);
  
  // Get download URL
  const url = await reference.getDownloadURL();
  return url;
};

// Usage:
const image = await ImagePicker.launchImageLibraryAsync();
const imageUrl = await uploadDealImage(image.uri);
```

**Step 2: Call Cloud Function to extract deal**

```typescript
import functions from '@react-native-firebase/functions';

const extractDealFromImage = async (
  imageUrl: string,
  venueId?: string,
  location?: { latitude: number; longitude: number }
) => {
  const extractDeal = functions().httpsCallable('extractDealFromImage');
  
  try {
    const result = await extractDeal({
      imageUrl,
      venueId: venueId || null,
      location: location || null,
    });
    
    if (result.data.success) {
      // Deal created successfully!
      return result.data.deal;
    } else {
      throw new Error(result.data.error);
    }
  } catch (error) {
    console.error('Error extracting deal:', error);
    throw error;
  }
};

// Usage:
const deal = await extractDealFromImage(imageUrl, venueId, userLocation);
console.log('Deal created:', deal);
```

---

## Authentication

### Sign Up / Sign In

```typescript
import auth from '@react-native-firebase/auth';

// Sign up
const signUp = async (email: string, password: string, username: string) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  
  // Create user profile in Firestore
  await firestore().collection('users').doc(userCredential.user.uid).set({
    id: userCredential.user.uid,
    username,
    email,
    uploadedDealIds: [],
    votedDealIds: [],
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  
  return userCredential.user;
};

// Sign in
const signIn = async (email: string, password: string) => {
  return await auth().signInWithEmailAndPassword(email, password);
};

// Sign out
const signOut = async () => {
  return await auth().signOut();
};

// Get current user
const getCurrentUser = () => {
  return auth().currentUser;
};
```

---

## Voting on Deals

**Note:** Voting is handled via Cloud Function (backend team will implement)

```typescript
// This will be available once backend implements voteOnDeal function
const voteOnDeal = async (dealId: string, voteType: 'upvote' | 'downvote') => {
  const vote = functions().httpsCallable('voteOnDeal');
  
  try {
    const result = await vote({
      dealId,
      voteType,
    });
    
    return result.data;
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
};
```

---

## Data Types Reference

See `shared-schemas.ts` for complete TypeScript types:

```typescript
// Import types
import { FirestoreDeal, FirestoreVenue, FirestoreUser } from '../shared-schemas';

// Use in your components
const DealCard: React.FC<{ deal: FirestoreDeal }> = ({ deal }) => {
  return (
    <View>
      <Text>{deal.restaurantName}</Text>
      <Text>{deal.extractedData.deals[0].name}</Text>
      <Text>{deal.extractedData.deals[0].price}</Text>
    </View>
  );
};
```

---

## Common Patterns

### 1. Pagination

```typescript
const getDealsPage = async (lastDoc?: any, pageSize: number = 20) => {
  let query = firestore()
    .collection('deals')
    .where('active', '==', true)
    .orderBy('votes.upvotes', 'desc')
    .limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  const deals = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    deals,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
};
```

### 2. Search by Restaurant Name

```typescript
const searchDeals = async (searchTerm: string) => {
  const lowerSearch = searchTerm.toLowerCase();
  
  const snapshot = await firestore()
    .collection('deals')
    .where('active', '==', true)
    .where('_searchRestaurant', '>=', lowerSearch)
    .where('_searchRestaurant', '<=', lowerSearch + '\uf8ff')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
```

### 3. Get Deals Active Right Now

```typescript
const getActiveNowDeals = async () => {
  const snapshot = await firestore()
    .collection('deals')
    .where('active', '==', true)
    .where('verified', '==', true)
    .where('_isActiveNow', '==', true)
    .orderBy('votes.upvotes', 'desc')
    .limit(20)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
```

---

## Error Handling

```typescript
try {
  const deals = await getActiveDeals();
  setDeals(deals);
} catch (error) {
  if (error.code === 'permission-denied') {
    console.error('User does not have permission to read deals');
  } else if (error.code === 'unavailable') {
    console.error('Firebase service is unavailable');
  } else {
    console.error('Error fetching deals:', error);
  }
}
```

---

## Testing with Firebase Emulator

When backend team runs emulators locally:

```typescript
// In your app, connect to emulator (development only)
if (__DEV__) {
  // Android emulator
  firestore().settings({
    host: '10.0.2.2:8080',
    ssl: false,
  });
  
  // iOS simulator
  // firestore().settings({
  //   host: 'localhost:8080',
  //   ssl: false,
  // });
}
```

---

## Questions for Backend Team

1. What's the Firebase project ID?
2. Can we get `google-services.json` and `GoogleService-Info.plist`?
3. What security rules are configured? (so we know what we can read/write)
4. Are Cloud Functions deployed? What's the function region?
5. Can we test with Firebase Emulator locally?

