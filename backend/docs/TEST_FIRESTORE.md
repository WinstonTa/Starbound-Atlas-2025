# Testing Firestore Emulator - Step by Step

## What You're Seeing

You're in the Firestore Emulator UI. This is a local version of your database where you can test everything without affecting production.

---

## Test 1: Create a Test Deal Document

Let's create a test deal to verify your database structure works!

### Step 1: Start Collection
1. Click **"Start collection"** button (or the "Start collection" link)

### Step 2: Collection ID
- Enter: `deals`
- Click **"Next"**

### Step 3: Document ID
- Click **"Auto ID"** (or click the Auto ID button)
- Click **"Next"**

### Step 4: Add Fields
Add these fields one by one:

#### Field 1: `active` (boolean)
- Field name: `active`
- Type: Select **boolean**
- Value: `true`
- Click **"Save"**

#### Field 2: `verified` (boolean)
- Click **"Add field"**
- Field name: `verified`
- Type: **boolean**
- Value: `true`
- Click **"Save"**

#### Field 3: `restaurantName` (string)
- Click **"Add field"**
- Field name: `restaurantName`
- Type: **string**
- Value: `Test Restaurant`
- Click **"Save"**

#### Field 4: `venueId` (string)
- Click **"Add field"**
- Field name: `venueId`
- Type: **string**
- Value: `venue_test_123`
- Click **"Save"**

#### Field 5: `userId` (string)
- Click **"Add field"**
- Field name: `userId`
- Type: **string**
- Value: `user_test_456`
- Click **"Save"**

#### Field 6: `imageUrl` (string)
- Click **"Add field"**
- Field name: `imageUrl`
- Type: **string**
- Value: `https://example.com/test-image.jpg`
- Click **"Save"`

#### Field 7: `votes` (map/object)
- Click **"Add field"**
- Field name: `votes`
- Type: Select **map** (or **object**)
- Click inside the map to add sub-fields:
  - Click "+" or "Add field"
  - Field name: `upvotes`
  - Type: **number**
  - Value: `5`
  - Click **"Save"**
  - Add another field:
    - Field name: `downvotes`
    - Type: **number**
    - Value: `1`
    - Click **"Save"`

#### Field 8: `extractedData` (map/object)
- Click **"Add field"**
- Field name: `extractedData`
- Type: **map** (or **object**)
- Inside the map, add:
  - `restaurantName` (string): `Test Restaurant`
  - `deals` (array): Click "Add field" → Type: **array** → Click "+" → Type: **map** → Add:
    - `name` (string): `Test Margarita`
    - `price` (string): `$5`
    - `description` (string): `Test description`
  - `timeFrames` (array): Click "Add field" → Type: **array** → Click "+" → Type: **map** → Add:
    - `startTime` (string): `17:00`
    - `endTime` (string): `19:00`
    - `days` (array): `["monday", "tuesday"]`

#### Field 9: `createdAt` (timestamp)
- Click **"Add field"**
- Field name: `createdAt`
- Type: **timestamp**
- Click the timestamp button to set current time
- Click **"Save"**

---

## What This Tests

Creating this test document verifies:
- ✅ Your database structure is correct
- ✅ Security rules work (you can create documents)
- ✅ Data types match your schema
- ✅ Nested objects (votes, extractedData) work
- ✅ Arrays work correctly

---

## Test 2: Query the Data

After creating the document:

1. You should see it in the list on the left
2. Click on it to view details
3. Try editing fields (click on values to edit)
4. Try adding more fields

---

## Test 3: Check Security Rules

Your security rules say:
- Anyone can read active, verified deals ✅
- Only authenticated users can create deals

Since emulators bypass some security for testing, you can create documents. In production, these rules will apply.

---

## Test 4: Create a Venue Document

Let's also test the venues collection:

1. Click **"Start collection"**
2. Collection ID: `venues`
3. Auto ID for document
4. Add fields:
   - `name` (string): `Test Venue`
   - `address` (map):
     - `street` (string): `123 Test St`
     - `city` (string): `Test City`
     - `state` (string): `CA`
     - `zip` (string): `12345`
   - `latitude` (number): `33.785`
   - `longitude` (number): `-118.149`
   - `dealIds` (array): `[]` (empty array)
   - `createdAt` (timestamp): current time

---

## What Success Looks Like

After creating test documents:
- ✅ You can see documents in the collection list
- ✅ You can click on documents to view details
- ✅ Fields display correctly
- ✅ Nested objects (maps) display properly
- ✅ Arrays show with items

---

## Next: Test Your Cloud Function

Once you've tested Firestore, you can test your Cloud Function:

1. Go to **"Functions"** tab in Emulator UI
2. You should see `extractDealFromImage` function listed
3. You can call it from there (when AI service is ready)

---

## Quick Summary

**In Firestore Emulator:**
1. Create test `deal` document with all fields
2. Create test `venue` document
3. Verify data displays correctly
4. Test that your structure matches `FIRESTORE_STRUCTURE.md`

This proves your backend database is working! 🎉

