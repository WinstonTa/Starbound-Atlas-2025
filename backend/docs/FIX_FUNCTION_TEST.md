# Fix: Testing Callable Function Correctly

## The Issue

The error shows: `"Request body is missing data."`

This happens because `functions.https.onCall()` expects data in a specific format.

---

## Correct Way to Call the Function

### In Functions Shell:

The function is a **callable function** (`https.onCall`), so in the shell, you need to wrap the data:

```javascript
extractDealFromImage({data: {imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu", location: {latitude: 33.785, longitude: -118.149}}, auth: {uid: "test-user-123"}})
```

**Note:** The `data` parameter needs to be wrapped in `{data: {...}}`

---

## Alternative: Test Directly with Data Object

Try this format:

```javascript
extractDealFromImage({data: {imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu", location: {latitude: 33.785, longitude: -118.149}}, auth: {uid: "test-user-123"}})
```

Or simpler (Functions Shell might auto-wrap):

```javascript
extractDealFromImage({imageUrl: "https://via.placeholder.com/400x600/0000FF/FFFFFF?text=Test+Menu", location: {latitude: 33.785, longitude: -118.149}}, {auth: {uid: "test-user-123"}})
```

---

## Better: Create a Test Script

Let's create a proper test script instead.

