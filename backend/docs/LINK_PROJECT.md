# Linking Your Project to the Correct Firebase Account

## Step 1: Log in with Correct Account

Run this in terminal:
```bash
npx firebase login
```

This opens a browser. Make sure you:
1. Select the Google account that has `happy-hour-mvp` project
2. Authorize Firebase CLI
3. Wait for terminal to say "Login successful"

## Step 2: Verify Projects

After logging in, check if you see your project:
```bash
npx firebase projects:list
```

You should now see:
- `happy-hour-mvp` (with Project ID like `happy-hour-mvp-xxxxx`)

## Step 3: Link to Your Project

Once you see `happy-hour-mvp` in the list, link it:

```bash
npx firebase use happy-hour-mvp-xxxxx
```

Replace `happy-hour-mvp-xxxxx` with the actual Project ID from the list.

Or if you want to add it as default:
```bash
npx firebase use --add
```

Then select `happy-hour-mvp` from the list.

## Step 4: Verify Link

Check which project is linked:
```bash
npx firebase use
```

It should show: `happy-hour-mvp-xxxxx`

## Step 5: Re-enable Services

Now that you're linked to the correct project, you need to:
1. Enable Firestore in Firebase Console (if not done yet)
2. Enable Authentication in Firebase Console (if not done yet)
3. Deploy security rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

---

## Troubleshooting

**"I don't see happy-hour-mvp in the list"**
- Make sure you logged in with the correct Google account
- The project might be in a different account
- Check Firebase Console to verify which account has the project

**"How do I know which account has the project?"**
- In Firebase Console (browser), check top-right corner
- The account name/email shows which account you're using
- Use that same account to log in with CLI

---

## Quick Summary

1. Run `npx firebase login` (select correct account)
2. Run `npx firebase projects:list` (verify you see happy-hour-mvp)
3. Run `npx firebase use happy-hour-mvp-xxxxx` (link to project)
4. Enable services in Console (if needed)
5. Deploy rules

