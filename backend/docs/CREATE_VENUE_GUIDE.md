# Creating a Venue Document - Step by Step Guide

## In Firestore Emulator UI

### Step 1: Start New Collection
1. In the Emulator UI (http://127.0.0.1:4000/firestore)
2. Click **"Start collection"** button (or link)

### Step 2: Collection ID
- Enter: `venues`
- Click **"Next"**

### Step 3: Document ID
- Click **"Auto ID"** (or use Auto ID button)
- Click **"Next"**

### Step 4: Add Fields One by One

#### Field 1: `name` (string)
- Click **"Add field"**
- Field name: `name`
- Type: **string**
- Value: `Joe's Bar & Grill`
- Click **"Save"**

#### Field 2: `address` (map/object)
- Click **"Add field"**
- Field name: `address`
- Type: **map** (or **object**)
- Inside the map, click **"Add field"** or **"+"**:
  
  **Sub-field 1: `street`**
  - Field name: `street`
  - Type: **string**
  - Value: `4001 E Anaheim St`
  - Click **"Save"**
  
  **Sub-field 2: `city`**
  - Click **"Add field"** (inside the map)
  - Field name: `city`
  - Type: **string**
  - Value: `Long Beach`
  - Click **"Save"**
  
  **Sub-field 3: `state`**
  - Click **"Add field"** (inside the map)
  - Field name: `state`
  - Type: **string**
  - Value: `CA`
  - Click **"Save"**
  
  **Sub-field 4: `zip`**
  - Click **"Add field"** (inside the map)
  - Field name: `zip`
  - Type: **string**
  - Value: `90804`
  - Click **"Save"**

#### Field 3: `fullAddress` (string)
- Click **"Add field"** (back at top level, not inside address map)
- Field name: `fullAddress`
- Type: **string**
- Value: `4001 E Anaheim St, Long Beach, CA 90804`
- Click **"Save"**

#### Field 4: `latitude` (number)
- Click **"Add field"**
- Field name: `latitude`
- Type: **number**
- Value: `33.785421`
- Click **"Save"**

#### Field 5: `longitude` (number)
- Click **"Add field"**
- Field name: `longitude`
- Type: **number**
- Value: `-118.149881`
- Click **"Save"**

#### Field 6: `dealIds` (array)
- Click **"Add field"**
- Field name: `dealIds`
- Type: **array**
- Leave empty for now (or add deal IDs if you have them)
- Click **"Save"**

#### Field 7: `createdAt` (timestamp)
- Click **"Add field"**
- Field name: `createdAt`
- Type: **timestamp**
- Click the timestamp button/icon to set current time
- Click **"Save"**

#### Field 8: `_activeDealCount` (number, optional)
- Click **"Add field"**
- Field name: `_activeDealCount`
- Type: **number**
- Value: `0`
- Click **"Save"**

#### Field 9: `claimedBy` (string, optional)
- Click **"Add field"**
- Field name: `claimedBy`
- Type: **string**
- Value: leave empty or set to `null` (or a user ID if business owner claimed it)
- Click **"Save"**

---

## Complete Venue Document Structure

Your venue document should look like this:

```
Collection: venues
Document ID: [auto-generated]

Fields:
├── name: "Joe's Bar & Grill"
├── address (map):
│   ├── street: "4001 E Anaheim St"
│   ├── city: "Long Beach"
│   ├── state: "CA"
│   └── zip: "90804"
├── fullAddress: "4001 E Anaheim St, Long Beach, CA 90804"
├── latitude: 33.785421
├── longitude: -118.149881
├── dealIds: [] (empty array)
├── createdAt: [timestamp - current time]
├── _activeDealCount: 0
└── claimedBy: null (or empty)
```

---

## Quick Alternative: Simple Venue

If you want a simpler version first:

1. Collection: `venues`
2. Auto ID
3. Add only these fields:
   - `name` (string): `Test Venue`
   - `latitude` (number): `33.785`
   - `longitude` (number): `-118.149`
   - `dealIds` (array): `[]` (empty)
   - `createdAt` (timestamp): current time

This simpler version still validates your structure!

---

## Test Data from `fake_venues.json`

You can also use data from the test file `temp-repo/fake_venues.json`:

**Example Venue:**
- name: "Echo Hall"
- latitude: 33.785421
- longitude: -118.149881
- address: { street: "4001 E Anaheim St", city: "Long Beach", state: "CA", zip: "90804" }

---

## What This Tests

Creating a venue document verifies:
- ✅ Nested objects (address map) work correctly
- ✅ Geolocation fields (latitude/longitude) for nearby queries
- ✅ Arrays (dealIds) work properly
- ✅ Data structure matches your schema
- ✅ Your venues collection is ready for frontend queries

---

## After Creating Venue

Once you create a venue:
1. ✅ You'll see it in the `venues` collection list
2. ✅ You can click on it to view details
3. ✅ You can link deals to it (using `venueId` in deals)
4. ✅ Frontend can query venues by location

---

## Next: Link Deal to Venue

After creating a venue:
1. Note the venue's document ID (e.g., `abc123`)
2. Create or edit a deal document
3. Add field: `venueId` (string) = the venue's document ID
4. Now the deal is linked to the venue!

---

## Success! 🎉

Once you create a venue document, you've verified:
- ✅ Venues collection works
- ✅ Nested objects (address) work
- ✅ Geolocation data ready for nearby queries
- ✅ Database structure is complete

Your backend now has both `deals` and `venues` collections working! 🚀

