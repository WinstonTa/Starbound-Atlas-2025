# Testing Cloud Function - extractDealFromImage

## Current Status

### ✅ What We've Done:
- Created Cloud Function code (`functions/extractDealFromImage.js`)
- Function code is complete and ready
- Function loads successfully in emulator (you can see it in terminal output)

### ❌ What We Haven't Tested Yet:
- **Cloud Function execution** - Haven't actually called/run the function
- **AI team's API call** - Haven't tested calling `/parse-menu` endpoint
- **Full integration flow** - Haven't tested end-to-end

---

## Why We Haven't Tested Yet

### Requirements for Testing:

1. **AI Team's FastAPI Service Must Be Running**
   - Their service needs to be at: `http://localhost:8000/parse-menu`
   - If their service isn't running, our function will fail

2. **Test Image in Firebase Storage**
   - Need to upload a test menu image
   - Function needs the image URL from Storage

3. **Function Call**
   - Need to call the function with proper parameters

---

## How to Test the Cloud Function

### Step 1: Start AI Team's FastAPI Service

**Prerequisites:**
- AI team's service needs to be running
- Should be accessible at: `http://localhost:8000`

**If AI team's service is running:**
```bash
# They should have this running:
cd temp-repo/ai/gemini_parser
uvicorn main:app --reload
# Service runs at http://localhost:8000
```

**Check if it's running:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

---

### Step 2: Ensure Emulators Are Running

Your emulators should already be running:
```bash
npx firebase emulators:start
```

You should see:
```
✔  functions[us-central1-extractDealFromImage]: http function initialized
```

---

### Step 3: Upload Test Image to Storage Emulator

**Option A: Using Firebase Console (Emulator UI)**

1. Go to Emulator UI: http://127.0.0.1:4000
2. Click **"Storage"** tab
3. Click **"Upload file"** (if available)
4. Upload a test menu image
5. Note the file path/URL

**Option B: Using Firebase CLI**

```bash
# Upload test image to Storage emulator
# First, put a test image in your project folder
# Then use Firebase CLI to upload (if supported in emulator)
```

**Option C: Create Test Image URL**

For testing, you can:
1. Use a public image URL
2. Or create a mock Storage URL for testing

---

### Step 4: Call the Cloud Function

#### Method 1: Using Emulator UI

1. Go to http://127.0.0.1:4000
2. Click **"Functions"** tab
3. Find `extractDealFromImage` function
4. Click on it to open details
5. Click **"Trigger"** or **"Call function"**
6. Enter test data:
   ```json
   {
     "imageUrl": "https://example.com/test-menu.jpg",
     "venueId": null,
     "location": {
       "latitude": 33.785,
       "longitude": -118.149
     }
   }
   ```
7. Click **"Execute"**

#### Method 2: Using HTTP Request (cURL)

```bash
# Get your auth token first (for production, or use emulator)
# Then call the function:

curl -X POST \
  http://127.0.0.1:5002/happy-hour-mvp/us-central1/extractDealFromImage \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "imageUrl": "https://example.com/test-menu.jpg",
      "venueId": null,
      "location": {
        "latitude": 33.785,
        "longitude": -118.149
      }
    }
  }'
```

#### Method 3: Using Firebase Functions Shell

```bash
# In a new terminal (keep emulators running in first terminal)
cd "/Applications/Happy Hour"
npx firebase functions:shell

# Then in the shell:
extractDealFromImage({
  imageUrl: "https://example.com/test-menu.jpg",
  location: { latitude: 33.785, longitude: -118.149 }
})
```

---

### Step 5: Verify the Function Calls AI Service

**Check Function Logs:**

1. In Emulator UI → Functions tab
2. Look for `extractDealFromImage` function
3. Click on it to see logs
4. You should see:
   - Function execution started
   - "Downloading image from Storage..."
   - "Calling AI service: http://localhost:8000/parse-menu"
   - "AI service returned: {...}"
   - "Deal created successfully"

**Check AI Service Logs:**

