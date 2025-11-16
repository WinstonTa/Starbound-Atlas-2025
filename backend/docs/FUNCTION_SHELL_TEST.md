# Correct Way to Test extractDealFromImage in Functions Shell

## The Error You Got

```
"Request body is missing data."
```

This happens because callable functions expect data in a specific format.

---

## Solution: Correct Function Shell Syntax

### In Functions Shell, use this format:

```javascript
extractDealFromImage(
  {
    imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu",
    location: {
      latitude: 33.785,
      longitude: -118.149
    }
  },
  {
    auth: {
      uid: "test-user-123"
    }
  }
)
```

**Key points:**
- Pass data as first argument (direct object, not wrapped)
- Pass context with auth as second argument
- Functions Shell automatically handles `https.onCall` format

---

## Step-by-Step:

### 1. Start Functions Shell

```bash
cd "/Applications/Happy Hour"
npx firebase functions:shell
```

### 2. Copy-Paste This (All One Line):

```javascript
extractDealFromImage({imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu", location: {latitude: 33.785, longitude: -118.149}}, {auth: {uid: "test-user-123"}})
```

### 3. Press Enter

---

## What Should Happen:

1. **Function executes:**
   - Downloads image (or processes URL)
   - Calls AI service at `http://localhost:8000/parse-menu`
   - Converts AI response to Firestore format
   - Saves deal to Firestore
   - Returns deal data

2. **You see output:**
   - Success message with deal data
   - Or error message if something fails

3. **Check results:**
   - Firestore Emulator: New deal document in `/deals` collection
   - Function Logs: See detailed execution logs

---

## Alternative: Test Just the Data Conversion

If you want to test without calling AI service, we can modify the function temporarily to mock the AI response.

---

## Try This Now:

In Functions Shell, try:

```javascript
extractDealFromImage({imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu", location: {latitude: 33.785, longitude: -118.149}}, {auth: {uid: "test-user-123"}})
```

**Copy this entire line and paste in Functions Shell, then press Enter.**

Let me know what happens! 🚀

