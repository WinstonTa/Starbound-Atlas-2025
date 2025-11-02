# How to Test Cloud Function - extractDealFromImage

## Methods to Test the Function

Since the Emulator UI only shows logs (no test button), here are ways to test:

---

## Method 1: Firebase Functions Shell (Recommended)

### Step 1: Start Functions Shell

In a **new terminal** (keep emulators running in first terminal):

```bash
cd "/Applications/Happy Hour"
npx firebase functions:shell
```

### Step 2: Call the Function

Once in the shell, you'll see a prompt. Type:

```javascript
extractDealFromImage({
  imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu",
  venueId: null,
  location: { latitude: 33.785, longitude: -118.149 },
  restaurantName: null
})
```

**Note:** The function requires authentication. In emulator, you might need to mock auth context.

**Alternative (with auth context):**
```javascript
extractDealFromImage({
  imageUrl: "https://example.com/test.jpg"
}, {
  auth: { uid: "test-user-123" }
})
```

### Step 3: Check Results

- Function output will show in the shell
- Check Emulator UI → Functions → Logs for detailed logs
- Check Firestore emulator for new deal document

---

## Method 2: Test via HTTP (If Function Exposes HTTP Endpoint)

The function is a **callable function** (not HTTP), so this might not work directly. But if it's exposed as HTTP:

```bash
curl -X POST \
  http://127.0.0.1:5002/happy-hour-mvp/us-central1/extractDealFromImage \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "imageUrl": "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu",
      "location": {
        "latitude": 33.785,
        "longitude": -118.149
      }
    }
  }'
```

---

## Method 3: Create a Test Script

### Create `test-function-simple.js`:

```javascript
// Simple test script
const admin = require('firebase-admin');

// Initialize with emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

admin.initializeApp();

// Import your function (if it can be imported directly)
// Or call via HTTP

const testData = {
  imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu",
  location: { latitude: 33.785, longitude: -118.149 }
};

console.log("Test data:", testData);
console.log("Note: This requires the function to be callable via admin SDK");
```

---

## Method 4: Test AI Service Directly First

Before testing the full function, test if AI service works:

### Check if AI Service is Running:

```bash
curl http://localhost:8000/health
```

**Expected:** `{"status":"healthy"}`

### Test AI Service with Image:

```bash
# First, download a test image or use one you have
curl -X POST http://localhost:8000/parse-menu \
  -F "file=@/path/to/test-menu.jpg"
```

**Expected:** JSON response with parsed deal data

---

## Method 5: Check Function Logs (What's Happening)

Even without calling the function, you can:

1. Go to Emulator UI: http://127.0.0.1:4000
2. Click **"Functions"** tab
3. Click on `extractDealFromImage`
4. Click **"Logs"** tab

This shows:
- When function was loaded
- Function definition
- Any errors in function code

---

## Testing Checklist

### Prerequisites:
- [ ] Emulators are running (`npx firebase emulators:start`)
- [ ] AI service is running (`http://localhost:8000` accessible)
- [ ] Test image URL available (or mock URL)

### Steps:
1. [ ] Test AI service directly (curl to `/parse-menu`)
2. [ ] Use Functions Shell to call `extractDealFromImage`
3. [ ] Check function logs in Emulator UI
4. [ ] Verify deal created in Firestore emulator
5. [ ] Verify all data fields are correct

---

## Common Issues

### "Function requires authentication"
- In emulator, you might need to mock auth context
- Or the function needs to be called with auth token
- Try: `functions:shell` with auth context

### "AI service connection refused"
- AI service isn't running at `http://localhost:8000`
- Start AI service: `cd temp-repo/ai/gemini_parser && uvicorn main:app --reload`

### "Image download failed"
- Storage emulator might not be set up correctly
- Use a public image URL for testing
- Or mock the Storage download

---

## Quick Test: Functions Shell

**Easiest way to test:**

```bash
# Terminal 1: Keep emulators running
npx firebase emulators:start

# Terminal 2: Open Functions Shell
cd "/Applications/Happy Hour"
npx firebase functions:shell

# In the shell:
extractDealFromImage({
  imageUrl: "https://via.placeholder.com/400.jpg",
  location: { latitude: 33.785, longitude: -118.149 }
}, { auth: { uid: "test-user" } })
```

---

## Summary

**The Emulator UI doesn't have a "Test" button for callable functions.**

**Best way to test:**
1. Use `firebase functions:shell`
2. Call function with test data
3. Check logs in Emulator UI
4. Check Firestore for results

**Let's try the Functions Shell method!** 🚀