In AI team's terminal (where FastAPI is running), you should see:
- POST request received at `/parse-menu`
- Image processing
- Response sent back

---

## Testing Scenarios

### Scenario 1: AI Service Not Running

**What happens:**
- Function tries to call `http://localhost:8000/parse-menu`
- Connection refused error
- Function returns error to frontend

**Expected result:**
```json
{
  "success": false,
  "error": "Failed to call AI service: connect ECONNREFUSED..."
}
```

### Scenario 2: AI Service Running with Valid Image

**What happens:**
1. Function downloads image from Storage
2. Sends image to AI service
3. AI service returns parsed data
4. Function converts format
5. Saves to Firestore
6. Returns deal to caller

**Expected result:**
```json
{
  "success": true,
  "deal": {
    "id": "deal_abc123",
    "restaurantName": "Joe's Bar",
    "extractedData": {
      "deals": [{"name": "Margarita", "price": "$5"}],
      "timeFrames": [...]
    },
    ...
  },
  "aiResult": {...}
}
```

### Scenario 3: Invalid Image URL

**What happens:**
- Function can't download image from Storage
- Returns error

**Expected result:**
```json
{
  "success": false,
  "error": "Failed to download image: ..."
}
```

---

## Quick Test Without AI Service

**Mock the AI Service Call:**

You can temporarily modify the function to return mock data:

```javascript
// In extractDealFromImage.js, temporarily replace:
const aiResult = await callAIService(imageBuffer, 'menu.jpg');

// With:
const aiResult = {
  restaurant_name: "Test Restaurant",
  deals: [
    { name: "Test Margarita", price: "$5", description: "Test deal" }
  ],
  time_frame: [
    { start_time: "4:00 PM", end_time: "7:00 PM", days: ["Monday", "Tuesday"] }
  ],
  special_conditions: ["Dine-in only"]
};
```

This lets you test the function flow without AI service running.

---

## Complete Testing Checklist

### Function Code:
- [ ] Function loads without errors
- [ ] Function parameters validated correctly
- [ ] Error handling works

### AI Integration:
- [ ] AI service is running
- [ ] Function calls AI service successfully
- [ ] AI service returns valid data
- [ ] Data conversion works (AI format → Firestore format)

### Storage Integration:
- [ ] Image uploads to Storage
- [ ] Function downloads image from Storage
- [ ] Image sent to AI service correctly

### Firestore Integration:
- [ ] Deal document created in Firestore
- [ ] Deal linked to venue (if venueId provided)
- [ ] Deal linked to user (from auth context)
- [ ] All fields saved correctly

### Full Flow:
- [ ] Frontend uploads image → Storage ✅
- [ ] Frontend calls function → extractDealFromImage ✅
- [ ] Function downloads image ✅
- [ ] Function calls AI service ✅
- [ ] AI returns data ✅
- [ ] Function saves to Firestore ✅
- [ ] Function returns deal to frontend ✅

---

## Current Testing Status

### ✅ Tested:
- Firestore collections (deals, venues created successfully)
- Database structure works
- Security rules work

### ⏳ Not Yet Tested:
- Cloud Function execution
- AI service API call
- Image download from Storage
- Full integration flow

---

## Next Steps to Test

1. **Coordinate with AI Team:**
   - Ask if their FastAPI is running
   - Get the service URL
   - Test their endpoint directly first:
     ```bash
     curl -X POST http://localhost:8000/parse-menu \
       -F "file=@test-menu.jpg"
     ```

2. **Test Function in Emulator:**
   - Use Emulator UI to call function
   - Check logs for errors
   - Verify Firestore document created

3. **Test End-to-End:**
   - Upload image → Storage
   - Call function
   - Verify deal in Firestore
   - Check all data is correct

---

## Summary

**Current Status:**
- ✅ Function code written and loads successfully
- ❌ Function execution not yet tested
- ❌ AI service call not yet tested

**To Test:**
1. Ensure AI service is running
2. Call function via Emulator UI or cURL
3. Check logs and Firestore for results

**The function is ready to test - we just need the AI service running!** 🚀

