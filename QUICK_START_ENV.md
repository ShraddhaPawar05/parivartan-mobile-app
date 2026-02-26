# 🚀 Quick Start - Environment Variables

## First Time Setup (5 minutes)

### 1. Copy Template
```bash
cp .env.example .env
```

### 2. Get Firebase Config
1. Go to https://console.firebase.google.com/
2. Select project: `parivartan-3a3db`
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" → Web app
5. Copy the config values

### 3. Get Cloudinary Config
1. Go to https://cloudinary.com/console
2. Copy **Cloud Name** from dashboard
3. Go to Settings → Upload → Upload Presets
4. Copy preset name (or create unsigned preset)

### 4. Fill .env
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### 5. Start App
```bash
npx expo start --clear
```

---

## Troubleshooting

### App won't start?
```bash
# Clear cache and restart
npx expo start --clear
```

### Firebase not connecting?
- Check all 6 Firebase variables are filled
- Verify no extra spaces in .env
- Restart Expo server

### Cloudinary uploads failing?
- Verify cloud name is correct
- Ensure upload preset is "unsigned"
- Check preset name matches exactly

---

## Security Rules

✅ DO:
- Keep `.env` file locally only
- Use `.env.example` as template
- Share credentials securely (encrypted)

❌ DON'T:
- Commit `.env` to Git
- Share credentials in public channels
- Push `.env` to GitHub

---

## Quick Commands

```bash
# Copy template
cp .env.example .env

# Check what's ignored
git status

# Start with clean cache
npx expo start --clear

# Verify environment
node -e "console.log(process.env.EXPO_PUBLIC_FIREBASE_API_KEY)"
```

---

## Need Help?

1. Read `ENVIRONMENT_SETUP.md` for detailed guide
2. Check `SECURITY_CHECKLIST.md` for verification
3. Run verification: Import `src/utils/verifyEnv.ts` in App.tsx

---

**Remember: NEVER commit .env file!** 🔒
