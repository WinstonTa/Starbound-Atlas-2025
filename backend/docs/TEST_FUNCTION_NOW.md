# Testing Function Right Now - Step by Step

## ✅ Great News: AI Service is Running!

Your curl test showed: `{"status":"healthy"}` - AI service is working!

---

## Step-by-Step Test Instructions

### Step 1: Keep Emulators Running

Make sure your emulators are still running in one terminal:
```
✔  All emulators ready!
```

If they stopped, restart:
```bash
cd "/Applications/Happy Hour"
npx firebase emulators:start
```

---

### Step 2: Open Functions Shell (New Terminal)

Open a **new terminal window/tab** (don't close emulators terminal):

```bash
cd "/Applications/Happy Hour"
npx firebase functions:shell
```

You should see a prompt like:
```
firebase > 
```

---

### Step 3: Call the Function

In the Functions Shell, type:

```javascript
extractDealFromImage({
  imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu",
  location: {
    latitude: 33.785,
    longitude: -118.149
  }
}, {
  auth: {
    uid: "test-user-123"
  }
})
```

**Press Enter**

---

### Step 4: Watch What Happens

You should see:
1. **In Functions Shell:**
   - Function execution starts
   - Output showing success or error
   - Deal data returned (if successful)

2. **In Emulator UI (http://127.0.0.1:4000/functions):**
   - Click on `extractDealFromImage` function
   - Click **"Logs"** tab
   - See detailed logs:
     - "Downloading image from Storage..."
     - "Calling AI service: http://localhost:8000/parse-menu"
     - "AI service returned: {...}"
     - "Deal created successfully"

3. **In Firestore Emulator:**
   - Go to Firestore tab
   - You should see a new document in `/deals` collection
   - Check if all fields are there

---

### Step 5: Verify Results

**Check Firestore:**
1. Go to http://127.0.0.1:4000/firestore
2. Look for `deals` collection
3. Find the new deal document
4. Verify it has:
   - `restaurantName`
   - `extractedData.deals`
   - `extractedData.timeFrames`
   - `active: true`
   - `userId: "test-user-123"`

**Check Function Output:**
- In Functions Shell, you should see:
  ```javascript
  {
    success: true,
    deal: {
      id: "...",
      restaurantName: "...",
      extractedData: {...},
      ...
    },
    aiResult: {...}
  }
  ```

---

## If You Get Errors

### Error: "User must be authenticated"
**Solution:** The auth context is needed. Make sure you included `auth: { uid: "test-user-123" }` in the call.

### Error: "AI service connection refused"
**Check:** Make sure AI service is running:
```bash
curl http://localhost:8000/health
```

### Error: "Failed to download image"
**Solution:** The image URL might not be accessible. Use a different test URL or mock Storage download.

---

## Expected Success Flow

```
1. Function receives call with imageUrl
   ↓
2. Function downloads image from URL (or Storage)
   ↓
3. Function calls AI service: POST http://localhost:8000/parse-menu
   ↓
4. AI service processes image
   ↓
5. AI service returns parsed data
   ↓
6. Function converts AI format → Firestore format
   ↓
7. Function saves deal to Firestore (/deals collection)
   ↓
8. Function returns deal data to caller
   ↓
9. Success! ✅
```

---

## Quick Copy-Paste Command

```bash
# In Functions Shell, copy and paste this:
extractDealFromImage({imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu", location: {latitude: 33.785, longitude: -118.149}}, {auth: {uid: "test-user-123"}})
```

---

## Next Steps After Testing

1. ✅ Verify function works end-to-end
2. ✅ Check AI service integration
3. ✅ Verify Firestore document created
4. ✅ Check all data fields are correct
5. ✅ Test with real menu image (if available)

---

## Ready to Test!

Since AI service is running, you can test the full integration now!

**Steps:**
1. Open Functions Shell: `npx firebase functions:shell`
2. Call function with test data
3. Check results in Emulator UI and Firestore

**Let me know what you see!** 🚀

